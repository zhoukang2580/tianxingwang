import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
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
    RouterModule.forChild(routes),
    BrowserModule,
    FormsModule
  ],
  exports: [
    RouterModule
  ]
})
export class DemandModule { }
