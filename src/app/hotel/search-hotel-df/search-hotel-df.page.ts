import {
  InternationalHotelService,
  IInterHotelSearchCondition,
} from "../../hotel-international/international-hotel.service";
import { LanguageHelper } from "../../languageHelper";
import { ImageRecoverService } from "../../services/imageRecover/imageRecover.service";
import { DayModel } from "src/app/tmc/models/DayModel";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { CalendarService } from "src/app/tmc/calendar.service";
import { FlightHotelTrainType, PassengerBookInfo } from "../../tmc/tmc.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { HotelService, IHotelInfo, SearchHotelModel } from "../hotel.service";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Observable, Subscription, from, of } from "rxjs";
import {
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import {
  IonCard,
  ModalController,
  Platform,
  PopoverController,
} from "@ionic/angular";
import { AppHelper } from "src/app/appHelper";
import { StaffService } from "src/app/hr/staff.service";
import { map } from "rxjs/operators";
import * as moment from "moment";
import { TripType } from "src/app/tmc/models/TripType";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { OverHotelComponent } from "../components/over-hotel/over-hotel.component";
import { environment } from "src/environments/environment";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
@Component({
  selector: "app-search-hotel-df",
  templateUrl: "./search-hotel-df.page.html",
  styleUrls: ["./search-hotel-df.page.scss"],
})
export class SearchHotelDfPage implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  @ViewChild("imgEles", { static: true }) imgEles: ElementRef<HTMLElement>;
  @ViewChild("ionCardEle", { static: true }) ionCard: IonCard;
  private subscriptions: Subscription[] = [];
  private fromRoute: string;
  get isShowSelectedInfos() {
    return this.hotelService.getBookInfos().some((it) => !!it.bookInfo);
  }
  canAddPassengers = false;
  isSelf = false;
  isDomestic = true;
  isIos = false;
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
    public router: Router,
    private hotelService: HotelService,
    route: ActivatedRoute,
    private modalController: ModalController,
    private staffService: StaffService,
    private calendarService: CalendarService,
    plt: Platform,
    private popoverCtrl: PopoverController,
    private internationalHotelService: InternationalHotelService
  ) {
    const sub = route.queryParamMap.subscribe(async (q) => {
      const fromCityCode = q.get("FromCityCode");
      const toCityCode = q.get("ToCityCode");
      const startDate = q.get("StartDate");
      if (fromCityCode && toCityCode && startDate) {
        const cities = await this.hotelService.getHotelCityAsync();
        const fromCity = cities.find((it) => it.Code == fromCityCode);
        const toCity = cities.find((it) => it.Code == toCityCode);
        if (fromCity && toCity) {
          let date = startDate.replace(/\./g, "-");
          const flag = AppHelper.getDate(date).getTime() < Date.now();
          if (flag) {
            date = this.calendarService.getNowDate();
          }
          this.hotelService.setSearchHotelModel({
            ...this.searchHotelModel,
            destinationCity: toCity,
            checkInDate: date,
          });
        }
      }
      this.fromRoute = q.get("fromRoute");
      this.isLeavePage = false;
      this.canAddPassengers = !(await this.staffService.isSelfBookType());
      this.isSelf = await this.staffService.isSelfBookType();
      this.isIos = plt.is("ios");
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
  private initEles() {
    setTimeout(() => {
      try {
        if (this.ionCard && this.imgEles) {
          let top = 0;
          const segments = this.ionCard["el"].querySelector(".segments");
          const cardRect = this.ionCard["el"].getBoundingClientRect();
          const rect = segments.getBoundingClientRect();
          const imgEleRect = this.imgEles.nativeElement.getBoundingClientRect();
          let offset = 10;
          if (!this.isIos) {
            offset = 15;
          }
          top = cardRect.top - rect.height + imgEleRect.height / 2 - offset;
          if (top && top > 0) {
            this.imgEles.nativeElement.style.top = `${top}px`;
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, 100);
  }
  ngAfterViewInit() {
    // if (this.isIos) {
    //   this.initEles();
    // }
  }
  onToggleDomestic(isDomestic) {
    this.isDomestic = isDomestic;
  }
  onSelectNationality() {
    this.router.navigate([AppHelper.getRoutePath("select-nationality")]);
  }
  onAddAdultAndChildren() {
    this.router.navigate([AppHelper.getRoutePath("room-count-children")]);
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
      mode: "md",
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
          checkInDate: checkInDate.date,
          checkOutDate: checkOutDate.date,
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
    if (this.fromRoute && this.fromRoute.toLowerCase() == "bookflight") {
      this.router.navigate([AppHelper.getRoutePath("")]);
    } else {
      this.backbtn.popToPrePage();
    }
  }
}
