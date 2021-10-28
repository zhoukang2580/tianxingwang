import { Component, OnInit, OnDestroy } from "@angular/core";
import { HrService } from "src/app/hr/hr.service";
import {
  InternationalFlightService,
  IInternationalFlightSegmentInfo,
  IInternationalFlightSearchModel,
  FlightVoyageType,
  ITripInfo,
  FlightCabinInternationalType,
} from "../international-flight.service";
import { Subscription } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import {
  PassengerBookInfo,
  FlightHotelTrainType,
} from "src/app/tmc/tmc.service";
import { PopoverController } from "@ionic/angular";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { Router, ActivatedRoute } from "@angular/router";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { FlightCabinType } from "src/app/flight/models/flight/FlightCabinType";

@Component({
  selector: "app-search-international-flight",
  templateUrl: "./search-international-flight.page.html",
  styleUrls: ["./search-international-flight.page.scss"],
})
export class SearchInternationalFlightPage
  implements OnInit, OnDestroy, CanComponentDeactivate {
  private subscriptions: Subscription[] = [];
  private flightCabinLevelPolicies: { [FlightCabinType: number]: string };
  private typeMap = {
    [FlightCabinInternationalType.ECONOMY]: FlightCabinType.Y,
    [FlightCabinInternationalType.PREMIUM_BUSINESS]:
      FlightCabinType.BusinessPremier,
    [FlightCabinInternationalType.BUSINESS]: FlightCabinType.C,
    [FlightCabinInternationalType.PREMIUM_ECONOMY]: FlightCabinType.SeniorY,
    [FlightCabinInternationalType.FIRST]: FlightCabinType.F,
    [FlightCabinInternationalType.PREMIUM_FIRST]: FlightCabinType.SuperF,
  };
  flightCabinLevelPolicy: string;
  FlightVoyageType = FlightVoyageType;
  selectedPassengers: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  isSelf = true;
  isCanleave = true;
  disabled = false;
  isLoadingLevelPolicies = false;
  searchFlightModel: IInternationalFlightSearchModel;
  constructor(
    private staffService: HrService,
    private flightService: InternationalFlightService,
    private popoverCtrl: PopoverController,
    public router: Router,
    private route: ActivatedRoute,
    
  ) {}
  compareWithFn = (o1, o2) => {
    return o1 && o2 ? o1 === o2 : false;
  };
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onSelectCity(isFrom: boolean, trip: ITripInfo) {
    if (this.disabled) {
      return;
    }
    // this.flightService.beforeSelectCity(isFrom, trip);
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
    if (!s || !s.Policy || !s.Policy.InternationalFlightDescription) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: ShowStandardDetailsComponent,
      mode:"md",
      componentProps: {
        details: s.Policy.InternationalFlightDescription.split(","),
      },
      cssClass: "ticket-changing",
    });
    p.present();
  }
  searchFlight() {
    const m = this.searchFlightModel;
    if (m) {
      if (
        m.voyageType == FlightVoyageType.GoBack ||
        m.voyageType == FlightVoyageType.OneWay
      ) {
        if (m.trips[0] && m.trips[0].fromCity && m.trips[0].toCity) {
          if (
            (m.trips[0].fromCity.CountryCode || "").toLowerCase() == "cn" &&
            (m.trips[0].toCity.CountryCode || "").toLowerCase() == "cn"
          ) {
            AppHelper.toast("出发地和目的地不可全为大陆地区", 1500, "middle");
            return;
          }
        }
      }
    }
    this.router.navigate([AppHelper.getRoutePath("international-flight-list")]);
    this.flightService.flightListResult = null;
  }
  onSegmentChanged(evt: CustomEvent) {
    const voyageType: FlightVoyageType = evt.detail.value;
    if (voyageType == FlightVoyageType.OneWay) {
      this.flightService.initOneWaySearModel();
    }
    if (voyageType == FlightVoyageType.GoBack) {
      this.flightService.initGoBackSearchModel();
    }
    if (voyageType == FlightVoyageType.MultiCity) {
      this.flightService.initMultiTripSearchModel();
    }
  }
  onSwapCity(trip: { fromCity: TrafficlineEntity; toCity: TrafficlineEntity }) {
    if (!trip || !trip.fromCity || !trip.toCity) {
      return;
    }
    const t = trip.fromCity;
    trip.fromCity = trip.toCity;
    trip.toCity = t;
    if (this.searchFlightModel) {
      this.flightService.setSearchModelSource(this.searchFlightModel);
    }
  }
  onAddMoreTrip() {
    this.flightService.addMoreTrip();
  }
  onSelectCabin() {}
  onSelectPassenger() {
    this.isCanleave = true;
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: { forType: FlightHotelTrainType.InternationalFlight },
    });
  }
  async onSelectFlyDate(isFrom: boolean, trip: ITripInfo) {
    if (this.disabled) {
      return;
    }
    this.flightService.onSelectFlyDate(isFrom, trip);
  }
  onRemoveTrip(trip: ITripInfo) {
    if (this.searchFlightModel && trip) {
      this.searchFlightModel.trips = this.searchFlightModel.trips.filter(
        (it) => it.id != trip.id
      );
      this.flightService.setSearchModelSource(this.searchFlightModel);
    }
  }
  onCabinChange() {
    // this.loadLoadingLevelPolicies();
  }
  ngOnInit() {
    try {
      this.staffService.isSelfBookType().then((s) => {
        this.isSelf = s;
      });
      this.subscriptions.push(
        this.flightService.getSearchModelSource().subscribe((s) => {
          console.log(s);
          this.searchFlightModel = s;
        })
      );
      this.subscriptions.push(
        this.flightService.getBookInfoSource().subscribe((infos) => {
          this.selectedPassengers = infos;
        })
      );
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  // private async loadLoadingLevelPolicies() {
  //   if (!this.isLoadingLevelPolicies) {
  //     this.isLoadingLevelPolicies = true;
  //     this.flightCabinLevelPolicies = await this.flightService
  //       .flightCabinLevelPolicy()
  //       .catch(() => null);
  //     this.isLoadingLevelPolicies = false;
  //   }
  //   if (this.flightCabinLevelPolicies) {
  //     if (this.searchFlightModel && this.searchFlightModel.cabin) {
  //       this.flightCabinLevelPolicy = this.flightCabinLevelPolicies[
  //         this.typeMap[this.searchFlightModel.cabin.value]
  //       ];
  //     }
  //   }
  // }
  canDeactivate() {
    return this.isCanleave;
  }
}
