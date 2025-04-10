import { Injectable, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { Comments, Message, Notification } from '../Interfaces/shared';
import { FileData } from '../Interfaces/shared';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  public userID!: string | null;

  constructor() {
    // Replace with your actual backend URL
    this.socket = io('http://localhost:8000');
    this.userID = localStorage.getItem('userID');
    if (this.userID)
      this.socket.emit("user-connected", this.userID);
    this.socket.on('unread-notifications', (notifications) => {
    });
  }

  // Listen for messages from the server
  listenForMessages(): Observable<Message> {
    return new Observable(observer => {
      this.socket.on('receive-message', (msg: any) => { // Backend wale event name se match karein
        observer.next(msg);
      });

      return () => this.socket.off('receive-message'); // Cleanup listener
    });
  }



  // 🔴 Emit new comment to the server
  sendComment(commentData: Comments) {
    this.socket.emit('new-comment', commentData);
  }

  sendMessage(messageData: Message) {
    this.socket.emit('send-message', messageData);
  }

  receiveMessages(callback: (message: Message) => void) {
    this.socket.on('receive-message', (message: Message) => {
      callback(message);
    });
  }

  receivesFiles(callback: (files: FileData) => void) {
    this.socket.on('receiveFile', (data: FileData) => {
      callback(data);
    });
  }


  sendFiles(filesData: FileData) {
    this.socket.emit('sendFile', filesData);
  }

  listenForNotifications(): Observable<Notification> {
    return new Observable<Notification>((observer) => {
      this.socket.on('receive-notification', (data: any) => {

        // Ensure `data` has the expected structure before emitting
        const notification: Notification = {
          senderId: data.senderId || '',
          receiverId: data.receiverId || '',
          type: data.type || 'mention', // Default type if missing
          message: data.message || '',
          profile_pic: data.profile_pic || '',
          isRead: data.isRead ?? false, // Use `??` to handle undefined values
          createdAt: data.createdAt || new Date().toISOString(),
        };

        observer.next(notification);
      });

      return () => this.socket.off('receive-notification');
    });
  }




  // 🟢 Listen for incoming comments from the server
  listenForComments(): Observable<Comments> {
    return new Observable(observer => {
      this.socket.on('commentAdded', (comment) => {
        observer.next(comment);
      });

      // Cleanup on unsubscribe
      return () => this.socket.off('commentAdded');
    });
  }

  listenForUnreadNotifications(): Observable<any[]> {
    return new Observable(observer => {
      this.socket.on('unread-notifications', (notifications) => {
        observer.next(notifications);
      });

      return () => this.socket.off('unread-notifications');
    });
  }


  sendReplyToComment(parentCommentId: string, replyData: Comments) {
    this.socket.emit('new-reply', { parentCommentId, replyData });
  }

  // 🟡 Listen for new replies from server
  listenForReplies(): Observable<{ parentCommentId: string; reply: Comments }> {
    return new Observable(observer => {
      this.socket.on('replyAdded', (data) => {
        observer.next(data);
      });

      return () => this.socket.off('replyAdded');
    });
  }

  sendNotification(notificationData: { senderId: string, receiverId: string, type: string, message: string, profile_pic: string }) {
    this.socket.emit('send-notification', notificationData);
  }

  //   socket.on('message-deleted', (messageId) => {
  //   this.messages = this.messages.filter(msg => msg._id !== messageId);
  // });

  deleteMessage(_id: string) {
    this.socket.emit('delete-message', _id);
  }
  
  // ✏️ **Edit Message**
  editMessage(_id: string, newContent: string) {
    this.socket.emit('edit-message', { _id, newContent });
  }
  
  // 📌 **Listen for Message Updates**
  onMessageDeleted(callback: (messageId: string) => void) {
    this.socket.on('message-deleted', callback);
  }
  
  onMessageUpdated(callback: (updatedMessage: any) => void) {
    this.socket.on('message-updated', callback);
  }
  

  // Disconnect from the server
  disconnect() {
    this.socket.disconnect();
  }

}
