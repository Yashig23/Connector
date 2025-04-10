import { Component } from '@angular/core';
import { PinturaEditorOptions } from '@pqina/pintura';

@Component({
  selector: 'app-file-upload',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent {
  files: any[] = [];
  uploadedFiles: any[] = [];
  totalSize: number = 0;
  totalSizePercent: number = 0;
  editedImage: string | null = null;
  selectedFileIndex: number | null = null;

  editorOptions: PinturaEditorOptions = {
    locale: 'en', // Required locale setting
    imageCropAspectRatio: 1, // Aspect ratio 1:1 // Resize width
    imageReader: (file: any, context: { fileReader: (arg0: any) => any; }) => context.fileReader(file), // Handles file reading
  };
  

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      for (let file of event.target.files) {
        const objectURL = URL.createObjectURL(file);
        
        this.files.push({
          file, 
          objectURL, 
        });
      }
    }
  }
  
  editImage(index: number) {
    this.selectedFileIndex = index;
  
    const file = this.files[index];
  
    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      this.editedImage = reader.result as string; // Assign base64 data URL
    };
    reader.readAsDataURL(file.file); // Read file as Data URL
  }
  

  handleProcess(event: any) {
    if (this.selectedFileIndex !== null) {
      this.files[this.selectedFileIndex].objectURL = event.dest;
      this.editedImage = null; // Close the editor
    }
  }
  

  uploadFiles() {
    this.uploadedFiles = [...this.files];
    this.files = [];
    this.totalSize = 0;
    this.totalSizePercent = 0;
  }

  removeFile(index: number) {
    this.totalSize -= this.files[index].size;
    this.files.splice(index, 1);
    this.totalSizePercent = (this.totalSize / 1000000) * 100;
  }

  removeUploadedFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  formatSize(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / 1048576).toFixed(1)} MB`;
  }
}
