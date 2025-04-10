import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../Auth/auth/Services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { BasicService } from '../../Services/basic.service';
import { AccountType2, InstagramProfile } from '../../Interfaces/shared';
import imageCompression from "browser-image-compression";
import { getAuth, updatePassword } from 'firebase/auth';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent implements OnInit {
  public userID!: string | null;
  public userData!: InstagramProfile;
  public bio!: string;
  public oldBio?: string;
  public newPassword!: string;
  public AccountType2 = AccountType2;

  constructor(public authservice: AuthService, public dialog: MatDialog, public router: Router, public service: BasicService) {
    if (localStorage.getItem('userID') !== null) {
      this.userID = localStorage.getItem('userID');
    }
  }

  public files: any;

  ngOnInit(): void {
    if (this.userID) {
      this.service.getCurrentUserData(this.userID).subscribe({
        next: (data: InstagramProfile) => {
          this.userData = data;
          this.oldBio = data.bio;
        }
      })
    }
    else {
      console.error("User id is not present");
    }
  }

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
        const compressedImageUrl = reader.result as string;

        this.service.patchUserData(this.userData.instagram_id, { profile_picture_url: compressedImageUrl })
          .subscribe(
            (updatedProfile) => {
              this.userData.profile_picture_url = updatedProfile.profile_picture_url; // Update UI
              this.ngOnInit();
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

  logout(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      disableClose: true, // Prevent closing by clicking outside
    });
  
    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.authservice.signOut(); 
          localStorage.removeItem('isLoggedIn'); 
          localStorage.removeItem('userID'); 
          localStorage.removeItem('username'); 
          this.router.navigate(['login']);
        } catch (error) {
          console.error("Logout failed:", error);
        }
      }
    });
  }
  

  togglePrivacy(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.userData.account_type2 = isChecked ? AccountType2.PRIVATE : AccountType2.PUBLIC;
  
    // ✅ Send as an object, NOT a single value
    const updateData = { account_type2: this.userData.account_type2 };
  
    this.service.patchUserData(this.userData.instagram_id, updateData).subscribe(
      (response) => {
        alert("Profile updated successfully!");
      },
      (error) => {
        console.error("Update failed:", error);
      }
    );
  }
  

  // ✅ Save profile changes
  save() {
    if (!this.userData || !this.userData.instagram_id) {
      console.error("User ID not found!");
      return;
    }
  
    if (this.userData.bio === this.oldBio) {
      alert("No changes made");
      return;
    }
  
    const updatedData = {
      bio: this.userData.bio, // ✅ Updated bio
    };
  
    this.service.patchUserData(this.userData.instagram_id, updatedData).subscribe(
      (response) => {
        alert("Profile updated successfully!");
        this.oldBio = this.userData.bio; // Update oldBio after successful update
      },
      (error) => {
        console.error("Update failed:", error);
      }
    );
  }
  
  changePassword() {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert('User not logged in!');
      return;
    }

    if (!this.newPassword) {
      alert('Please enter a new password!');
      return;
    }

    updatePassword(user, this.newPassword)
      .then(() => {
        alert('Password updated successfully!');
      })
      .catch(error => {
        console.error('Error updating password:', error);
      });
  }
  
  
}
