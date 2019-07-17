import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { MemberCredential } from "src/app/member/member.service";
import { StaffEntity } from "src/app/hr/staff.service";
import { PopoverController } from "@ionic/angular";
type Info = StaffEntity & {
  credential: MemberCredential;
};
@Component({
  selector: "app-selected-passengers-popover",
  templateUrl: "./selected-passengers-popover.component.html",
  styleUrls: ["./selected-passengers-popover.component.scss"]
})
export class SelectedPassengersPopoverComponent implements OnInit {
  passengers$: Observable<Info[]>;
  passenger: Info;
  constructor(
    flightService: FlightService,
    private popoverCtrl: PopoverController
  ) {
    this.passengers$ = combineLatest([
      flightService.getSelectedPasengerSource(),
      flightService.getPassengerFlightSegmentSource()
    ]).pipe(
      map(([passengers, psinfos]) => {
        console.log(passengers, psinfos);
        return passengers
          .reduce(
            (arr, p) => {
              if (!arr.find(i => i.AccountId==p.AccountId)) {
                arr.push(p);
              }
              return arr;
            },
            [] as StaffEntity[]
          )
          .map(p => {
            const one = psinfos.find(
              item => item.passenger.AccountId == p.AccountId
            );
            return {
              ...p,
              credential: one && one.credential
            };
          });
      })
    );
  }
  async onSelect(ok?: string) {
    const t = await this.popoverCtrl
      .dismiss(ok ? this.passenger && this.passenger.AccountId : null)
      .catch(_ => void 0);
  }
  ngOnInit() {}
}
