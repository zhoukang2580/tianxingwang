import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemandAirportServicesComponent } from './demand-airport-services/demand-airport-services.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DemandItemCarComponent } from './demand-item-car/demand-item-car.component';
import { DemandItemMeetingComponent } from './demand-item-meeting/demand-item-meeting.component';



@NgModule({
  declarations: [
    DemandAirportServicesComponent,
    DemandItemCarComponent,
    DemandItemMeetingComponent,
    DemandItemCarComponent,
    DemandItemCarComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DemandAirportServicesComponent,
    DemandItemCarComponent,
    DemandItemMeetingComponent,
    DemandItemCarComponent,
    DemandItemCarComponent
  ],
  exports: [
    DemandAirportServicesComponent,
    DemandItemCarComponent,
    DemandItemMeetingComponent,
    DemandItemCarComponent,
    DemandItemCarComponent
  ]

})
export class ComponentsModule { }
