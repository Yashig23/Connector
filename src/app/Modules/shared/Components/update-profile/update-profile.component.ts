import { Component, Inject, OnInit } from '@angular/core';
import { AccountType, AccountType2, InstagramProfile } from '../../Interfaces/shared';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BasicService } from '../../Services/basic.service';
import { Router } from '@angular/router';
import imageCompression from 'browser-image-compression';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.scss'
})
export class UpdateProfileComponent implements OnInit{
 public user!: InstagramProfile;
 public businessAcc = AccountType.BUSINESS;
 public AccountType = AccountType2;

  constructor(
    public dialogRef: MatDialogRef<UpdateProfileComponent>, public service: BasicService, public router: Router
  ) {

  }

  ngOnInit(): void {
 
  }

accountTypes = ['public', 'private'];
public selectedImage: string = '';



  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
  
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
  
      reader.onload = () => {
        this.selectedImage = reader.result as string; //  Update selected image immediately
  
        // Send updated image to backend
        this.service.patchUserData(this.user.instagram_id, { profile_picture_url: this.selectedImage })
          .subscribe(
            (updatedProfile) => {
              this.user.profile_picture_url = updatedProfile.profile_picture_url; //  Update UI
           
            },
            (error) => {
              console.error("Error updating profile", error);
              window.alert(error);
            }
          );
      };
  
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
    }
  }
  

  saveProfile() {
    if (!this.user || !this.user.instagram_id) {
      console.error('User ID missing!');
      return;
    }

    const profileData = {
      full_name: this.user.full_name,
      bio: this.user.bio,
      account_type2: this.user.account_type2,

    };

    this.service.patchUserData(this.user.instagram_id, profileData).subscribe(
      (response: any) => {
        if(this.user.profile_picture_url){
        localStorage.setItem("profileURL", this.user.profile_picture_url)
        }
        alert('Profile updated successfully!');
        this.dialogRef.close(response.profile); // Close dialog and return updated profile
      },
      (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile!');
      }
    );
  }

  skip() {

    this.dialogRef.close();
  }
}
