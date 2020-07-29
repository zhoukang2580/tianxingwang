import {
  InternationalHotelService,
  IInterHotelSearchCondition,
} from "./../../hotel-international/international-hotel.service";
import { LanguageHelper } from "./../../languageHelper";
import { ImageRecoverService } from "./../../services/imageRecover/imageRecover.service";
import { DayModel } from "src/app/tmc/models/DayModel";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { CalendarService } from "src/app/tmc/calendar.service";
import {
  FlightHotelTrainType,
  PassengerBookInfo,
} from "./../../tmc/tmc.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { HotelService, IHotelInfo, SearchHotelModel } from "./../hotel.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Observable, Subscription, from, of } from "rxjs";
import { Component, OnInit, OnDestroy, EventEmitter } from "@angular/core";
import { ModalController, PopoverController } from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { StaffService } from "src/app/hr/staff.service";
import { map } from "rxjs/operators";
import * as moment from "moment";
import { TripType } from "src/app/tmc/models/TripType";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { OverHotelComponent } from "../components/over-hotel/over-hotel.component";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-search-hotel",
  templateUrl: "./search-hotel.page.html",
  styleUrls: ["./search-hotel.page.scss"],
})
export class SearchHotelPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  get isShowSelectedInfos() {
    return this.hotelService.getBookInfos().some((it) => !!it.bookInfo);
  }
  canAddPassengers = false;
  isSelf = false;
  isDomestic = true;
  searchHotelModel: SearchHotelModel;
  interHotelSearchCondition: IInterHotelSearchCondition;
  get changeDateTipMsg() {
    if (this.getHoursCondition()) {
      const m = this.calendarService.getMoment(0);
      return `如需00:00-06:00入住，请选择${m
        .add(-1, "days")
        .format("MM月DD日")}入住`;
    }
    return "";
  }
  disabled: boolean;
  isPositioning = false;
  isLeavePage = false;
  private getHoursCondition() {
    return this.hotelService.hotelIsCanSelectYesterday();
  }
  get selectedBookInfosNumber() {
    return this.hotelService.getBookInfos().filter((it) => !!it.bookInfo)
      .length;
  }
  get selectedPassengers() {
    return this.hotelService.getBookInfos().length;
  }
  get totalFlyDays() {
    if (
      this.searchHotelModel &&
      this.searchHotelModel.checkInDate &&
      this.searchHotelModel.checkOutDate
    ) {
      const nums = Math.abs(
        this.calendarService.diff(
          this.searchHotelModel.checkOutDate,
          this.searchHotelModel.checkInDate,
          "days"
        )
      );

      return nums <= 0 ? 1 : nums;
    }
    return 0;
  }

  constructor(
    private router: Router,
    private hotelService: HotelService,
    route: ActivatedRoute,
    private modalController: ModalController,
    private staffService: StaffService,
    private calendarService: CalendarService,
    private popoverCtrl: PopoverController,
    private internationalHotelService: InternationalHotelService
  ) {
    const sub = route.queryParamMap.subscribe(async (_) => {
      this.isLeavePage = false;
      this.canAddPassengers = !(await this.staffService.isSelfBookType());
      this.isSelf = await this.staffService.isSelfBookType();
    });
    this.subscriptions.push(sub);
  }
  private observeSearchCondition() {
    this.subscriptions.push(
      this.internationalHotelService
        .getSearchConditionSource()
        .subscribe((s) => {
          this.interHotelSearchCondition = s;
        })
    );
    this.subscriptions.push(
      this.hotelService.getSearchHotelModelSource().subscribe((m) => {
        this.searchHotelModel = m;
      })
    );
  }
  onToggleDomestic() {
    this.isDomestic = !this.isDomestic;
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
    if (!s || !s.Policy || !s.Policy.HotelDescription) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: ShowStandardDetailsComponent,
      componentProps: {
        details: s.Policy.HotelDescription.split("。"),
      },
      cssClass: "ticket-changing",
    });
    p.present();
  }
  onSegmentChanged(ev: CustomEvent) {
    // console.log("Segment changed", ev);
    this.hotelService.setSearchHotelModel({
      ...this.hotelService.getSearchHotelModel(),
      hotelType: ev.detail.value,
    });
    this.internationalHotelService.setSearchConditionSource({
      ...this.internationalHotelService.getSearchCondition(),
      hotelType: ev.detail.value,
    });
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => {
      if (sub) {
        sub.unsubscribe();
      }
    });
    this.subscriptions = [];
  }
  ngOnInit() {
    this.observeSearchCondition();
    this.onPosition();
  }
  onSearchCity() {
    if (this.isDomestic) {
      this.router.navigate([AppHelper.getRoutePath("hotel-city")]);
    } else {
      this.router.navigate([AppHelper.getRoutePath("select-inter-city")]);
    }
  }

  async onPosition() {
    this.isPositioning = true;
    if (this.isLeavePage) {
      return;
    }
    if (this.searchHotelModel) {
      const cities = await this.hotelService.getHotelCityAsync();
      if (cities) {
        const c = cities.find(
          (it) =>
            it.Code ==
            (this.searchHotelModel.destinationCity &&
              this.searchHotelModel.destinationCity.Code)
        );
        if (c) {
          this.hotelService.setSearchHotelModel({
            ...this.hotelService.getSearchHotelModel(),
            destinationCity: c,
          });
          await this.hotelService.getConditions(true);
        }
      }
    }
    this.isPositioning = false;
  }
  onShowSelectedBookInfos() {
    this.router.navigate([AppHelper.getRoutePath("hotel-room-bookedinfos")]);
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: {
        forType: this.isDomestic
          ? FlightHotelTrainType.Hotel
          : FlightHotelTrainType.HotelInternational,
      },
    });
  }
  async onOpenSelectedPassengers() {
    const removeitem = new EventEmitter();
    removeitem.subscribe(async (info: PassengerBookInfo<IHotelInfo>) => {
      const ok = await AppHelper.alert(
        LanguageHelper.getConfirmDeleteTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.hotelService.removeBookInfo(info, true);
      }
    });
    const m = await this.modalController.create({
      component: SelectedPassengersComponent,
      componentProps: {
        bookInfos$: this.hotelService.getBookInfoSource(),
        removeitem,
      },
    });
    await m.present();
    await m.onDidDismiss();
    removeitem.unsubscribe();
  }
  async onSelecDate(isCheckIn: boolean) {
    const days = await this.hotelService.openCalendar({
      tripType: isCheckIn ? TripType.checkIn : TripType.checkOut,
    });
    if (days && days.length >= 2) {
      const checkInDate = days[0];
      const checkOutDate = days[1];
      if (this.isDomestic) {
        this.hotelService.setSearchHotelModel({
          ...this.hotelService.getSearchHotelModel(),
          checkInDate: checkInDate.date,
          checkOutDate: checkOutDate.date,
        });
      } else {
        this.internationalHotelService.setSearchConditionSource({
          ...this.internationalHotelService.getSearchCondition(),
          checkinDate: checkInDate.date,
          checkoutDate: checkOutDate.date,
        });
      }
    }
  }
  async onSearchHotel() {
    if (this.totalFlyDays >= 15) {
      const popover = await this.popoverCtrl.create({
        component: OverHotelComponent,
        translucent: true,
      });
      return await popover.present();
    }
    if (this.isDomestic) {
      this.hotelService.setHotelQuerySource({
        ...this.hotelService.getHotelQueryModel(),
        ranks: null,
        starAndPrices: null,
        Geos: null,
        locationAreas: null,
        searchGeoId: null,
        filters: null,
      });
      this.hotelService.getConditions();
      this.isLeavePage = true;
      this.router.navigate([AppHelper.getRoutePath("hotel-list")]);
    } else {
      this.router.navigate([
        AppHelper.getRoutePath("international-hotel-list"),
      ]);
    }
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("")]);
  }
}
