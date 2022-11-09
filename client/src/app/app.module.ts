import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilePickerModule } from 'ngx-awesome-uploader';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { CardDetailsComponent } from './components/card-details/card-details.component';
import { CardFormComponent } from './components/modals/card-form/card-form.component';
import { CommonModule } from '@angular/common';
import { CardDeleteComponent } from './components/modals/card-delete/card-delete.component';
import { CardService } from './core/services/card/card.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CarouselComponent, IvyCarouselModule } from 'angular-responsive-carousel';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LightboxModule } from "ngx-lightbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { TagsComponent } from './components/tags/tags.component';

@NgModule({
  declarations: [
    AppComponent,
    CardDetailsComponent,
    CardDeleteComponent,
    CardFormComponent,
    CardListComponent,
    NavMenuComponent,
    TagsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    FilePickerModule,
    FormsModule,
    HttpClientModule,
    IvyCarouselModule,
    LightboxModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatToolbarModule,
    ReactiveFormsModule
  ],
  providers: [CardService, CarouselComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
