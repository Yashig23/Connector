import { Component, OnInit, HostListener } from '@angular/core';
import { SocketService } from '../../Modules/shared/Services/socket.service';

interface SidebarItem {
  title: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  public isSidebarOpen = true; // Controls sidebar toggle
  public notificationCount = 0; 
  public isMobile: boolean = false;
  public isLaptop:boolean = false;

  ngOnInit() {
    this.getNotifications();
  }

  constructor(public socketService: SocketService){}

  menuItems: SidebarItem[] = [
    { title: 'Home', icon: 'home', route: '' },
    { title: 'Search', icon: 'search', route: 'search' },
    { title: 'Explore', icon: 'explore', route: 'explore' },
    { title: 'Messages', icon: 'chat', route: 'messages' },
    { title: 'Notifications', icon: 'notifications', route: 'notifications' },
    // { title: 'Create', icon: 'add_box', route: 'create' },
    { title: 'Profile', icon: 'account_circle', route: 'profile' },
    { title: 'Settings', icon: 'settings', route: 'setting'}
  ]
  
  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    const width = window.innerWidth;
    this.isLaptop = width > 768;
    this.isMobile = width <= 768;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getNotifications() {
    this.socketService.listenForNotifications().subscribe(() => {
      this.notificationCount++; // Increment only when a new notification arrives
    });    
  }
  
  getUnReadNotifications() {
    this.socketService.listenForUnreadNotifications().subscribe((notifications: Notification[]) => {
      this.notificationCount = notifications.length; // Set initial unread notification count
    });
  }
  
  onNotificationClick(title: string) {
    if (title === 'Notifications') {
      this.notificationCount = 0;
    }
  }
  
}
