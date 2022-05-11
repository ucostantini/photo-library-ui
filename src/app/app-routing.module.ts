import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PictureListComponent } from "./components/picture-list/picture-list.component";


const routes: Routes = [
  {path: '', component: PictureListComponent, pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
