import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RoomCountChildrenPage } from './room-count-children.page';

const routes: Routes = [
  {
    path: '',
    component: RoomCountChildrenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomCountChildrenPageRoutingModule {}
