import { Component, OnInit } from '@angular/core';
import { BasicService } from '../../Services/basic.service';
import { AccountType2, followers, InstagramProfile, receiveSendMessages } from '../../Interfaces/shared';
import { AccountStatus } from '../../Interfaces/shared';
import { MOCK_INSTAGRAM_PROFILES } from '../../Interfaces/shared';
import { Router } from '@angular/router';
import { SocketService } from '../../Services/socket.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent implements OnInit {
  public peopleNearYouList: InstagramProfile[] = [];
  public searchQuery: string = ''; // Store search input
  public AccountStatus = AccountStatus;
  public AccountType2 = AccountType2;
  public userID!: string | null;
  public nopicture = 'assets/NoPicture.png'
  public chattedUserInfo: followers[] = [];
  public username!: string | null;
  public following_list!: followers[];
  public merge_list!: followers[];

  public peopleNearYouList2!: followers[];

  constructor(public bSc: BasicService, private router: Router, private socketService: SocketService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    if (localStorage.getItem('userID')) {
      this.userID = localStorage.getItem('userID');
    }
    if (localStorage.getItem('username')) {
      this.username = localStorage.getItem('username');
    }


    if (this.userID) {
      this.fetchCurrentUserData(this.userID);
      this.fetchAllFollowers(this.userID);
    }
  }

  public getPeopleNearYou() {
    this.bSc.getListOfAllPopleNearYou().subscribe({
      next: (result) => {
        this.peopleNearYouList = result;
        this.peopleNearYouList2 = this.checkUserAlreadyInFollowing();
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  public openChatOfPerson(id: string, metaData: string) {
    this.router.navigate(['/messages', id], {
      state: { metaData: metaData }
    });
  }


  openProfile(id: string, data: boolean): void {
    if (id === this.userID) {
      this.router.navigate(['/profile']); 
    } else {
      this.router.navigate(['/profile', id], { queryParams: { data: data } });
    }
  }

  fetchCurrentUserData(id: string) {
    this.bSc.getCurrentUserData(id).subscribe({
      next: (data: InstagramProfile) => {
        this.chattedUserInfo = data?.chatting_people || [];
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  fetchAllFollowers(id: string) {
    this.bSc.fetchFollowingList(id).subscribe({
      next: (data: followers[]) => {
        this.following_list = data || [];
        if (this.following_list) {
          this.getPeopleNearYou();
        }
      },
      error: (err) => {
        console.error('Some went wrong white fetching the user list');
      }
    })
  }

  public checkUserAlreadyInFollowing(): followers[] {
    if (!this.peopleNearYouList || !this.following_list) {
      console.warn("Data not available");
      return [];
    }

    const followingMap = new Map(
      this.following_list.map(user => [user.userId, user]) 
    );

    const formattedList: followers[] = this.peopleNearYouList.map(user => {
      const followingUser = followingMap.get(user.instagram_id); 
      return {
        username: user.username,
        userId: user.instagram_id,
        profilePic: user.profile_picture_url,
        follow_status: followingUser ? followingUser.follow_status : AccountStatus.Follow, 
        account_type2: user.account_type2 || AccountType2.PUBLIC, 
      };
    });

    return formattedList;
  }

  public filteredPeople(): followers[] {
    if (!this.searchQuery) {
      return this.peopleNearYouList2.filter(
        person => !this.following_list.some(following => following.userId === person.userId)
      );
    }

    const searchResults: followers[] = this.peopleNearYouList
      .filter(person =>
        person.username.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      .map(user => ({
        username: user.username,
        userId: user.instagram_id,
        profilePic: user.profile_picture_url,
        follow_status: user.follow_status || AccountStatus.Follow,
        account_type2: user.account_type2 || AccountType2.PUBLIC,
      }));

    const followingUsers: followers[] = this.following_list.map(user => ({
      ...user,
      follow_status: user.follow_status || AccountStatus.Following, 
    }));

    this.merge_list = [...searchResults, ...followingUsers];

    return Array.from(new Map(this.merge_list.map(item => [item.userId, item])).values());
  }

  public autoUpdateFollowStatus(person: followers): void {
    if (person.account_type2 === AccountType2.PRIVATE) {
      person.follow_status = AccountStatus.Requested; 
    }
  }

  toggleFollow(person: followers) {

    if (person.follow_status === AccountStatus.Follow || !person.follow_status) {
      if (this.userID) {
        this.bSc.sendFollowRequest(this.userID, person.userId).subscribe(
          (response: receiveSendMessages) => {

            const updatedUser = response.data.find(user => user.userId == person.userId);

            if (updatedUser) {
              person.follow_status = updatedUser.follow_status; 
            }

            this.filteredPeople();
            this.socketService.sendNotification({
              senderId: this.userID ? this.userID : '',
              receiverId: person.userId ? person.userId : '',
              type: 'follow',
              message: `${this.username} sent you a follow request!`,
              profile_pic: `${person.profilePic}`
            });
          },
          (error) => {
            console.error('Error sending follow request:', error);
          }
        );
      }
    }
  }

  followPublicAccount(person: followers, index: number) {
    if (!this.userID) return;

    const previousStatus = person.follow_status;
    person.follow_status =
      person.follow_status === AccountStatus.Following
        ? AccountStatus.Follow
        : AccountStatus.Following;

    let listIndex = -1;

    if (!this.searchQuery) {
      listIndex = this.peopleNearYouList2.findIndex(p => p.userId === person.userId);
      if (listIndex !== -1) this.peopleNearYouList2[listIndex].follow_status = person.follow_status;
    } else {
      const listsToUpdate = [this.merge_list, this.peopleNearYouList, this.following_list];

      listsToUpdate.forEach(list => {
        const index = list.findIndex(p => (p as followers).userId === person.userId || (p as InstagramProfile).instagram_id === person.userId);
        if (index !== -1) list[index].follow_status = person.follow_status;
      });
    }

    const followAction = previousStatus !== AccountStatus.Following
      ? this.bSc.sendFollowRequest(this.userID, person.userId)
      : this.bSc.sendUnFollowRequest(this.userID, person.userId);

    const notificationType = previousStatus !== AccountStatus.Following ? "follow" : "unfollow";
    const notificationMessage = previousStatus !== AccountStatus.Following
      ? `${this.username} started following you!`
      : `${this.username} unfollowed you!`;

    followAction.subscribe({
      next: (response) => {
        person.follow_status = previousStatus !== AccountStatus.Following ? AccountStatus.Following : AccountStatus.Follow;

        this.socketService.sendNotification({
          senderId: this.userID || '',
          receiverId: person.userId,
          type: notificationType,
          message: notificationMessage,
          profile_pic: person.profilePic || '',
        });
      },
      error: (error) => {
        console.error(`Error sending ${notificationType} request:`, error);
        person.follow_status = previousStatus;
        if (!this.searchQuery && listIndex !== -1) {
          this.peopleNearYouList2[listIndex].follow_status = previousStatus;
        } else if (this.searchQuery && listIndex !== -1) {
          this.merge_list[listIndex].follow_status = previousStatus;
        }
      },
    });
  }
}
