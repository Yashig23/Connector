import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as fabric from 'fabric';
import imageCompression from 'browser-image-compression'; // Ensure this is imported
import { BasicService } from '../../Services/basic.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-profile',
  templateUrl: './custom-profile.component.html',
  styleUrls: ['./custom-profile.component.scss']
})
export class CustomProfileComponent implements AfterViewInit {
  @ViewChild('canvasEl', { static: true }) canvasEl!: ElementRef<HTMLCanvasElement>;
  canvas!: fabric.Canvas;
  strokeColors = ['black', 'red', 'blue', 'green', 'orange', 'white'];
  bgColors: string[] = ['white', 'pink', 'lightblue', 'lightyellow', 'gray', 'beige'];
  selectedColor = '#000000';
  strokeWidth = 2;
  fillColor = '#000000'; // Default fill color
  opacity = 100;
  history: any[] = [];
  historyIndex = -1;
  isDrawingMode = false;
  public userID!: string | null;

  constructor(public service: BasicService, public dialogRef: MatDialogRef<CustomProfileComponent>) {
    if (localStorage.getItem('userID') !== null) {
      this.userID = localStorage.getItem('userID');
    }
  }

  ngAfterViewInit() {
    this.canvas = new fabric.Canvas(this.canvasEl.nativeElement, {
      width: 700, // Set your desired width
      height: 300, // Set your desired height
      backgroundColor: 'white',
    });

    // Apply the new width & height to the actual HTML canvas element
    this.canvasEl.nativeElement.width = 700;
    this.canvasEl.nativeElement.height = 300;

    this.canvas.renderAll();
  }

  /** ✅ Color Functions */
  setStrokeColor(color: string) {
    this.selectedColor = color;
  }

  setBackgroundColor(color: string) {
    this.canvas.backgroundColor = color;
    this.canvas.renderAll();
  }

  setStrokeWidth() {
    if (this.canvas.getActiveObject()) {
      this.canvas!.getActiveObject()!.set({ strokeWidth: this.strokeWidth });
      this.canvas.renderAll();
    }
  }

  setOpacity() {
    if (this.canvas.getActiveObject()) {
      this.canvas!.getActiveObject()!.set({ opacity: this.opacity / 100 });
      this.canvas.renderAll();
    }
  }

  /** ✅ Shape Functions */
  addRectangle() {
    const rect = new fabric.Rect({
      left: 50,
      top: 50,
      fill: this.selectedColor,
      width: 100,
      height: 100,
      stroke: this.selectedColor,
      strokeWidth: this.strokeWidth,
    });
    this.canvas.add(rect);
    this.trackHistory();
  }

  addCircle() {
    const circle = new fabric.Circle({
      left: 100,
      top: 100,
      fill: this.selectedColor,
      radius: 50,
      stroke: this.selectedColor,
      strokeWidth: this.strokeWidth,
    });
    this.canvas.add(circle);
    this.trackHistory();
  }

  addDiamond() {
    const diamond = new fabric.Polygon(
      [
        { x: 50, y: 0 },
        { x: 100, y: 50 },
        { x: 50, y: 100 },
        { x: 0, y: 50 },
      ],
      {
        left: 120,
        top: 120,
        fill: this.selectedColor,
        stroke: this.selectedColor,
        strokeWidth: this.strokeWidth,
      }
    );
    this.canvas.add(diamond);
    this.trackHistory();
  }

  addLine() {
    const line = new fabric.Line([50, 50, 200, 200], {
      stroke: this.selectedColor,
      strokeWidth: this.strokeWidth,
    });
    this.canvas.add(line);
    this.trackHistory();
  }

  addArrow() {
    const line = new fabric.Line([50, 50, 200, 200], {
      stroke: this.selectedColor,
      strokeWidth: this.strokeWidth,
      selectable: true,
    });
    this.canvas.add(line);
    this.trackHistory();
  }

  addText() {
    const text = new fabric.Textbox('Hello', {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: this.selectedColor,
    });
    this.canvas.add(text);
    this.trackHistory();
  }

  /** ✅ Selection & Move */
  enableSelection() {
    this.canvas.isDrawingMode = false;
    this.isDrawingMode = false;
  }

  enableMove() {
    this.canvas.forEachObject((obj) => obj.set({ selectable: false }));
    this.canvas.renderAll();
  }

  enableFreeDraw() {
    this.isDrawingMode = !this.isDrawingMode; // Toggle mode
    this.canvas.isDrawingMode = this.isDrawingMode;

    if (this.isDrawingMode) {
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas); // Ensure brush is set
      this.canvas.freeDrawingBrush.color = this.selectedColor;
      this.canvas.freeDrawingBrush.width = this.strokeWidth;
    }
  }

  setFill(type: string) {
    if (this.canvas.getActiveObject()) {
      this.canvas!.getActiveObject()!.set({
        fill: type === 'solid' ? this.fillColor : 'transparent',
      });
      this.canvas.renderAll();
    }
  }

  /** ✅ Undo / Redo */
  trackHistory() {
    this.history.push(JSON.stringify(this.canvas));
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.canvas.loadFromJSON(this.history[this.historyIndex], () => this.canvas.renderAll());
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.canvas.loadFromJSON(this.history[this.historyIndex], () => this.canvas.renderAll());
    }
  }

  /** ✅ Zoom In/Out */
  zoomIn() {
    this.canvas.setZoom(this.canvas.getZoom() * 1.1);
  }

  zoomOut() {
    this.canvas.setZoom(this.canvas.getZoom() / 1.1);
  }

  /** ✅ Eraser */
  erase() {
    if (this.canvas.getActiveObject()) {
      this.canvas.remove(this.canvas!.getActiveObject()!);
      this.trackHistory();
    }
  }

  /** ✅ Delete Selected Object */
  deleteSelected() {
    this.canvas.remove(this.canvas.getActiveObject()!);
    this.trackHistory();
  }

  /** ✅ Clear Canvas */
  clearCanvas() {
    this.canvas.clear();
    this.canvas.backgroundColor = 'white';
    this.trackHistory();
  }

  /** ✅ Share */
  share() {
    const dataURL = this.canvas.toDataURL();
    navigator.clipboard.writeText(dataURL).then(() => {
      alert('Canvas copied to clipboard!');
    });
  }

  saveAndUpload() {
    // Step 1: Export canvas as data URL with options
    const dataURL = this.canvas.toDataURL({
      format: 'png',
      quality: 1, // Max quality
      multiplier: 1 // Keep original size
    });

    // Step 2: Convert Base64 to a File
    const file = this.dataURLtoFile(dataURL, 'profile.png');

    // Step 3: Call the upload function
    this.updateProfilePicture(file);
    this.dialogRef.close();
  }


  // Helper to convert Base64 to File
  dataURLtoFile(dataURL: string, filename: string): File {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // Upload the image using the existing API
  async updateProfilePicture(file: File) {
    if (!file) return;

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onload = () => {
        const compressedImageUrl = reader.result as string;

        // Replace 'service' with your actual service instance if necessary
        if (this.userID)
          this.service.patchUserData(this.userID, { profile_picture_url: compressedImageUrl })
            .subscribe(
              (updatedProfile) => {
              },
              (error) => {
                console.error("Error updating profile", error);
              }
            );
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Image compression error:", error);
    }
  }


}
