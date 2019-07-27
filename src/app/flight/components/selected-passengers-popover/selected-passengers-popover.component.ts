import { CredentialsEntity } from "./../../../tmc/models/CredentialsEntity";
import {
  FlightService,
  PassengerBookInfo
} from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { StaffEntity } from "src/app/hr/staff.service";
import { PopoverController } from "@ionic/angular";
@Component({
  selector: "app-selected-passengers-popover",
  templateUrl: "./selected-passengers-popover.component.html",
  styleUrls: ["./selected-passengers-popover.component.scss"]
})
export class SelectedPassengersPopoverComponent implements OnInit {
  bookInfos$: Observable<PassengerBookInfo[]>;
  selectedItem: PassengerBookInfo;
  constructor(
    flightService: FlightService,
    private popoverCtrl: PopoverController
  ) {
    this.bookInfos$ = flightService.getPassengerBookInfoSource();
  }
  async onSelect(ok?: string) {
    const t = await this.popoverCtrl
      .dismiss(
        ok
          ? this.selectedItem &&
              this.selectedItem.passenger &&
              this.selectedItem.passenger.AccountId
          : null
      )
      .catch(_ => void 0);
  }
  ngOnInit() {}
}
