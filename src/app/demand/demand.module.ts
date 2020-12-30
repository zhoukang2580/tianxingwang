import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
const routes: Route[] = [
  {
    path: 'demand-list',
    loadChildren: () => import('./demand-list/demand-list.module').then(m => m.DemandListPageModule)
  },
]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class DemandModule { }
