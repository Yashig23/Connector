import { Component } from '@angular/core';
import { Collection, User } from '../../Interfaces/shared';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrl: './details-dialog.component.scss'
})
export class DetailsDialogComponent {
 public showCollection!: Boolean;
 public collection!: Collection;
 public userInfo!: User

 constructor( public dialogRef: MatDialogRef<DetailsDialogComponent>){}

 closeDialog() {
  this.dialogRef.close();
}

}
