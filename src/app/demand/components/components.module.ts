import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DemandAirportServicesComponent } from "./demand-airport-services/demand-airport-services.component";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { DemandItemCarComponent } from "./demand-item-car/demand-item-car.component";
import { DemandItemMeetingComponent } from "./demand-item-meeting/demand-item-meeting.component";
import { DemandItemTeamComponent } from "./demand-item-team/demand-item-team.component";
import { DemandItemVisaComponent } from "./demand-item-visa/demand-item-visa.component";
import { DemandSearchComponent } from "./demand-search/demand-search.component";
import { AppComponentsModule } from "src/app/components/appcomponents.module";

@NgModule({
  declarations: [
    DemandAirportServicesComponent,
    DemandItemTeamComponent,
    DemandItemMeetingComponent,
    DemandItemCarComponent,
    DemandItemVisaComponent,
    DemandSearchComponent,
  ],
  imports: [CommonModule, FormsModule, IonicModule, AppComponentsModule],
  exports: [
    DemandSearchComponent,
    DemandAirportServicesComponent,
    DemandItemTeamComponent,
    DemandItemMeetingComponent,
    DemandItemCarComponent,
    DemandItemVisaComponent,
  ],
})
export class ComponentsModule {}
