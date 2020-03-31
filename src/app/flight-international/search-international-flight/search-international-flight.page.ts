import { Component, OnInit, OnDestroy } from "@angular/core";
import { StaffService } from "src/app/hr/staff.service";
import {
  InternationalFlightService,
  IInternationalFlightSegmentInfo,
  IInternationalFlightSearchModel,
  FlightVoyageType,
  ITripInfo
} from "../international-flight.service";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  PassengerBookInfo,
  FlightHotelTrainType
} from "src/app/tmc/tmc.service";
import { PopoverController } from "@ionic/angular";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { Router } from "@angular/router";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { TripType } from "src/app/tmc/models/TripType";

@Component({
  selector: "app-search-international-flight",
  templateUrl: "./search-international-flight.page.html",
  styleUrls: ["./search-international-flight.page.scss"]
})
export class SearchInternationalFlightPage
  implements OnInit, OnDestroy, CanComponentDeactivate {
  private subscriptions: Subscription[] = [];
  FlightVoyageType = FlightVoyageType;
  selectedPassengers: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  isSelf = true;
  isCanleave = true;
  disabled = false;
  searchFlightModel: IInternationalFlightSearchModel;
  constructor(
    private staffService: StaffService,
    private flightService: InternationalFlightService,
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}
  compareWithFn = (o1, o2) => {
    return o1 && o2 ?  o1 === o2:false;
  };
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onSelectCity(isFrom: boolean, trip: ITripInfo) {
    if (this.disabled) {
      return;
    }
    this.flightService.beforeSelectCity(isFrom, trip);
  }
  async onShowStandardDesc() {
    this.isSelf = await this.staffService.isSelfBookType();
    if (!this.isSelf) {
      return;
    }
    let s = await this.staffService.getStaff();
    if (!s) {
      s = await this.staffService.getStaff(true);
    }
    if (!s || !s.Policy || !s.Policy.FlightDescription) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: ShowStandardDetailsComponent,
      componentProps: {
        details: s.Policy.FlightDescription.split(",")
      },
      cssClass: "ticket-changing"
    });
    p.present();
  }
  searchFlight() {}
  onSegmentChanged(evt: CustomEvent) {
    // console.log(evt.detail.value);
    this.flightService.setSearchModelSource({
      ...this.flightService.getSearchModel(),
      voyageType: evt.detail.value
    });
  }
  onSwapCity(trip: { fromCity: TrafficlineEntity; toCity: TrafficlineEntity }) {
    if (!trip || !trip.fromCity || !trip.toCity) {
      return;
    }
    const t = trip.fromCity;
    trip.fromCity = trip.toCity;
    trip.toCity = t;
  }
  onAddMoreTrip() {
    this.flightService.addMoreTrip();
  }
  onSelectPassenger() {
    this.isCanleave = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: { forType: FlightHotelTrainType.InternationalFlight }
    });
  }
  async onSelecFlyDate(isFrom: boolean, trip: ITripInfo) {
    if (this.disabled) {
      return;
    }
    this.flightService.onSelecFlyDate(isFrom, trip);
  }
  onRemoveTrip(trip: ITripInfo) {
    if (this.searchFlightModel && trip) {
      this.searchFlightModel.trips = this.searchFlightModel.trips.filter(
        it => it.id != trip.id
      );
      this.flightService.setSearchModelSource(this.searchFlightModel);
    }
  }
  ngOnInit() {
    try {
      this.staffService.isSelfBookType().then(s => {
        this.isSelf = s;
      });
      this.subscriptions.push(
        this.flightService.getSearchModelSource().subscribe(s => {
          console.log(s);
          this.searchFlightModel = s;
        })
      );
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  canDeactivate() {
    return this.isCanleave;
  }
}
