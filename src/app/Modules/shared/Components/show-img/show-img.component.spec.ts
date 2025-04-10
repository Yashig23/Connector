import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowImgComponent } from './show-img.component';

describe('ShowImgComponent', () => {
  let component: ShowImgComponent;
  let fixture: ComponentFixture<ShowImgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShowImgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowImgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
