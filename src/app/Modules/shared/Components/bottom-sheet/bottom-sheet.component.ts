import { Component, Inject, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Collection, followers, InstagramProfile } from '../../Interfaces/shared';
import { BasicService } from '../../Services/basic.service';
import { FileType } from '../../Interfaces/shared';
import { SocketService } from '../../Services/socket.service';

@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss']
})
export class BottomSheetComponent implements OnInit{
  public userID!: string|null;
  public username!: string|null;
  public profileURL!: string|null;
  public data!: followers[];
  public showBookmark!: boolean;
  public imageData!: string;
  public imageMetaData!: any;
  public FileType = FileType;
  public chattedUserInfo: { username: string; userId: string }[] = [];
  public noPicture = 'assets/NoPicture.png'
  
  showBookmarkDialog = true;
  showCreateCollectionModal = false;
  collectionName: string = '';

  constructor(
    private bottomSheetRef: MatBottomSheetRef<BottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data2: { showBookmark: boolean; image?: any, selectButton?: boolean },
    private service: BasicService, private socketService: SocketService
  ) {
    this.showBookmark = data2.showBookmark;
    this.imageData = data2.image ? data2.image.urls.small : null; // Ensure safe access
    this.imageMetaData = data2.image;
  }  

  ngOnInit(): void {
    if(localStorage.getItem('userID') !== null){
      this.userID = localStorage.getItem('userID');
      }
      if(localStorage.getItem('username') != null){
        this.username = localStorage.getItem('username');
      }
      if(localStorage.getItem('profileURL') != null){
        this.profileURL = localStorage.getItem('profileURL');
      }
      
      if(this.userID){
      this.service.getCurrentUserData(this.userID).subscribe({
        next:(data)=>{
          this.data = data.following_data.filter(f => f.follow_status === 'following');
          if(data.chatting_people)
          this.chattedUserInfo = data.chatting_people;
        },
        error: (err)=>{
          console.error(err);
        }
      })
    }
  }

  closeSheet(): void {
    this.bottomSheetRef.dismiss();
  }

  toggleBookmarkDialog() {
    this.showBookmarkDialog = !this.showBookmarkDialog;
    this.bottomSheetRef.dismiss();
  }

  toggleCreateCollectionModal() {
    this.showCreateCollectionModal = !this.showCreateCollectionModal;
  }

  filterFollowingList(): followers[] {
    if (!this.data || this.data.length === 0) {
      return [];
    }
  
    const uniqueIds = new Set();
    return this.data.filter((item) => {
      if (!uniqueIds.has(item.userId)) {
        uniqueIds.add(item.userId);
        return true;
      }
      return false;
    });
  }
  

  createCollection() {
  
      // Prepare the request payload based on the schema
      const collectionData = {
        instagram_id: this.userID || "",
        title: this.collectionName ? this.collectionName : '',
        description: this.data2.image.alt_description || '', 
        media: [this.imageData] ,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: this.data2.image.id, 
          username: this.data2.image.user.username,
          name: this.data2.image.user.name,
          profile_image: this.data2.image.user.profile_image.small
        }
      };

      if (!collectionData.instagram_id) {
        console.error("Instagram ID is missing!");
        return;
      }
  
      // Call the API to save the collection with proper payload
      if (this.userID) {
        this.service.addCollection(this.userID, collectionData).subscribe(
          (response) => {
            this.collectionName = '';
            this.toggleCreateCollectionModal();
            this.bottomSheetRef.dismiss();
          },
          (error) => {
            console.error('Error creating collection:', error);
          }
        );
      }
  }

  sendFileToFollowing(selectedUser: followers): void {
    if (!selectedUser) {
      return;
    }
  
    if (!this.imageData) {
      return;
    }
  
    fetch(this.imageData) // Convert URL to Blob
      .then(response => response.blob())
      .then(blob => {
        const file = new File([blob], "image_from_url.jpg", { type: blob.type });
  
        // Upload file
        this.service.uploadFileWhileMessaging(
          this.userID || '',
          selectedUser.userId,
          Math.random().toString(36).substring(7),
          this.FileType.Image,
          file
        ).subscribe(
          (response) => {
  
            const fileData = {
              senderId: this.userID || '',
              fileName: file.name,
              fileType: this.FileType.Image, 
              fileContent: this.imageData // URL of image
            };

            this.socketService.sendFiles(fileData);
            this.bottomSheetRef.dismiss();
          },
          (error) => {
            console.error("File Upload Failed:", error);
          }
        );
      })
      .catch(error => console.error("Error converting URL to file:", error));
         // ✅ Store user info in chattedUserInfo
         if (!this.chattedUserInfo) {
          this.chattedUserInfo = [];
        }

        const isUserStored = this.chattedUserInfo.some(
          (user) => user.username === selectedUser.username && user.userId === selectedUser.userId
        );

        if (!isUserStored) {
          this.storeChattingPeopleInfo(selectedUser);
        }
  }

  storeChattingPeopleInfo(selectedUser: followers) {
    if (!this.userID || !selectedUser) {
      console.error("User ID or selected user is missing.");
      return;
    }

    if (!this.chattedUserInfo) {
      this.chattedUserInfo = [];
    }

    const updatedChattingPeople = [
      ...this.chattedUserInfo,
      {
        username: selectedUser.username,
        userId: selectedUser.userId
      }
    ];

    const profileData = {
      chatting_people: updatedChattingPeople,
    };

    this.service.patchUserData(this.userID, profileData).subscribe({
      next: (data) => {
        this.chattedUserInfo = data.chatting_people || []; //  Update the local list after API call
      },
      error: (err) => {
        console.error("Error updating user data:", err);
      }
    });
  }
  
}

