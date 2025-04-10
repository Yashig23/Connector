import { Component, OnInit, HostListener } from '@angular/core';
import { BasicService } from './Modules/shared/Services/basic.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoggedIn: boolean = false;
  isMobile:boolean = false; 
  isLaptop:boolean = false

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.router.events.subscribe(() => {
      this.checkLoginStatus();
      this.checkScreenSize();
    });
  }

  checkLoginStatus() {
    this.isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  }

  @HostListener('window:resize', [])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
    this.isLaptop = window.innerWidth > 768;
  }
}
