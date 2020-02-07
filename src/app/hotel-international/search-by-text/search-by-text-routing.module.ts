import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchByTextPage } from './search-by-text.page';

const routes: Routes = [
  {
    path: '',
    component: SearchByTextPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchByTextPageRoutingModule {}
