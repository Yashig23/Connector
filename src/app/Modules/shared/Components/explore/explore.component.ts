import { Component, AfterViewInit, ViewChild, ElementRef, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ExploreService } from '../../Services/explore.service';

declare var Masonry: any; // Required for CDN import
declare var imagesLoaded: any; // Required for CDN import

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit, AfterViewInit {
  @ViewChild('gallery', { static: false }) gallery!: ElementRef;
  images: any[] = [];
  isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private exploreService: ExploreService) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this.exploreService.getRandomPhotos(40).subscribe(
      (data) => {
        this.images = data;
        setTimeout(() => this.initializeMasonry(), 500); 
      },
      (error) => console.error(error)
    );
  }

  ngAfterViewInit() {
    this.initializeMasonry();
    window.addEventListener('resize', () => {
      setTimeout(() => {
        if (this.gallery) {
          new Masonry(this.gallery.nativeElement).layout();
        }
      }, 500);
    });
  }  

  initializeMasonry() {
    if (this.isBrowser && this.gallery) {
      imagesLoaded(this.gallery.nativeElement, { background: true }, () => {
  
        setTimeout(() => {
          const masonryInstance = new Masonry(this.gallery.nativeElement, {
            itemSelector: '.grid-item',
            columnWidth: '.grid-item',
            gutter: 10,
            percentPosition: true,
          });
  
          masonryInstance.layout();
        }, 500); 
      });
    }
  }
  
  
}

