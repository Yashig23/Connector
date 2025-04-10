import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { BasicService } from '../../../../shared/Services/basic.service';
import { AccountType, AccountType2, InstagramProfile } from '../../../../shared/Interfaces/shared';
import { UpdateProfileComponent } from '../../../../shared/Components/update-profile/update-profile.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { getAuth, updateProfile, User } from 'firebase/auth';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  public username!: string;
  public password!: string;
  public email!: string;
  public hidePage!: boolean;
  public fullName!: string;  // New field for registration
  public registering: boolean = false;  // Track login/register state

  constructor(private authService: AuthService, private router: Router, private service: BasicService, public dialog: MatDialog) { }

  ngOnInit(): void {
    // Attach event listener for Google Login
    const googleButton = document.getElementById('googleLogin');
    if (googleButton) {
      googleButton.addEventListener('click', this.loginWithGoogle.bind(this));
    }
    if (localStorage.getItem('isLoggedIn') === 'true') {
      this.hidePage = true;
    }

  }

  async onSubmit() {
    try {
      let userData: any; // Declare userData variable

      if (this.registering) {
        // ✅ Validate required fields
        if (!this.username?.trim() || !this.password || !this.email?.trim() || !this.fullName?.trim()) {
          alert("Please fill in all fields.");
          return;
        }

        this.email = this.email.trim();
        this.username = this.username.trim();
        this.fullName = this.fullName.trim();

        // ✅ Check if username already exists in MongoDB
        const usernameExists = await this.checkUsernameExists(this.username);
        if (usernameExists) {
          alert("This username is already taken. Please choose another.");
          return;
        }

        // ✅ Register user in Firebase Authentication
        const userCredential = await this.authService.signUpWithEmailPassword(this.email, this.password);
        const user = userCredential.user;

        if (user) {
          // ✅ Update Firebase user profile with full name
          await updateProfile(user, { displayName: this.fullName });
        }

        // ✅ Prepare user data for MongoDB API
        userData = {
          instagram_id: user.uid, // Firebase UID as unique identifier
          username: this.username,
          gmail: this.email,
          full_name: this.fullName,
          bio: "",
          profile_picture_url: "",
          website: "",
          is_verified: false,
          is_private: false,
          account_type: AccountType.PERSONAL,
          account_type2: AccountType2.PUBLIC,
          followers_count: 0,
          user_status: null, 
          following_count: 0,
          following_data: [],
          followers_data: [],
          posts_count: 0,
          media: [],
          created_at: new Date(),
          updated_at: new Date(),
        };

        // ✅ Send user data to MongoDB API
        this.service.postNewUserData(userData).subscribe({
          next: (response) => {
            alert("Signup successful! Please log in.");
            this.toggleMode(); // Switch back to login mode
          },
          error: (error) => {
            alert("Error saving user in database.");
          },
        });
      } else {
        // ✅ Login logic
        if (!this.email?.trim() || !this.password) {
          alert("Please enter both email and password.");
          return;
        }

        this.email = this.email.trim();

        try {
          // ✅ Sign in user with email & password
          const userCredential = await this.authService.signInWithEmailPassword(this.email, this.password);
          const user = userCredential.user;

          if (!user) {
            alert("Login failed! Please try again.");
            return;
          }

          alert("Login successful! Welcome.");
          localStorage.setItem("userID", user.uid);
          localStorage.setItem("isLoggedIn", "true");

          // ✅ Check if username is already in localStorage
          const storedUsername = localStorage.getItem("username");
          if (storedUsername) {
            this.router.navigate(["home"]);
            return;
          }

          // ✅ Fetch user's full name from Firebase
          const fullNameFromFirebase = user.displayName || "";

          // ✅ Fetch user data from MongoDB
          this.service.getCurrentUserData(user.uid).subscribe({
            next: (existingUserData: InstagramProfile) => {

              // ✅ Save username in localStorage
              localStorage.setItem("username", existingUserData?.username || "");

              // ✅ If user already has profile data, navigate directly
              if (existingUserData.website || existingUserData.bio || existingUserData.profile_picture_url) {
                this.router.navigate(["home"]);
                return;
              }

              // ✅ If profile data is missing, show update profile dialog
              userData = {
                instagram_id: existingUserData?.instagram_id,
                username: existingUserData?.username || "",
                gmail: this.email,
                full_name: fullNameFromFirebase,
                bio: existingUserData?.bio || "",
                profile_picture_url: existingUserData?.profile_picture_url || "",
                website: existingUserData?.website || "",
                is_verified: existingUserData?.is_verified || false,
                is_private: existingUserData?.is_private || false,
                user_status: existingUserData?.user_status || null,
                account_type: existingUserData?.account_type || AccountType.PERSONAL,
                account_type2: existingUserData?.account_type2 || AccountType2.PUBLIC,
                followers_count: existingUserData?.followers_count || 0,
                following_count: existingUserData?.following_count || 0,
                followers_data: existingUserData?.followers_data || [],
                following_data: existingUserData?.following_data || [],
                community: existingUserData?.community || [],
                posts_count: existingUserData?.posts_count || 0,
                media: existingUserData?.media || [],
                created_at: existingUserData?.created_at || new Date(),
                updated_at: new Date(),
              };

              // ✅ Open profile update dialog
              const dialogRef = this.dialog.open(UpdateProfileComponent, {
                width: "600px",
                disableClose: true,
              });

              dialogRef.componentInstance.user = userData;

              dialogRef.afterClosed().subscribe(() => {
                this.router.navigate(["home"]);
              });
            },
            error: (err) => {
              console.error("Error while fetching user data:", err);
              alert("Error fetching user data. Please try again.");
              this.router.navigate(["home"]);
            },
          });
        } catch (authError: any) {
          console.error("Authentication error:", authError);
          alert("Error: " + authError.message);
        }
      }
    } catch (error) {
      console.error("Unexpected error in onSubmit:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  }

  moveToHome() {
    this.router.navigate(['/home'])
  }


  loginWithGoogle(): void {
    this.authService.signInWithGoogle().then((result) => {
      this.router.navigate(['home']);
      const dialogRef = this.dialog.open(UpdateProfileComponent, {
        width: '600px',
        disableClose: true, // Prevent closing by clicking outside
      });
    }).catch((error) => {
      console.error('Error during Google sign-in:', error);
    });
  }

  checkUsernameExists(username: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.service.fetchAllUsername().subscribe({
        next: (response) => {
          const usernames = response.usernames || [];
          resolve(usernames.includes(username)); // Agar username milta hai toh true return karega
        },
        error: (err) => {
          console.error("Error fetching usernames:", err);
          reject(false); // Error aaya toh false return karega
        }
      });
    });
  }


  toggleMode(): void {
    this.registering = !this.registering;
  }
}
