import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BasicService } from '../../Services/basic.service';
import { AccountStatus, AccountType2, followers, InstagramProfile, UserStory } from '../../Interfaces/shared';
import { MatDialog } from '@angular/material/dialog';
import { ShowImgComponent } from '../show-img/show-img.component';
import { BookmarkDialogComponent } from '../bookmark-dialog/bookmark-dialog.component';
import { Route, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {

  public InstagramProfile: followers[] = []; // Store user's friends list
  public famousPeopleList: InstagramProfile[] = []; // Store famous people list
  public noPicture: string = 'assets/NoPicture.png';
  public loggedIN!: boolean;
  isUploaded = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  uploadedImage: string | null = null;
  private storageKey = 'storyImage';
  private expiryKey = 'storyImage_expiry';
  public isUploading = false;
  public userID!: string|null;
  public username!: string|null;
  borderColor = 'white';

  addStory = {
    isAddStory: true,
    image: 'assets/add-story.png' 
  };

  constructor(public bSc: BasicService,public dialog: MatDialog, public router: Router, private messageService: MessageService) {
    if (localStorage.getItem('userID') !== null) {
      this.userID = localStorage.getItem('userID');
    }
    if (localStorage.getItem('username') !== null) {
      this.username = localStorage.getItem('username');
    }
  }

  ngOnInit(): void {
    if(this.userID){
    this.fetchFollowingData(this.userID);
    this.isLoggedIn();
    }
  }

  public moveToProfile(id: string, data: boolean): void {
    
    if (!id) {
      console.error(" moveToProfile called with undefined ID!");
      return;
    }
  
    this.router.navigate(['/profile', id], { queryParams: { data: data } });
  }
  

  isLoggedIn(): void {
    if(localStorage.getItem('isLoggedIn') == 'true'){
      this.loggedIN = true;
    }
    else{
      this.loggedIN = false;
    }

  }

  findNewFriends(): void {
    this.router.navigate(['/search']);
  }
  
   //  Trigger file input click
   triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  public fetchFollowingData(id: string): void {
    this.bSc.fetchFollowingList(id).subscribe({
      next: (data: followers[]) => {
        this.InstagramProfile = data.filter(
          profile => profile.follow_status == AccountStatus.Following && profile.user_status
        );

      },
      error: (err) => console.error('Error fetching following data:', err)
    });
  }
  
  
  
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true; 
  
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.uploadedImage = e.target.result; 
        this.isUploading = false; 
        this.isUploaded = true;
        this.borderColor = 'green';
        
        this.updateUserStory(); 
      };
      
      reader.readAsDataURL(file);
    }
  }
  

  updateUserStory() {
    if (!this.uploadedImage) {
      console.warn("No image uploaded yet!");
      return;
    }
  
    const userStory: UserStory = {
      instagram_id: this.userID || '',  
      username: this.username || '',    
      current_story: this.uploadedImage 
    };
  
    this.bSc.postNewUserStory(userStory).subscribe(
      (response) => {

      },
      (error) => {
        alert(`Error posting the image, ${error.message}`);
      }
    );
  }

openDialog(user?: followers): void {
  let imageToShow = this.noPicture; // Default image


  if (user?.user_status) {
    imageToShow = user.user_status; // If user has a status image, show it
  }
  console.log("user ki image", user?.user_status);

  const dialogRef = this.dialog.open(BookmarkDialogComponent, {
    width: "400px",
    height: "440px",
    disableClose: false,
  });

  dialogRef.componentInstance.statusData = imageToShow;
}


  showSuccess() {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Operation completed successfully' });
  }
  
}
