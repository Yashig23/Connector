import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SocketService } from '../../Services/socket.service';
import {  FileData, FileType, followers, InstagramProfile, Media, Message } from '../../Interfaces/shared';
import { BasicService } from '../../Services/basic.service';
import { v4 as uuidv4 } from 'uuid';
import { ChatgptService } from '../../Services/chatgpt.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  messages: Message[] = [];
  newMessage: string = '';
  userID!: string | null;
  showEmojiPicker = false;
  public chatId?: string;
  public senderId!: string;
  public userMessage!: string;
  following: followers[] = [];
  public searchTerm!: string;
  public isLoading!: boolean;
  public openGptBox!: boolean;
  public MessageType = FileType;
  public FileType = FileType;
  public aiResponse!: string;
  public page = 1;
  selectedMessageId: string | null | undefined= null;

  public limit = 20;
  chatsOfOtherUserID!: string;
  public user!: InstagramProfile;
  public chattedUserInfo!: { username: string; userId: string }[];
  public followers!: followers[];
  public media!: Media[];
  public activeTab: string = 'media'; 
  public lastRequestTime: number = 0;
  public requestCooldown = 5000; 
  public selectedUser: followers | null = null
  public paramId!: string | null;
  public dontShowImg!: boolean;
  public noPicture: string = 'assets/NoPicture.png'
  public username!: string|null;


  constructor(private socketService: SocketService, private service: BasicService, private gptService: ChatgptService, private route: ActivatedRoute, private router: Router) {
    this.userID = localStorage.getItem('userID');
  }

  ngOnInit() {
    this.socketService.listenForMessages().subscribe((message: Message) => {
      this.messages = [...this.messages, message];
      this.chatId = message.chatId;
      this.senderId = message.senderId;// Ensuring change detection
    });

    this.route.paramMap.subscribe(params => {
      this.paramId = params.get('id') || '';
      if (this.paramId) {
        const navigation = this.router.getCurrentNavigation();
        const metaData = navigation?.extras.state?.['metaData'];
        const user: followers = {
          userId: this.paramId,
          username: metaData
        }
        this.selectUser(user);
        this.fetchMessages();
      }
    });

    if (localStorage.getItem('username') != null) {
      this.username = localStorage.getItem('username');
    }

    if (this.userID) {
      this.fetchCurrentUserData(this.userID);
    }

    this.socketService.receivesFiles((file: FileData) => {
      const fileMessage: Message = {
        chatId: this.chatId,
        senderId: file.senderId,
        messageType: FileType.Image,
        content: '',
        timestamp: new Date(),
        files: [{
          ...file,
          fileContent: this.arrayBufferToImageURL(file.fileContent ?? '') 
        }]
      };

      this.messages = [...this.messages, fileMessage];
    });

    this.socketService.onMessageDeleted((messageId: string) => {
      this.messages = this.messages.filter(msg => msg._id !== messageId);
    });

    // ✏️ **Listen for Edited Messages**
    this.socketService.onMessageUpdated((updatedMessage: any) => {
      this.messages = this.messages.map(msg =>
        msg._id === updatedMessage._id ? updatedMessage : msg
      );
    });
  }

  showAttachmentOptions = false;

  // Toggle attachment menu
  toggleAttachments() {
    this.showAttachmentOptions = !this.showAttachmentOptions;
  }

  openOptions(messageId: string|undefined) {
    this.selectedMessageId = this.selectedMessageId === messageId ? null : messageId;
  }

  fetchMessages(): void {
    if (this.isLoading) return;
    this.isLoading = true;

    if (this.userID && this.chatsOfOtherUserID) {
      this.service.getMessages(this.userID, this.chatsOfOtherUserID)
        .subscribe({
          next: (data) => {
            this.messages = [...data, ...this.messages];
            this.isLoading = false;
          },
          error: (error) => {
            this.isLoading = false;
          }
        });
    } else {
      console.error("user does not exists");
    }
  }

  fetchCurrentUserData(id: string) {
    this.service.getCurrentUserData(id).subscribe({
      next: (data: InstagramProfile) => {
        this.chattedUserInfo = data?.chatting_people || [];
        this.following = data.following_data; 
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }


  arrayBufferToImageURL(fileContent: string | ArrayBuffer): string {
    if (typeof fileContent === 'string') {
      if (fileContent.startsWith('https://images.unsplash.com')) {
        return fileContent;
      }
    }

    if (fileContent instanceof ArrayBuffer) {
      const blob = new Blob([fileContent]);
      return URL.createObjectURL(blob);
    }

    return ''; 
  }

  filteredUsers(): followers[] {
    if (!this.searchTerm?.trim()) {
      return [...this.chattedUserInfo]; 
    }
  
    const term = this.searchTerm.toLowerCase();
    return [...this.chattedUserInfo, ...this.following].filter(user =>
      user.username.toLowerCase().includes(term)
    );
  }
  
  


  replyToChat(): void {
    this.newMessage = this.aiResponse;
    this.openGptBox = false;
  }

  analyzeMessage(): void {

    if (!this.messages || this.messages.length === 0) {
      this.aiResponse = 'Hi'; 
      return;
    }

    const lastMessagesString = this.messages
      .slice(-20) 
      .map(msg => msg.content) 
      .join("\n"); 

    const finalPrompt = `${lastMessagesString}\n\nReply to these texts from two different users.`;

    this.isLoading = true;
    this.gptService.getChatResponse(finalPrompt).subscribe({
      next: (data: any) => {
        this.aiResponse = data.choices[0].message.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.isLoading = false;
      }
    });
  }




  generateGPTMessage(): void {
    const currentTime = Date.now();
    this.isLoading = true;
    if (currentTime - this.lastRequestTime < this.requestCooldown) {
      return;
    }
    this.lastRequestTime = currentTime;

    this.gptService.getChatResponse(this.userMessage).subscribe({
      next: (data: any) => {
        this.aiResponse = data.choices[0].message.content;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Some error occurred:', err);
      }
    });
  }

  sendFile(event: any, fileType: FileType) {
    const file = event.target.files[0];
    if (!file) return;

    this.service.uploadFileWhileMessaging(
      this.userID ? this.userID : '',
      this.selectedUser!.userId,
      this.chatId ? this.chatId : Math.random().toString(36).substring(7),
      fileType,
      file
    ).subscribe(
      (response) => {

        const reader = new FileReader();
        reader.onload = () => {
          const fileData = {
            senderId: this.userID ? this.userID : '',  
            fileName: file.name,
            fileType: fileType,
            fileContent: reader.result 
          };

          this.socketService.sendFiles(fileData);
        };

        reader.readAsArrayBuffer(file); 
        this.showAttachmentOptions = false;
        this.showEmojiPicker = false;
        this.dontShowImg = true;
      },
      (error) => {
        console.error('File Upload Failed:', error);
      }
    );

    this.showAttachmentOptions = false;
    this.showEmojiPicker = false;
    if (!this.chattedUserInfo) {
      this.chattedUserInfo = [];
    }

    const isUserStored = this.chattedUserInfo.some(
      (user) => user.username === this.selectedUser?.username && user.userId === this.selectedUser?.userId
    );

    if (!isUserStored) {
      this.storeChattingPeopleInfo();
    }
  }

  openChatGpt(): void {
    this.openGptBox = !this.openGptBox;
  }

  selectUser(user: followers) {
    this.selectedUser = user;
    this.messages = [];
    this.fetchUserData(user.userId);
    this.chatsOfOtherUserID = user.userId;
    if (this.userID && this.chatsOfOtherUserID) {
      this.fetchMessages();
    }
  }

  sendMessage() {
    const messageData: Message & { text?: string } = {
      chatId: uuidv4(),
      senderId: this.userID ? this.userID : '',
      receiverId: this.selectedUser?.userId,
      messageType: FileType.Text,
      content: this.newMessage,
      text: this.newMessage, 
      timestamp: new Date(),
      isRead: false,
      reactions: [],
      deletedFor: [],
    };

    this.socketService.sendMessage(messageData);
    this.socketService.sendNotification({
      senderId: this.userID ? this.userID : '',
      receiverId: this.selectedUser?.userId ? this.selectedUser?.userId : '',
      type: 'comment',
      message: `${this.username} send you message!`,
      profile_pic: `${this.user.profile_picture_url}`
    })
    this.messages.push(messageData);
    this.newMessage = ''; 

    if (!this.chattedUserInfo) {
      this.chattedUserInfo = [];
    }

    const isUserStored = this.chattedUserInfo.some(
      (user) => user.username === this.selectedUser?.username && user.userId === this.selectedUser?.userId
    );

    if (!isUserStored) {
      this.storeChattingPeopleInfo();
    }
  }



  ngOnDestroy() {
    this.socketService.disconnect();
  }

  howEmojiPicker = false;
  emojis = ["😊", "😂", "😍", "😭", "👍", "🔥"];
  audioChunks: any[] = [];
  mediaRecorder: any;

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.newMessage += event.emoji.native;
  }

  startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      this.mediaRecorder.ondataavailable = (event: any) => {
        this.audioChunks.push(event.data);
      };
    });
  }

  fetchUserData(userId: string) {
    this.service.getCurrentUserData(userId).subscribe({
      next: (data: InstagramProfile) => {
        this.user = data; 
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
  }

  deleteMessageFromChats(_id: string) {
    this.socketService.deleteMessage(_id);
  }

  editMessageFromChats(_id: string, newContent: string) {
    this.socketService.editMessage(_id, newContent);
  }

  openProfile(id: string, data: boolean): void {
    if (id === this.userID) {
      this.router.navigate(['/profile']); 
    } else {
      this.router.navigate(['/profile', id], { queryParams: { data: data } });
    }
  }
  
  storeChattingPeopleInfo() {
    if (!this.userID || !this.selectedUser) {
      console.error("User ID or selected user is missing.");
      return;
    }

    if (!this.chattedUserInfo) {
      this.chattedUserInfo = [];
    }

    const updatedChattingPeople = [
      ...this.chattedUserInfo,
      {
        username: this.selectedUser.username,
        userId: this.selectedUser.userId
      }
    ];

    const profileData = {
      chatting_people: updatedChattingPeople, 
    };

    this.service.patchUserData(this.userID, profileData).subscribe({
      next: (data) => {
        this.chattedUserInfo = data.chatting_people || []; 
      },
      error: (err) => {
        console.error("Error updating user data:", err);
      }
    });
  }


}
