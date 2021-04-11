import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StylePageGuard } from 'src/app/guards/style-page.guard';

import { RoomCountChildrenPage } from './room-count-children.page';

const routes: Routes = [
  {
    path: '',
    component: RoomCountChildrenPage,
    canActivate:[StylePageGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RoomCountChildrenPageRoutingModule {}
