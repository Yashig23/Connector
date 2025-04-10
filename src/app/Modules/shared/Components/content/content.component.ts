import { Component, OnInit } from '@angular/core';
import { ExploreService } from '../../Services/explore.service';
import { InstagramProfile, Media, Collection, followers } from '../../Interfaces/shared';
import { BasicService } from '../../Services/basic.service';
import { ChangeDetectorRef } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component';
import { BookmarkDialogComponent } from '../bookmark-dialog/bookmark-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ShowImgComponent } from '../show-img/show-img.component';
import { DetailsDialogComponent } from '../details-dialog/details-dialog.component';
@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrl: './content.component.scss'
})
export class ContentComponent implements OnInit{
  images: any[] = [];
  cacheKey = 'unsplash_images'; 
  cacheTime = 3600 * 1000; 
  public userID!: string|null;
  public username!: string|null;
  public profileURL!: string|null;
  public mediaFromService!: boolean;
  public collections!: Collection[];
  public media: Media[] =[];

  constructor(private exploreService: ExploreService, private service: BasicService,private cdr: ChangeDetectorRef,public dialog: MatDialog, private bottomSheet: MatBottomSheet) {
    if(localStorage.getItem('userID') !== null){
      this.userID = localStorage.getItem('userID');
      }
      if(localStorage.getItem('username') != null){
        this.username = localStorage.getItem('username');
      }
      if(localStorage.getItem('profileURL') != null){
        this.profileURL = localStorage.getItem('profileURL');
      }
  }

  ngOnInit(): void {
    const cachedData = localStorage.getItem(this.cacheKey);
    const cachedTime = localStorage.getItem(this.cacheKey + '_time');
    const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]'); 

    if (cachedData && cachedTime && Date.now() - parseInt(cachedTime) < this.cacheTime) {
      // ✅ Use cached images
      this.images = JSON.parse(cachedData);
      // Update like status from localStorage
    this.images.forEach(image => {
      image.isLiked = likedPosts.includes(image.id);
    });
    } else {
      // 🚀 Fetch new images and cache them
      this.exploreService.getRandomPhotos(20).subscribe(
        (data) => {
          this.images = data;
  
          // Update like status from localStorage
          this.images.forEach(image => {
            image.isLiked = likedPosts.includes(image.media_id);
          });
  
          // Cache images
          localStorage.setItem(this.cacheKey, JSON.stringify(data));
          localStorage.setItem(this.cacheKey + '_time', Date.now().toString());
        },
        (error) => console.error(error)
      );
    }

    if(this.userID){
    this.fetchUserData(this.userID);
    }
  }

  isBookmarked(image: any): boolean {
    return this.collections.some(collection => collection.description == image.alt_description);
  }

    // Separate method to fetch user data
  fetchUserData(userId: string) {
    this.service.getCurrentUserData(userId).subscribe({
      next: (data: InstagramProfile) => {
        this.collections = data.collections ? data.collections : [];
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  toggleLike(post: any) {
    let likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
  
    if (likedPosts.includes(post.id)) {

      likedPosts = likedPosts.filter((id: string) => id !== post.media_id);
      post.isLiked = false;
      post.likes_count--;
    } else {

      likedPosts.push(post.id);
      post.isLiked = true;
      post.likes_count++;
  

      if (!post.floatingHearts) {
        post.floatingHearts = [];
      }
      this.createFloatingHeart(post);
    }
  
    // Update localStorage
    localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
  }

    openDetailsDialog(image: any){
      const body = {
           id: image.user.id,
           username: image.user.username,
           name: image.user.name,
           profile_image: image.user.profile_image.small
      }

      const dialogRef = this.dialog.open(DetailsDialogComponent, {
        width: '440px',
        height: '760px',
        disableClose: false,
        panelClass: 'custom-dialog-background'
      })
      dialogRef.componentInstance.userInfo = body;
      dialogRef.componentInstance.showCollection = false;
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

  public openBottomBox(data: boolean, imageData?: any): void {
    const bottomSheetRef = this.bottomSheet.open(BottomSheetComponent, {
        panelClass: 'custom-bottom-sheet',
        disableClose: false,
        data: { showBookmark: data, image: imageData }
    });
  }

  
}
