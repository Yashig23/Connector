import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { AuthModule } from './Modules/Auth/auth/auth.module';
import { SidebarComponent } from './Componets/sidebar/sidebar.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { CarouselModule } from 'primeng/carousel';
import { AngularPinturaModule } from '@pqina/angular-pintura';
import { ToastModule } from 'primeng/toast';
import { SharedModule } from './Modules/shared/shared.module';
import { ImageEditorModule } from '@syncfusion/ej2-angular-image-editor';
import { PickerComponent, PickerModule } from '@ctrl/ngx-emoji-mart';


@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,

  ],
   schemas: [CUSTOM_ELEMENTS_SCHEMA] ,
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    MatIconModule,
    HttpClientModule,
    CarouselModule,
    ToastModule,
    PickerComponent,
    SharedModule,
    AngularPinturaModule,
    ImageEditorModule

  ],
  providers: [
    // provideClientHydration()
  
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
