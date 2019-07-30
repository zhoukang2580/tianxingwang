import { SearchTicketModalComponent } from "./search-ticket-modal/search-ticket-modal.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SelectTrainStationModalComponent } from "./select-stations/select-station.component";
import { SelectAirportsModalComponent } from "./select-airports/select-airports.component";
import { IonicModule } from "@ionic/angular";

@NgModule({
  declarations: [
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent
  ],
  imports: [CommonModule, IonicModule, FormsModule],
  exports:[
    SearchTicketModalComponent
  ],
  entryComponents: [
    SearchTicketModalComponent,
    SelectTrainStationModalComponent,
    SelectAirportsModalComponent
  ]
})
export class TmcComponentsModule {}
