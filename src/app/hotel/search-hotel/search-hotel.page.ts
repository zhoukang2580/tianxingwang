import { LanguageHelper } from './../../languageHelper';
import { ImageRecoverService } from "./../../services/imageRecover/imageRecover.service";
import { DayModel } from "src/app/tmc/models/DayModel";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { CalendarService } from "src/app/tmc/calendar.service";
import { FlightHotelTrainType, PassengerBookInfo } from "./../../tmc/tmc.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { HotelService, IHotelInfo } from "./../hotel.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Observable, Subscription, from, of } from "rxjs";
import { Component, OnInit, OnDestroy, AfterViewInit, EventEmitter } from "@angular/core";
import { NavController, ModalController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { StaffService } from "src/app/hr/staff.service";
import { map } from "rxjs/operators";
import * as moment from "moment";
import { TripType } from "src/app/tmc/models/TripType";
import { SelectedPassengersComponent } from 'src/app/tmc/components/selected-passengers/selected-passengers.component';
@Component({
  selector: "app-search-hotel",
  templateUrl: "./search-hotel.page.html",
  styleUrls: ["./search-hotel.page.scss"]
})
export class SearchHotelPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  isShowSelectedInfos$: Observable<boolean>;
  canAddPassengers = false;
  get selectedPassengers() {
    return this.hotelService.getBookInfos().length
  };
  get totalFlyDays() {
    if (this.checkInDate && this.checkOutDate) {
      const nums =
        Math.abs(moment(this.checkOutDate.date).diff(
          moment(this.checkInDate.date), 'days'))
      return nums <= 0 ? 1 : nums;
    }
    return 0;
  }
  disabled: boolean;
  destinationCity: TrafficlineEntity;
  checkInDate: DayModel;
  checkOutDate: DayModel;
  curPos: TrafficlineEntity = {} as any;
  isPositioning = false;
  activeTab = "normal";
  isLeavePage = false;
  constructor(
    private router: Router,
    private hotelService: HotelService,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private tmcSerivce: TmcService,
    private modalController: ModalController,
    private staffService: StaffService,
    private calendarService: CalendarService
  ) {
    const sub = route.queryParamMap.subscribe(async _ => {
      this.isLeavePage = false;
      this.canAddPassengers = !(await this.staffService.isSelfBookType());
    });
    this.subscriptions.push(sub);
  }
  segmentChanged(ev: CustomEvent) {
    // console.log("Segment changed", ev);
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      hotelType: ev.detail.value
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
  }
  ngOnInit() {
    this.onPosition();
    this.initCheckInCheckOutDate();
    const sub = this.hotelService.getSearchHotelModelSource().subscribe(m => {
      this.activeTab = m.hotelType;
      if (m && m.destinationCity) {
        this.curPos = m.destinationCity;
        this.curPos.CityName = m.destinationCity.Name;
        this.curPos.CityCode = m.destinationCity.Code;
        this.destinationCity = m.destinationCity;
      }
    });
    this.subscriptions.push(sub);
  }
  onSearchCity() {
    this.router.navigate([AppHelper.getRoutePath("hotel-city")]);
  }
  async onPosition() {
    this.isPositioning = true;
    this.curPos = { CityName: "正在定位..." } as any;
    const curPos: {
      city: TrafficlineEntity;
      position: any;
    } = await this.hotelService.getCurPosition().catch(_ => null);
    if (this.isLeavePage) {
      return;
    }
    if (curPos) {
      this.curPos = curPos.city;
      this.curPos.Code = curPos.city.CityCode;
      const cities = await this.hotelService.getHotelCityAsync();
      if (cities) {
        const c = cities.find(it => it.Code == this.curPos.Code);
        if (c) {
          this.hotelService.setSearchHotelModel({
            ...this.hotelService.getSearchHotelModel(),
            destinationCity: c
          });
          await this.hotelService.getConditions(true);
        } else {
          this.curPos = { CityName: "定位出错啦" } as any;
        }
      }
    } else {
      this.curPos = { CityName: "定位出错啦" } as any;
    }
    this.isPositioning = false;
  }
  private initCheckInCheckOutDate() {
    this.checkInDate = this.calendarService.generateDayModel(moment());
    this.checkOutDate = this.calendarService.generateDayModel(
      moment().add(1, "days")
    );
  }
  onShowSelectedBookInfos() { }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], { queryParams: { forType: FlightHotelTrainType.Hotel } });
  }
  async onOpenSelectedPassengers() {
    const removeitem = new EventEmitter();
    removeitem.subscribe(async (info: PassengerBookInfo<IHotelInfo>) => {
      const ok = await AppHelper.alert(LanguageHelper.getConfirmDeleteTip(), true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
      if (ok) {
        this.hotelService.removeBookInfo(info, true);
      }
    });
    const m = await this.modalController.create({
      component: SelectedPassengersComponent,
      componentProps: {
        bookInfos$: this.hotelService.getBookInfoSource(),
        removeitem: removeitem
      }
    });
    await m.present();
    await m.onDidDismiss();
    removeitem.unsubscribe();
  }
  async onSelecDate(isCheckIn: boolean) {
    const days = await this.hotelService.openCalendar(
      this.checkInDate,
      isCheckIn ? TripType.checkIn : TripType.checkOut
    );
    if (days && days.length >= 2) {
      this.checkInDate = days[0];
      this.checkOutDate = days[1];
    }
  }
  async onSearchHotel() {
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      checkInDate: this.checkInDate.date,
      checkOutDate: this.checkOutDate.date,
      destinationCity: this.destinationCity,
    });
    await this.hotelService.getConditions();
    this.isLeavePage = true;
    this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("")]);
  }
}
