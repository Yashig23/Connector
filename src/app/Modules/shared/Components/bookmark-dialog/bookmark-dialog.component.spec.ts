import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkDialogComponent } from './bookmark-dialog.component';

describe('BookmarkDialogComponent', () => {
  let component: BookmarkDialogComponent;
  let fixture: ComponentFixture<BookmarkDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BookmarkDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BookmarkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
