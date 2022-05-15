import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { PictureListComponent } from './components/picture-list/picture-list.component';
import { AppRoutingModule } from "./app-routing.module";
import { PictureDetailsComponent } from './components/picture-details/picture-details.component';
import { PictureSearchComponent } from './components/modals/picture-search/picture-search.component';
import { PictureCreateComponent } from "./components/modals/picture-create/picture-create.component";
import { CommonModule } from "@angular/common";
import { PictureDeleteComponent } from './components/modals/picture-delete/picture-delete.component';
import { PictureService } from "./core/services/picture/picture.service";
import { CeilPipe } from './core/pipes/ceil.pipe';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxFileDropModule } from "ngx-file-drop";

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    PictureCreateComponent,
    PictureListComponent,
    PictureDetailsComponent,
    PictureSearchComponent,
    PictureDeleteComponent,
    CeilPipe
  ],
  imports: [
    BrowserAnimationsModule,
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatDialogModule,
    NgxFileDropModule
  ],
  providers: [PictureService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
