import { StaffBookType } from "./../../../tmc/models/StaffBookType";
import { HrService } from "./../../../hr/hr.service";
import { IdentityService } from "./../../../services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ModalController } from "@ionic/angular";
import {
  FlightPolicy,
  PassengerFlightSegments,
  PassengerFlightSelectedInfo
} from "src/app/flight/flight.service";
import { FlightSegmentEntity } from "./../../models/flight/FlightSegmentEntity";
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-selected-flightsegment-info",
  templateUrl: "./selected-flightsegment-info.component.html",
  styleUrls: ["./selected-flightsegment-info.component.scss"]
})
export class SelectedFlightsegmentInfoComponent implements OnInit {
  selectedInfos: PassengerFlightSegments[];
  identity: IdentityEntity;
  constructor(private modalCtrl: ModalController) {}

  async ngOnInit() {}
  async back() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss().catch(_ => {});
    }
  }
  async nextStep() {
    const t = await this.modalCtrl.getTop();
    if (t) {
      t.dismiss({ nextStep: true }).catch(_ => {});
    }
  }
  async reset(item: PassengerFlightSelectedInfo) {
    item.reset = true;
    this.back();
  }
}
