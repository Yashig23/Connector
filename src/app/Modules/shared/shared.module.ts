import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

// ✅ Import PrimeNG Modules
import { CarouselModule } from 'primeng/carousel';
import { FileUploadModule } from 'primeng/fileupload';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';  // ✅ FIXED: Correct import
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';


// ✅ Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { MatCheckboxModule } from '@angular/material/checkbox';

// ✅ Import Components
import { HomePageComponent } from './Components/home-page/home-page.component';
import { SearchComponent } from './Components/search/search.component';
import { ProfileComponent } from './Components/profile/profile.component';
import { MessagesComponent } from './Components/messages/messages.component';
import { ReelsComponent } from './Components/reels/reels.component';
import { ExploreComponent } from './Components/explore/explore.component';
import { NotificationComponent } from './Components/notification/notification.component';
import { CreateComponent } from './Components/create/create.component';
import { AngularPinturaModule } from '@pqina/angular-pintura';
import { LatestNewsComponent } from './Components/latest-news/latest-news.component';
import { ContentComponent } from './Components/content/content.component';
import { SettingComponent } from './Components/setting/setting.component';
import { ConfirmDialogComponent } from './Components/confirm-dialog/confirm-dialog.component';
import { UpdateProfileComponent } from './Components/update-profile/update-profile.component';
import { ShowImgComponent } from './Components/show-img/show-img.component';
import { CustomProfileComponent } from './Components/custom-profile/custom-profile.component';
import { ImageEditorModule } from '@syncfusion/ej2-angular-image-editor';
import { BottomSheetComponent } from './Components/bottom-sheet/bottom-sheet.component';
import { AddCommentsComponent } from './Components/add-comments/add-comments.component';
import { BookmarkDialogComponent } from './Components/bookmark-dialog/bookmark-dialog.component';
import { VideoChatComponent } from './Components/video-chat/video-chat.component';
import { DetailsDialogComponent } from './Components/details-dialog/details-dialog.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  {path: 'home', component: HomePageComponent},
  { path: 'search', component: SearchComponent },
  { path: 'create', component: CreateComponent },
  { path: 'notifications', component: NotificationComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'reels', component: ReelsComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'messages', component: MessagesComponent },
  {path: 'setting', component: SettingComponent},
  {path : 'profile/:id', component: ProfileComponent},
  { path: 'messages/:id', component: MessagesComponent },
];

@NgModule({
  declarations: [
    HomePageComponent,
    SearchComponent,
    ProfileComponent,
    MessagesComponent,
    ReelsComponent,
    ExploreComponent,
    NotificationComponent,
    CreateComponent,
    LatestNewsComponent,
    ContentComponent,
    SettingComponent,
    ConfirmDialogComponent,
    UpdateProfileComponent,
    ShowImgComponent,
    CustomProfileComponent,
    BottomSheetComponent,
    AddCommentsComponent,
    BookmarkDialogComponent,
    VideoChatComponent,
    DetailsDialogComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatBottomSheetModule,
    MatListModule,
    PickerComponent,
    AngularPinturaModule,
    CarouselModule,
    FileUploadModule,
    ButtonModule,
    ToastModule,
    BadgeModule,
    ImageEditorModule,
    ProgressBarModule, // ✅ FIXED: Correct import
    RouterModule.forChild(routes),
  ],
  providers: [MessageService],  // ✅ FIXED: Add MessageService for Toasts
  exports: [
    RouterModule,
    HttpClientModule,
    FileUploadModule,
    ButtonModule,
    ToastModule,
    BadgeModule,
    ProgressBarModule,  // ✅ FIXED: Export the modules
    CarouselModule,
    CommonModule
  ]
})
export class SharedModule { }
