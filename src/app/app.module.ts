import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilePickerModule } from 'ngx-awesome-uploader';

import { AppComponent } from './app.component';
import { NavMenuComponent } from './components/nav-menu/nav-menu.component';
import { CardListComponent } from './components/card-list/card-list.component';
import { AppRoutingModule } from "./app-routing.module";
import { CardDetailsComponent } from './components/card-details/card-details.component';
import { CardSearchComponent } from './components/modals/card-search/card-search.component';
import { CardFormComponent } from "./components/modals/card-form/card-form.component";
import { CommonModule } from "@angular/common";
import { CardDeleteComponent } from './components/modals/card-delete/card-delete.component';
import { CardService } from "./core/services/card/card.service";
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
import { MatSidenavModule } from "@angular/material/sidenav";

@NgModule({
  declarations: [
    AppComponent,
    NavMenuComponent,
    CardFormComponent,
    CardListComponent,
    CardDetailsComponent,
    CardSearchComponent,
    CardDeleteComponent,
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
    FilePickerModule,
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
    NgxFileDropModule,
    MatSidenavModule
  ],
  providers: [CardService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
