import { MemberCredential } from "src/app/member/member.service";
import { ModalController } from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { StaffEntity } from "src/app/hr/staff.service";
import { FlightService } from "../../flight.service";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
type Info = StaffEntity & {
  credential: MemberCredential;
};
@Component({
  selector: "app-selected-passengers",
  templateUrl: "./selected-passengers.component.html",
  styleUrls: ["./selected-passengers.component.scss"]
})
export class SelectedPassengersComponent implements OnInit {
  passengers$: Observable<Info[]>;
  constructor(
    private flightService: FlightService,
    private modalCtrl: ModalController
  ) {
    this.passengers$ = combineLatest([
      flightService.getSelectedPasengerSource(),
      flightService.getPassengerFlightSegmentSource()
    ]).pipe(
      map(([passengers, psinfos]) => {
        console.log(passengers, psinfos);
        return passengers.map(p => {
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
  async remove(info: Info) {
    if (info) {
      this.flightService.removeSelectedPassenger(info);
      const psinfos = this.flightService.getPassengerFlightSegments();
      const one = psinfos.find(
        item => item.passenger.AccountId == info.AccountId
      );
      if (one) {
        this.flightService.removePassengerFlightSegments([one]);
      }
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
