import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { Collection, FollowRequestInterface, InstagramProfile, Media, Comments, followers, receiveSendMessages, UserStory } from '../Interfaces/shared';
import { profile } from 'console';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BasicService extends BaseService {
  private apiUrl = '/peoplePresent';
  private famousPeopleApi = '/peoplePresent';
  private peopleNearYou = '/peopleNearYou';
  private currentUser = '/myProfile';
  private newUser = '/newProfiles'
  private patchData = '/profiles';
  private postPicRoute = 'media/upload';
  private realApi = 'http://localhost:8000/api';
  private newUserStory = 'http://localhost:8000/api/user-story'; 

  constructor(public http: HttpClient) {
    super(http);
  }


  getAllFriends(): Observable<InstagramProfile[]> {
    return this.getDataSubscription<InstagramProfile[]>(this.apiUrl);
  }

  getAllFamousPeople(): Observable<InstagramProfile[]> {
    return this.getDataSubscription<InstagramProfile[]>(this.famousPeopleApi);
  }

  getListOfAllPopleNearYou(): Observable<InstagramProfile[]> {
    return this.getDataSubscription<InstagramProfile[]>(this.peopleNearYou);
  }

  getCurrentUserData(id: string): Observable<InstagramProfile> {
    return this.getDataSubscription<InstagramProfile>(`${this.currentUser}/${id}`);
  }

  postNewUserData(userData: InstagramProfile): Observable<InstagramProfile> {
    return this.postDataSubscription<InstagramProfile, InstagramProfile>(this.newUser, userData);
  }

  patchUserData(id: string, profileData: any): Observable<InstagramProfile> {
    return this.patchDataSubscription<InstagramProfile, any>(`${this.patchData}/${id}`, profileData);
  }

  postNewUserStory(userStory: UserStory): Observable<UserStory> {
    const apiUrl = 'http://localhost:8000/api/user-story';
    return this.http.post<UserStory>(apiUrl, userStory);
  }
  
  postPicture(file: File, id: string, metadata: Partial<Media>): Observable<Media> {
    const formData = new FormData();

    formData.append("media", file);
    formData.append("media_id", metadata.media_id || "");
    formData.append("media_type", metadata.media_type || "image");
    formData.append("caption", metadata.caption || "");
    formData.append("likes_count", String(metadata.likes_count || 0));
    formData.append("comments_count", String(metadata.comments_count || 0));
    formData.append("created_at", metadata.created_at ? metadata.created_at.toISOString() : new Date().toISOString());
    formData.append("owner_id", metadata.owner_id ? metadata.owner_id : '');
    formData.append("owner_name", metadata.owner_name ? metadata.owner_name : '');
    formData.append("owner_profilePic", metadata.owner_profilePic ? metadata.owner_profilePic : '');
    const apiUrl = `http://localhost:8000/api/profiles/${id}/media/upload`;

    return this.http.post<Media>(apiUrl, formData);
  }

  deletePost(profileId: string, mediaId: string): Observable<any> {
    const apiUrl = 'http://localhost:8000/api/profiles';
    return this.http.delete(`${apiUrl}/${profileId}/media/${mediaId}`);
  }

  // ✅ Update post caption
  updatePostCaption(profileId: string, mediaId: string, caption: string): Observable<any> {
    const apiUrl = 'http://localhost:8000/api/profiles';
    return this.http.put(`${apiUrl}/${profileId}/media/${mediaId}`, { caption });
  }

postArrayOfPicture(files: File[], id: string, metadataArray: Partial<Media>[]): Observable<Media[]> {
  const formData = new FormData();

  // ✅ Sabhi images ko FormData me add karenge
  files.forEach((file) => {
    formData.append("media", file); 
  });

  // ✅ Sabhi metadata values ko comma-separated string me convert karenge
  formData.append("media_id", metadataArray.map(m => m.media_id || "").join(","));
  formData.append("media_type", metadataArray.map(m => m.media_type || "image").join(","));
  formData.append("caption", metadataArray.map(m => m.caption || "").join(","));
  formData.append("likes_count", metadataArray.map(m => String(m.likes_count || 0)).join(","));
  formData.append("comments_count", metadataArray.map(m => String(m.comments_count || 0)).join(","));
  formData.append("owner_name", metadataArray.map(m => m.owner_name || "").join(","));
  formData.append("owner_id", metadataArray.map(m => m.owner_id || "").join(","));
  formData.append("created_at", metadataArray.map(m => m.created_at ? m.created_at.toISOString() : new Date().toISOString()).join(","));

  formData.forEach((value, key) => console.log(key, value));

  const apiUrl = `http://localhost:8000/api/profiles/${id}/media/upload/multiple`;

  return this.http.post<Media[]>(`${apiUrl}`, formData);
}



  likePost(profileId: string, mediaId: string, userId: string): Observable<Media> {
    const apiUrl = `http://localhost:8000/api/profiles/${profileId}/media/${mediaId}/like`;
    return this.http.post<Media>(apiUrl, { userId });
  }

  getNotifications(userId: string): Observable<any> {
    const apiUrl = `http://localhost:8000/notifications`;
    return this.http.get<any>(`${apiUrl}/${userId}`);
  }

  getMessages(senderId: string, receiverId: string): Observable<any> {
    const apiUrl = `http://localhost:8000/api/messages/${senderId}/${receiverId}`;
    return this.http.get<any>(apiUrl);
  }

  // ✅ Fetch comments by ownerId and media_id
  getComments(mediaId: string): Observable<Comments[]> {
    const apiUrl = `http://localhost:8000/api/comments`;
    return this.http.get<Comments[]>(`${apiUrl}?&media_id=${mediaId}`);
  }



  // Unlike a post
  unlikePost(profileId: string, mediaId: string, userId: string): Observable<Media> {
    return this.http.post<Media>(`/api/profiles/${profileId}/media/${mediaId}/unlike`, { userId });
  }

  // Add a comment to a post
  addComment(profileId: string, mediaId: string, commentData: Comments): Observable<Comments[]> {
    return this.http.post<Comments[]>(`http://localhost:8000/api/profiles/${profileId}/media/${mediaId}/comment`, commentData);
  }

  // replyToComment method inside your service
  replyToComment(profileId: string, mediaId: string, commentId: string, replyData: Comments): Observable<any> {
    return this.http.post<any>(`http://localhost:8000/api/profiles/${profileId}/media/${mediaId}/comment/${commentId}/reply`, replyData);
  }

  fetchAllUsername(): Observable<any> {
    return this.http.get<any>('http://localhost:8000/api/allUsernames');
  }  


  // Like a comment
  likeComment(profileId: string, mediaId: string, commentId: string, userId: string): Observable<Media> {
    const apiUrl = `http://localhost:8000/api/profiles/${profileId}/media/${mediaId}/comments/${commentId}/like`;
    return this.http.post<Media>(apiUrl, { userId });
  }

  // Unlike a comment
  unlikeComment(profileId: string, mediaId: string, commentId: string, userId: string): Observable<Media> {
    return this.http.post<Media>(`/api/profiles/${profileId}/media/${mediaId}/comments/${commentId}/unlike`, { userId });
  }

  getMediaById(mediaId: string): Observable<Media> {
    const apiUrl = `http://localhost:8000/api/media/${mediaId}`;
    return this.http.get<Media>(apiUrl); // ✅ Change POST to GET
  }

  addCollection(userID: string, collectionData: Collection): Observable<Collection[]> {
    const url = `http://localhost:8000/api/addCollection/${userID}`;  // ✅ Corrected URL
    return this.http.post<Collection[]>(url, collectionData);
  }

  fetchFollowingList(instagramId: string): Observable<any> {
    const url = `http://localhost:8000/api/following/${instagramId}`;
    return this.http.get<followers[]>(url);
  }

  updateFollowing(instagramId: string, userId: string, updateData: any): Observable<followers> {
    const url = `http://localhost:8000/api/following/${instagramId}/${userId}`;
    return this.http.patch<followers>(url, updateData);
  }
  

  sendFollowRequest(requesterInstagramId: string, targetInstagramId: string): Observable<receiveSendMessages> {
    const url = `${this.realApi}/sendFollowRequest`;
    const body: FollowRequestInterface = { requesterInstagramId, targetInstagramId };
    return this.http.post<receiveSendMessages>(url, body);
  }

  sendUnFollowRequest(requesterInstagramId: string, targetInstagramId: string): Observable<receiveSendMessages> {
    const url = `${this.realApi}/sendUnFollowRequest`;
    const body: FollowRequestInterface = { requesterInstagramId, targetInstagramId };
    return this.http.post<receiveSendMessages>(url, body);
  }

  // Accept a follow request from the target user
  acceptFollowRequest(targetInstagramId: string, requesterInstagramId: string): Observable<FollowRequestInterface> {
    const url = 'http://localhost:8000/api/acceptFollowRequest';
    const body = { targetInstagramId, requesterInstagramId };
    return this.http.post<FollowRequestInterface>(url, body);
  }

  uploadFileWhileMessaging(senderId: string, receiverId: string, chatId: string, messageType: string, file: File): Observable<any> {
    const url = 'http://localhost:8000/uploadMessageFile'; // ✅ Fixed URL (extra `;` hatao)

    const formData = new FormData();
    formData.append('file', file);
    formData.append('senderId', senderId);
    formData.append('receiverId', receiverId);
    formData.append('chatId', chatId);
    formData.append('messageType', messageType);

    return this.http.post<any>(url, formData);
  }



}
