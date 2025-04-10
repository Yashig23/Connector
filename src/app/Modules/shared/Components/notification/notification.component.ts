import { Component, OnInit } from '@angular/core';
import { SocketService } from '../../Services/socket.service';
import { Socket } from 'dgram';
import { BasicService } from '../../Services/basic.service';
import { Router } from '@angular/router';
import { Notification, NotificationResponse } from '../../Interfaces/shared';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnInit {
  public unreadNotifications: Notification[] = []; // Should be an array
  public notifications: Notification[] = []; // Should be an array
  public userId: string | null;
  public noPicture = 'assets/NoPicture.png';

  constructor(private socketService: SocketService, private service: BasicService, private router: Router) {
    this.userId = localStorage.getItem('userID');
  }

  ngOnInit(): void {
    this.socketService.listenForUnreadNotifications().subscribe((notifications: Notification[]) => {
      this.unreadNotifications = notifications;
    });

    this.socketService.listenForNotifications().subscribe((notification: Notification) => {
      
      if (!Array.isArray(this.notifications)) {
        this.notifications = []; // Ensure it's an array
      }
      
      this.notifications.unshift(notification);
    });    

    if (this.userId) {
      this.service.getNotifications(this.userId).subscribe({
        next: (data: NotificationResponse) => {
          this.notifications = Array.isArray(data.notifications) ? data.notifications : []; // Ensure it's always an array
        },
        error: (err) => {
          console.error('🚨 Error fetching notifications:', err);
          this.notifications = []; // Prevent undefined error
        }
      });
    }
    
  }

  public moveToProfile(id: string, data: boolean): void{
    this.router.navigate(['/profile', id], { queryParams: { data: data } });
  }
}
