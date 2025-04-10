import { Component, OnInit } from '@angular/core';
import { Comments, Media } from '../../Interfaces/shared';
import { SocketService } from '../../Services/socket.service';
import { BasicService } from '../../Services/basic.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-add-comments',
  templateUrl: './add-comments.component.html',
  styleUrl: './add-comments.component.scss'
})
export class AddCommentsComponent implements OnInit {
  public media!: Media;
  public userID!: string | null;
  public username!: string | null;
  public profileURL!: string | null;
  public newComment: string = '';
  public comments: Comments[] = [];
  public replyText: string = '';
  public replyingToCommentId: string | null = null;

  constructor(private sservice: SocketService, private service: BasicService) {
    if (localStorage.getItem('userID') !== null) {
      this.userID = localStorage.getItem('userID');
    }
    if (localStorage.getItem('username') != null) {
      this.username = localStorage.getItem('username');
    }
    if (localStorage.getItem('profileURL') != null) {
      this.profileURL = localStorage.getItem('profileURL');
    }
  }

  ngOnInit(): void {

    this.service.getMediaById(this.media.media_id).subscribe({
      next: (data) => {
        if (data.comments) {
          this.comments = data.comments;
        }
      },
      error: (err) => {
        console.error("something went wrong while receiving the media data");
      }
    })

    this.loadComments();

    this.sservice.listenForComments().subscribe((comment: Comments) => {
      if (comment.replies && comment.replies.length) {
        const parentComment = this.media?.comments?.find((c: Comments) => c.comment_id === comment.comment_id);
        if (parentComment) {
          parentComment.replies = [...(parentComment.replies || []), ...comment.replies];
        }
      } else {
        this.media?.comments?.push(comment);
      }
    });

    this.sservice.listenForReplies().subscribe(({ parentCommentId, reply }) => {
      // Find the parent comment and push reply
      const parent = this.comments.find(c => c.comment_id === parentCommentId);
      if (parent?.replies) {
        parent.replies.push(reply);
      }
    });
  }

  loadComments(): void {
    this.service.getComments(this.media.media_id).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (error) => {
        console.error('🚨 Error fetching comments:', error);
      },
    });
  }

  // Start replying to a comment
  startReplying(commentId: string): void {
    this.replyingToCommentId = commentId;
    this.replyText = '';
  }

  sendReply(parentComment: Comments): void {
    if (!this.replyText.trim()) return;

    const replyData: Comments = {
      comment_id: Date.now().toString(), // Ensure unique ID
      media_id: this.media.media_id,
      user_id: this.userID ? this.userID : '',
      username: this.username ? this.username : '',
      profile_pic: this.profileURL ? this.profileURL : '',
      text: this.replyText,
      created_at: new Date(),
      likes_count: 0
    };

    // Emit reply using socket
    this.sservice.sendReplyToComment(parentComment.comment_id, replyData);

    // Optimistically update UI
    parentComment.replies = parentComment.replies || [];
    parentComment.replies.push(replyData);
    this.service.replyToComment(this.media.owner_id, this.media.media_id, parentComment.comment_id, replyData).subscribe({
          next: (newReply: Comments) => {
            if (newReply) {
              parentComment.replies = parentComment.replies || []; // Ensure replies array exists
              parentComment.replies.push(newReply); // Add the new reply
              this.loadComments();
            } else {
              console.error("No reply returned from API");
            }
          },
          error: (err: any) => {
            console.error("Error adding reply:", err);
          }
        });

    this.replyingToCommentId = null;
    this.replyText = '';
  }


  // Cancel reply input
  cancelReply(): void {
    this.replyingToCommentId = null;
  }

  likeComment(media: Media, comment: Comments): void {
    const profileId = media.owner_id;
    const mediaId = media.media_id;
    const commentId = comment.comment_id;
    const userId = 'user123'; // Replace with actual user ID

    this.service.likeComment(profileId, mediaId, commentId, userId).subscribe({
      next: (updatedMedia) => {
        // Find the updated comment in the response
        const updatedComment = updatedMedia.comments?.find(c => c.comment_id === commentId);

        if (updatedComment) {
          comment.likes_count = updatedComment.likes_count;
        } else {
          console.warn('Comment not found in the updated media.');
        }
      },
      error: (error) => {
        console.error('Error liking comment:', error);
      }
    });
  }
  
  addComment(media: Media, commentInput: HTMLInputElement): void {
    if (!this.newComment?.trim()) return; // Prevent error if `this.newComment` is null/undefined
  
    const commentData: Comments = {
      comment_id: uuidv4(), // Unique ID for the comment
      media_id: media.media_id, // Media ID
      user_id: this.userID || '',
      username: this.username || '',
      profile_pic: this.profileURL || '',
      text: this.newComment, // Comment text
      created_at: new Date(),
      likes_count: 0,
      replies: []
    };
  
    this.sservice.sendComment(commentData);

    media!.comments!.push(commentData);
    // Call the service to add a comment
    this.service.addComment(media.owner_id, media.media_id, commentData).subscribe({
      next: (newComment: Comments[]) => {
              if (newComment) {
                // Push all new comments individually to avoid type error
                media!.comments!.push(...newComment);
              } else {
                console.error("No comments returned from API");
              
              media.comments_count += 1; // Increment count
              this.loadComments();
            }
          },
      error: (err: any) => {
        console.error("Error adding comment:", err);
      }
    });
  
    // Clear the input field
    this.newComment = '';
    commentInput.blur(); 
  }  

}
