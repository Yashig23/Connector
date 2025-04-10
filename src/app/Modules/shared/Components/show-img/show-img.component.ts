import { Component, OnInit, ViewChild } from '@angular/core';
import { followers, InstagramProfile, Media, MediaType } from '../../Interfaces/shared';
import { BasicService } from '../../Services/basic.service';
import imageCompression from "browser-image-compression";
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomProfileComponent } from '../custom-profile/custom-profile.component';
import { ImageEditorComponent } from '@syncfusion/ej2-angular-image-editor';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';


@Component({
  selector: 'app-show-img',
  templateUrl: './show-img.component.html',
  styleUrl: './show-img.component.scss'
})
export class ShowImgComponent implements OnInit{
  @ViewChild('imageEditor') imageEditor!: ImageEditorComponent;
  public userData!: InstagramProfile;
  postImage: boolean = true;
  isEditing: boolean = false;
  public imagesData!: Media[]; 
  public captionData!: string;
  public followingData!: followers[];
  public currentIndex: number = 0;
  public userID!: string|null;
  public username!: string|null;
  public showStatus!: boolean;
  public userProfilePic!: string|null;
  public statusData!: string|null;
  // In your component file (e.g., my-component.ts)
  public editorHeaders = [
  { 'Authorization': 'Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhNYVF1WmFZfVtgd19EYVZVTGYuP1ZhSXxWdkZhXX9dcnVQR2FUUk0=' }
  ];


  ngOnInit(): void {
      if (this.showStatus) {
        this.postImage = false
      }
  }

  constructor(public service: BasicService, public dialog: MatDialog, public dialogRef: MatDialogRef<ShowImgComponent>, private bottomSheet: MatBottomSheet){
      if(localStorage.getItem('userID')){
        this.userID = localStorage.getItem('userID');
      }
      if(localStorage.getItem('username')){
        this.username = localStorage.getItem('username');
      }
      if(localStorage.getItem('userProfilePic')){
        this.userProfilePic = localStorage.getItem('userProfilePic');
      }
  }
  

  async updateProfilePicture(event: any) {
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
            },
            (error) => {
              window.alert(error);
              console.error("Error updating profile", error);
            }
          );
      };
  
      reader.readAsDataURL(compressedFile);
      this.dialogRef.close({ success: true, image: compressedFile });
    } catch (error) {
      console.error("Image compression error:", error);
    }
  }

  public openCustomProfile() {
    const dialogRef = this.dialog.open(CustomProfileComponent, {
      disableClose: false,
      width: '920px',  // Adjust width based on sidebar + canvas size
      height: '620px', // Adjust height
      panelClass: 'custom-dialog-container' // Use a custom class to control styling
      
    });
    dialogRef.afterClosed().subscribe({
      next:()=>{
        this.dialogRef.close(true);
      }
    })
    
  }
    
  removeImage(index: number) {
  
    if (this.imagesData.length > 0) {
      this.imagesData.splice(index, 1); // Remove the selected image
  
  
      if (this.imagesData.length === 0) {
        this.postImage = false;
        this.dialogRef.close(); // Hide UI if no images left
        this.currentIndex = 0;
      } else if (index >= this.imagesData.length) {
        this.currentIndex = this.imagesData.length - 1;
      }
    } else {
      console.error("Not working - No images to delete");
    }
  }
  

  // Update currentIndex when user navigates the carousel
  onSlideChange(event: any) {
    this.currentIndex = event.page; // PrimeNG p-carousel emits the page number

  }

  async onPost() {
    if (!this.imagesData || this.imagesData.length === 0) {
        return;
    }

    try {
        // ✅ Convert blob URLs to actual File objects
        const files: File[] = await Promise.all(
            this.imagesData.map(async (image, index) => {
                const mediaUrl = image.media_url; // ✅ Explicitly assign to a variable

                if (typeof mediaUrl === "string" && mediaUrl!.startsWith("blob:")) {
                    return this.blobToFile(mediaUrl, `image_${index}.png`); // ✅ Convert blob URL to File
                }
                return mediaUrl as File; // ✅ If already a File, use it directly
            })
        );

        // ✅ Construct the payloads
        const postPayloads = this.imagesData.map((image, index) => ({
            file: files[index], // Attach the actual file
            media_id: this.generateUniqueId(),
            media_type: this.imagesData.length > 1 ? MediaType.CAROUSEL : MediaType.IMAGE,
            caption: this.captionData,
            likes_count: 0,
            comments_count: 0,
            created_at: new Date(),
            
            owner_id: this.userID ? this.userID : '',
            owner_name: this.username ? this.username : '',
            owner_profilePic: this.userProfilePic ? this.userProfilePic : ""
        }));


        if (this.imagesData.length === 1) {
            if (this.userID) {
                this.service.postPicture(postPayloads[0].file, this.userID, postPayloads[0]).subscribe({
                    next: (response) => {
                        this.resetPostForm();
                    },
                    error: (err) => {
                      window.alert(err);
                    },
                    
                });
            }
        }
         else {
      
              if (this.userID) {
                  this.service.postArrayOfPicture(files, this.userID, postPayloads).subscribe({
                      next: (response) => {
                          this.resetPostForm();
                      },
                      error: (err) => console.error("Error posting images:", err),
                  });
              }    
        }
    } catch (error) {
        console.error("Error converting blob URLs to files:", error);
    }
}

async blobToFile(blobUrl: string, fileName: string, mimeType = "image/png"): Promise<File> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
}


  // Function to generate unique ID
  generateUniqueId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
  
  // Reset form after posting
  resetPostForm() {
    this.imagesData = [];
    this.captionData = "";
    this.postImage = false;
    this.dialogRef.close();
  }

openEditor() {
  this.isEditing = true;

  setTimeout(() => {
      if (this.imageEditor && this.imagesData.length > 0) {
          const file = this.imagesData[this.currentIndex].media_url;

          let imageUrl: string;

          if (file instanceof File) {
              imageUrl = URL.createObjectURL(file); 
          } else if (typeof file === "string") {
              imageUrl = file; 
          } else {
              console.error("Invalid file type for image editing!");
              return;
          }

          this.imageEditor.open(imageUrl);
      } else {
          console.error("ImageEditor component not found or image data missing!");
      }
  }, 500);
}



  closeEditor() {
    this.isEditing = false;
  }

  onImageSave(event: any) {
    const dataUrl = event.dataUrl;
    const fileName = `edited_image_${this.currentIndex}.png`;
  
    // Convert Data URL to File
    this.dataUrlToFile(dataUrl, fileName).then((file) => {
      this.imagesData[this.currentIndex].media_url = file;
      this.isEditing = false;
    }).catch((error) => {
      console.error("Error converting edited image to File:", error);
    });
  }

  dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
    return fetch(dataUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => new File([buffer], fileName, { type: 'image/png' }));
  }
  
  
 
}
