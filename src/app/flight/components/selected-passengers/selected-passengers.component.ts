import { CredentialsEntity } from "./../../../tmc/models/CredentialsEntity";
import { ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { StaffEntity } from "src/app/hr/staff.service";
import { FlightService, PassengerBookInfo } from "../../flight.service";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  bookInfos$: Observable<PassengerBookInfo[]>;
  constructor(
    private flightService: FlightService,
    private modalCtrl: ModalController
  ) {
    this.bookInfos$ = flightService.getPassengerBookInfoSource();
  }
  async remove(info: PassengerBookInfo) {
    if (info) {
     await this.flightService.removePassengerBookInfo(info);
    }
  }
  ngOnInit() {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
}
