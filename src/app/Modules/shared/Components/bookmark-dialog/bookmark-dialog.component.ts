import { Component } from '@angular/core';

@Component({
  selector: 'app-bookmark-dialog',
  templateUrl: './bookmark-dialog.component.html',
  styleUrl: './bookmark-dialog.component.scss'
})
export class BookmarkDialogComponent {
   public statusData!: string|null;

  //  constructor(){
  //   this.statusData = localStorage.getItem('')
  //  }

   convertStatusToImage() {
    if (this.statusData) {
      // Check if statusData is already a URL (Base64 or HTTP)
      if (typeof this.statusData === 'string' && (this.statusData.startsWith('http') || this.statusData.startsWith('data:image'))) {
        this.statusData = this.statusData; // Directly assign if it's a valid URL
      } else {
        // Convert statusData to Blob
        const byteCharacters = atob(this.statusData); // Decode Base64 string
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
  
        // Create a URL for the blob
        this.statusData = URL.createObjectURL(blob);
      }
    }
  }
}
