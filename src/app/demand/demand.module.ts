import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
const routes: Route[] = [
  {
    path: 'demand-list',
    loadChildren: () => import('./demand-list/demand-list.module').then(m => m.DemandListPageModule)
  },
  {
    path: 'demand-team',
    loadChildren: () => import('./demand-team/demand-team.module').then(m => m.DemandTeamPageModule)
  },
  {
    path: 'demand-visa',
    loadChildren: () => import('./demand-visa/demand-visa.module').then(m => m.DemandVisaPageModule)
  },
  {
    path: 'demand-meeting',
    loadChildren: () => import('./demand-meeting/demand-meeting.module').then(m => m.DemandMeetingPageModule)
  },
  {
    path: 'demand-car',
    loadChildren: () => import('./demand-car/demand-car.module').then(m => m.DemandCarPageModule)
  },
  {
    path: 'airport-services',
    loadChildren: () => import('./airport-services/airport-services.module').then(m => m.AirportServicesPageModule)
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
