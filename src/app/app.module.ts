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
import { NgxPaginationModule } from "ngx-pagination";
import { BsModalService } from "ngx-bootstrap/modal";
import { ComponentLoaderFactory } from "ngx-bootstrap/component-loader";
import { PictureService } from "./core/services/picture/picture.service";
import { PositioningService } from "ngx-bootstrap/positioning";
import { TagInputModule } from "ngx-chips";
import { CeilPipe } from './core/pipes/ceil.pipe';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

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
    NgxPaginationModule,
    TagInputModule
  ],
  providers: [BsModalService, ComponentLoaderFactory, PictureService, PositioningService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
