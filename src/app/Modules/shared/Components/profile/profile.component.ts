import { Component, OnInit } from '@angular/core';
import { BasicService } from '../../Services/basic.service';
import { AccountStatus, AccountType2, Collection, Comments, followers, InstagramProfile, Media, MediaType } from '../../Interfaces/shared';
import { ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ShowImgComponent } from '../show-img/show-img.component';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AddCommentsComponent } from '../add-comments/add-comments.component';
import { SocketService } from '../../Services/socket.service';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  public userID!: string | null;
  public user!: InstagramProfile;
  public media!: Media[];
  public reels!: Media[];
  public communitySection!: followers[];
  public followers!: followers[];
  public following!: followers[];
  filteredFollowingList: followers[] = [];
  public profileURL!: string | null;
  public username!: string | null;
  public extraDataFromRoute!: string | null;
  public collections: Collection[] = [];
  public addPicture: string = 'assets/camera-viewfinder.png';
  public searchPic: string = 'assets/searching.png';
  public explore: string = 'assets/search-heart.png';
  public video: string = 'assets/icons8-instagram-reels.png';
  public community: string = 'assets/users-medical.png';
  public noPicture: string = 'assets/NoPicture.png';
  public routedFileds!: boolean;
  private routerUserId!: string | null;
  public AccountType2 = AccountType2;
  public AccountStatus = AccountStatus;
  public selectedSection: string = 'posts';
  public showAllContent!: boolean;

  constructor(public service: BasicService, private route: ActivatedRoute, private cdr: ChangeDetectorRef, public dialog: MatDialog, public router: Router, private socketService: SocketService) {
    if (localStorage.getItem('userID') !== null) {
      this.userID = localStorage.getItem('userID');
    }
    if (localStorage.getItem('username') != null) {
      this.username = localStorage.getItem('username');
    }
    if (localStorage.getItem('profileURL') != null) {
      this.profileURL = localStorage.getItem('profileURL');
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.routerUserId = params.get('id');
      const finalUserId = this.routerUserId || this.userID;
      if(finalUserId != this.userID){
        this.routedFileds = true;
      }

      if (finalUserId) {
        this.fetchUserData(finalUserId);
      } else {
        console.error("No user ID available from route or local storage.");
      }
    });
  }

  isMultipleImages(media: string | File | File[]): boolean {
    return Array.isArray(media) && media.length > 1;
  }

  getMediaArray(media: string | File | File[]): File[] {
    if (Array.isArray(media)) {
      return media; 
    } else if (typeof media === 'string') {
      return [{ name: 'image', size: 0, type: 'image/*', lastModified: Date.now() } as File]; // Convert string to array format
    } else {
      return [media];
    }
  }

  getFileUrl(file: File | string): string {
    if (typeof file === 'string') {
      return file; 
    } else {
      return URL.createObjectURL(file); 
    }
  }


  checkUserInFollowingList(userId: string, accountType2: string): void {
    const user = this.following.find(f => f.userId === userId);

    if (accountType2 === AccountType2.PUBLIC) {
      this.showAllContent = true;
    } else if (accountType2 === AccountType2.PRIVATE) {
      if (user && user.follow_status == AccountStatus.Following) {
        this.showAllContent = true;
      } else {
        this.showAllContent = false;
      }
    } else {
      console.error("Invalid account type.");
    }
  }


  isLikedByCurrentUser(post: any): boolean {
    return post.likes_data.includes(this.userID);
  }

  public openProfileData(metaData: Media): void {
    const dialogRef = this.dialog.open(AddCommentsComponent, {
      width: '740px',
      height: '780px',
      disableClose: false,
      panelClass: 'custom-dialog-background'
    })

    dialogRef.componentInstance.media = metaData;
  }

  openDetailsDialog(collection: Collection) {
    const dialogRef = this.dialog.open(DetailsDialogComponent, {
      width: '440px',
      height: '760px',
      disableClose: false,
      panelClass: 'custom-dialog-background'
    })
    dialogRef.componentInstance.collection = collection;
    dialogRef.componentInstance.showCollection = true;
  }

  fetchUserData(userId: string) {
    if (this.extraDataFromRoute) {
      this.service.getCurrentUserData(userId).subscribe({
        next: (data: InstagramProfile) => {
          this.user = data;
          this.following = data.following_data;
          if (this.userID)
            this.checkUserInFollowingList(this.userID, this.user.account_type2)
          if (this.showAllContent) {
            this.media = data.media;
            this.followers = data.followers_data;
            this.following = data.following_data;
            this.collections = data.collections || []; 
            this.filteredFollowingList = this.following.filter(f => f.follow_status === 'following');
          }

        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        }
      });
    } else {
      this.service.getCurrentUserData(userId).subscribe({
        next: (data: InstagramProfile) => {
          this.user = data;
          this.media = data.media;
          this.followers = data.followers_data;
          this.following = data.following_data;
          this.collections = data.collections || [];
          this.filteredFollowingList = this.following.filter(f => f.follow_status === 'following');
          this.showAllContent = true;
        },
        error: (err) => {
          console.error('Error fetching user data:', err);
        }
      });
    }
  }

  selectSection(section: string) {
    this.selectedSection = section;
  }

  isLiked = false;
  likesCount = 0;
  floatingHearts: number[] = [];

  toggleLike(post: Media, index: number) {
    const mediaItem = this.media.find(item => item.media_id === post.media_id);
    
    if (!mediaItem || !this.userID) return;

    // Check if the post is already liked by the current user
    const wasLiked = this.isLikedByCurrentUser(mediaItem);

    // Toggle like state based on existing like status
    mediaItem.isLiked = !wasLiked;
    mediaItem.likes_count += mediaItem.isLiked ? 1 : -1;

    // Ensure floating hearts array exists
    mediaItem.floatingHearts = mediaItem.floatingHearts || [];

    // Manage likes_data array
    if (!mediaItem.likes_data) {
        mediaItem.likes_data = [];
    }

    if (mediaItem.isLiked) {
        this.createFloatingHeart(mediaItem);
        if (!mediaItem.likes_data.includes(this.userID)) {
            mediaItem.likes_data.push(this.userID);
        }
    } else {
        mediaItem.likes_data = mediaItem.likes_data.filter(id => id !== this.userID);
    }

    this.media = [...this.media];

    // Call API to update like/unlike status
    this.service.likePost(this.routerUserId || this.userID, post.media_id, this.userID).subscribe({
        next: () => {
            if (this.routerUserId) {
                this.socketService.sendNotification({
                    senderId: this.userID ? this.userID : '',
                    receiverId: this.routerUserId,
                    type: 'like',
                    message: `${this.username} liked your photo!`,
                    profile_pic: this.user.profile_picture_url || ''
                });
            }
        },
        error: (error) => {
            console.error('Error updating like status:', error);
            // Revert state on API failure
            mediaItem.isLiked = wasLiked;
            mediaItem.likes_count += wasLiked ? 1 : -1;
            this.media = [...this.media];
            if (this.userID) this.fetchUserData(this.userID);
        }
    });
}


  createFloatingHeart(post: Media) {
    const id = new Date().getTime(); // Unique ID for each heart
    post.floatingHearts?.push(id);

    // Manually trigger change detection
    this.cdr.detectChanges();

    // Remove heart after animation
    setTimeout(() => {
      if (post.floatingHearts) {
        post.floatingHearts = post.floatingHearts.filter(heartId => heartId !== id);
      }

      // Trigger change detection again to reflect UI updates
      this.cdr.detectChanges();
    }, 800);
  }

  toggleComments(post: Media) {
    post.showComments = !post.showComments;
  }

  openProfile(id: string, data: boolean): void {
    if (id === this.userID) {
      this.router.navigate(['/profile']); 
    } else {
      this.router.navigate(['/profile', id], { queryParams: { data: data } });
    }
  }

  addComment(post: Media, commentInput: HTMLInputElement) {
    const commentText = commentInput.value.trim();

    if (commentText) {
      if (!post.comments) {
        post.comments = []; // Ensure the comments array exists
      }

      const newComment: Comments = {
        comment_id: new Date().getTime().toString(), // Unique ID
        user_id: this.userID ? this.userID : '', // Fallback to empty string if userID is missing
        username: this.username ? this.username : "abc", // Default username if missing
        profile_pic: this.profileURL ? this.profileURL : '', // Default empty profile pic
        media_id: post.media_id,
        text: commentText,
        created_at: new Date(),
        likes_count: 0,
        replies: []
      };

      post.comments.push(newComment); // Add the new comment to the post
      commentInput.value = ""; // Clear the input field
    }
  }

  public openProfileCard(user: InstagramProfile) {
    if (!this.routedFileds) {
      const dialogRef = this.dialog.open(ShowImgComponent, {
        width: "400px",
        height: "440px",
        disableClose: false,
      })

      dialogRef.componentInstance.userData = user;
      dialogRef.componentInstance.postImage = false;

      dialogRef.afterClosed().subscribe({
        next: (result: {message: string, image: string}) => {
          if (this.userID && result){
            this.fetchUserData(this.userID);
            user.profile_picture_url = result.image;
          }
        },
        error: (err) => {
          console.error('Some error occured');
        }
      })
    }
  }

  generateUniqueId(): string {
    return "media_" + Math.random().toString(36).substr(2, 9);
  }


  uploadPicture(event: any) {
    const files: FileList = event.target.files;

    if (files.length > 0) {
      const selectedFiles: Media[] = Array.from(files).map((file) => ({
        media_id: this.generateUniqueId(),
        media_type: MediaType.IMAGE,
        caption: "",
        media_url: file,
        tempmedia_url: URL.createObjectURL(file),
        likes_count: 0,
        comments_count: 0,
        views_count: 0,
        created_at: new Date(),
        isLiked: false,
        floatingHearts: [],
        showComments: false,
        owner_id: this.userID ? this.userID : '',
        owner_name: this.username ? this.username : '',
        owner_profilePic: this.profileURL ? this.profileURL : '',
        comments: [],
      }));
      const dialogRef = this.dialog.open(ShowImgComponent, {
        width: '740px',
        height: '740px',
        disableClose: false,
        panelClass: 'custom-dialog-background'
      })

      dialogRef.componentInstance.postImage = true;
      dialogRef.componentInstance.imagesData = selectedFiles;
      dialogRef.componentInstance.followingData = this.following;

      dialogRef.afterClosed().subscribe({
        next: (result) => {
          this.ngOnInit();
        },
        error: () => {
          console.error('Some error occurred');
        }
      });
    }
  }

  navigator(): void {
    this.router.navigate(["search"])
  }

  deletePost(post: Media) {
    if (this.userID)
      this.service.deletePost(this.userID, post.media_id).subscribe({
        next: (data: InstagramProfile) => {
          this.media = data.media;
          if (this.userID)
            this.fetchUserData(this.userID)
        },
        error: (err) => {
          console.error('Error on deleting the profile', err);
        }
      })

  }

  // editPost(post: Media){
  //   if(this.userID)
  //     this.service.updatePostCaption(this.userID, post.media_id, ).subscribe({
  //   next: ()=> {

  //   }, 
  //   error: ()=>{

  //   }
  // })
  // }

  toggleFollow(person: InstagramProfile) {
    if (person.follow_status === AccountStatus.Follow || !person.follow_status) {
      person.follow_status = AccountStatus.Requested;

      // Send the follow request via API
      if (this.userID)
        this.service.sendFollowRequest(this.userID, person.instagram_id).subscribe(
          (response) => {
            setTimeout(() => {
              // Simulate request acceptance and change the status to 'Following'
              person.follow_status = AccountStatus.Following;
            }, 3000);  // 3 seconds delay (Simulating backend approval)
          },
          (error) => {
            console.error('Error sending follow request:', error);
            person.follow_status = AccountStatus.Follow;  // Revert status on error
          }
        );
    }
  }

  followPublicAccount(person: InstagramProfile) {
    if (person.follow_status !== AccountStatus.Following) {
      if (this.userID)
        this.service.sendFollowRequest(this.userID, person.instagram_id).subscribe(
          (response) => {
            setTimeout(() => {
              person.follow_status = AccountStatus.Following;
            }, 1000);  
          },
          (error) => {
            console.error('Error sending follow request:', error);
            person.follow_status = AccountStatus.Follow; 
          }
        );
    }
    else if (person.follow_status == AccountStatus.Following) {
      if (this.userID)
        this.service.sendUnFollowRequest(this.userID, person.instagram_id).subscribe(
          (response) => {
            setTimeout(() => {
              person.follow_status = AccountStatus.Following;
            }, 1000);  
          },
          (error) => {
            console.error('Error sending follow request:', error);
            person.follow_status = AccountStatus.Follow;  
          }
        );
    }
  }


}
