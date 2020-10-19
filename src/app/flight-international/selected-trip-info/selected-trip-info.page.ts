import { Component, OnInit, OnDestroy } from "@angular/core";
import { FlightRouteEntity } from "src/app/flight/models/flight/FlightRouteEntity";
import {
  IInternationalFlightSearchModel,
  InternationalFlightService,
  ITripInfo,
  IFilterCondition,
  IInternationalFlightSegmentInfo,
  FlightVoyageType,
} from "../international-flight.service";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { PassengerBookInfo } from "src/app/tmc/tmc.service";
import { StaffService } from "src/app/hr/staff.service";

@Component({
  selector: "app-selected-trip-info",
  templateUrl: "./selected-trip-info.page.html",
  styleUrls: ["./selected-trip-info.page.scss"],
})
export class SelectedTripInfoPage implements OnInit, OnDestroy {
  searchModel: IInternationalFlightSearchModel;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  FlightVoyageType=FlightVoyageType;
  curTrip: ITripInfo;
  condition: IFilterCondition;
  isSelf = true;
  passengers: PassengerBookInfo<IInternationalFlightSegmentInfo>[];
  constructor(
    public router: Router,
    private flightService: InternationalFlightService,
    private staffService: StaffService,
    private route: ActivatedRoute
  ) { }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  getFlyTime(duration: number) {
    if (!duration) {
      return "";
    }
    return this.flightService.getFlyTime(duration);
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.staffService.isSelfBookType().then((is) => {
          this.isSelf = is;
        });
      })
    );
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.flightService.getBookInfoSource().subscribe((infos) => {
        this.passengers = infos;
      })
    );
    this.subscriptions.push(
      this.flightService.getSearchModelSource().subscribe((s) => {
        this.searchModel = s;
        if (s && s.trips) {
          this.curTrip = s.trips.find((it) => !it.bookInfo);
          if (!this.curTrip) {
            this.curTrip = s.trips[s.trips.length - 1];
          }
        }
      })
    );
    this.subscriptions.push(
      this.flightService.getFilterConditionSource().subscribe((c) => {
        this.condition = c;
      })
    );
    console.log(this.searchModel, "this.searchModel1111");
  }
  onReserve() {
    this.router.navigate(["flight-ticket-reserve"]);
  }
  onSelectSeat() {
    this.router.navigate(["choose-flight-seat"]);
  }
  getTransferSegments(index, item, transferSegments) {
    if (transferSegments[index + 1] && transferSegments[index + 1].FromAirport) {
      // console.log(item.ToAirport, transferSegments[index + 1].FromAirport, "item");
      if (item.ToAirport == transferSegments[index + 1].FromAirport && item.ToAirportName == transferSegments[index + 1].FromAirportName) {
        return `${item.ToCityName}  ${item.ToAirport}  ${item.ToAirportName}`
      }
      return `${item.ToCityName} ${item.ToAirport} ${item.ToAirportName}   |   ${transferSegments[index + 1].FromCityName} ${transferSegments[index + 1].FromAirport} ${transferSegments[index + 1].FromAirportName}`
    }

  }
  getOneWay(){
    if(this.searchModel&&this.searchModel.voyageType){
      if(this.searchModel.voyageType==FlightVoyageType.OneWay){
        return true
      }else if(this.searchModel.voyageType==FlightVoyageType.MultiCity){
        if(this.searchModel.trips[0].fromCity.CountryCode=="CN"&&this.searchModel.trips[(this.searchModel.trips.length)-1].toCity.CountryCode!="CN"){
          return true
        }
      }
      return false
    }
  }
}
