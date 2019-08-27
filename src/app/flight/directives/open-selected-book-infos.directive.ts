import { Directive, HostListener } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { FlightService } from "../flight.service";
import { SelectedFlightsegmentInfoComponent } from '../components/selected-flightsegment-info/selected-flightsegment-info.component';

@Directive({
  selector: "[appOpenSelectedBookInfos]"
})
export class OpenSelectedBookInfosDirective {
  constructor(
    private modalCtrl: ModalController,
    private flightService: FlightService
  ) {}
  @HostListener("click")
  async showSelectedBookInfos() {
    const modal = await this.modalCtrl.create({
      component: SelectedFlightsegmentInfoComponent
    });
    await this.flightService.dismissAllTopOverlays();
    await modal.present();
    await modal.onDidDismiss();
    return "goBack";
  }
}
