import { IHotelInfo } from "./../../hotel/hotel.service";
import { CalendarService } from "./../../tmc/calendar.service";
import { StaffService } from "./../../hr/staff.service";
import { ModalController, PopoverController } from "@ionic/angular";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import {
  IInterHotelSearchCondition,
  InternationalHotelService,
  IInterHotelInfo
} from "./../international-hotel.service";
import { Component, OnInit, OnDestroy, EventEmitter } from "@angular/core";
import { TripType } from "src/app/tmc/models/TripType";
import { AppHelper } from "src/app/appHelper";
import {
  PassengerBookInfo,
  FlightHotelTrainType
} from "src/app/tmc/tmc.service";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectedPassengersComponent } from "src/app/tmc/components/selected-passengers/selected-passengers.component";
import { ShowStandardDetailsComponent } from "src/app/tmc/components/show-standard-details/show-standard-details.component";
import { OverHotelComponent } from '../components/over-hotel/over-hotel.component';

@Component({
  selector: "app-search-international-hotel",
  templateUrl: "./search-international-hotel.page.html",
  styleUrls: ["./search-international-hotel.page.scss"]
})
export class SearchInternationalHotelPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  canAddPassengers = false;
  isSelf = false;
  selectedPassengers: PassengerBookInfo<IHotelInfo>[];
  get selectedPassengersNumbers() {
    return this.hotelService.getBookInfos().filter(it => !!it.bookInfo).length;
  }
  get isShowSelectedInfos() {
    return this.hotelService.getBookInfos().some(it => !!it.bookInfo);
  }
  get totalFlyDays() {
    if (
      this.searchCondition &&
      this.searchCondition.checkinDate &&
      this.searchCondition.checkoutDate
    ) {
      const nums = Math.abs(
        this.calendarService.diff(
          this.searchCondition.checkoutDate,
          this.searchCondition.checkinDate,
          "days"
        )
      );
      return nums <= 0 ? 1 : nums;
    }
    return 0;
  }
  searchCondition: IInterHotelSearchCondition;
  constructor(
    private hotelService: InternationalHotelService,
    private router: Router,
    private modalController: ModalController,
    private staffService: StaffService,
    private popoverCtrl: PopoverController,
    private route: ActivatedRoute,
    private calendarService: CalendarService
  ) { }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onSelectNationality() {
    this.router.navigate([AppHelper.getRoutePath('select-nationality')])
  }
  async onShowStandardDesc() {
    const isSelf = await this.staffService.isSelfBookType();
    if (!isSelf) {
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
        details: s.Policy.HotelDescription.split("。")
      },
      cssClass: "ticket-changing"
    });
    p.present();
  }
  onAddAdultAndChildren() {
    this.router.navigate([AppHelper.getRoutePath("room-count-children")]);
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async _ => {
        this.isSelf = await this.staffService.isSelfBookType();
        this.canAddPassengers = !this.isSelf;
      })
    );
    this.subscriptions.push(
      this.hotelService.getBookInfoSource().subscribe(infos => {
        this.selectedPassengers = infos;
      })
    );
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe(c => {
        this.searchCondition = c;
      })
    );
  }

async onSearchHotel() {
    if(this.totalFlyDays>=15){
      const popover = await this.popoverCtrl.create({
        component: OverHotelComponent,
        translucent: true
      });
      return await popover.present();
    }
    this.router.navigate([AppHelper.getRoutePath("international-hotel-list")]);
  }
  onSelectPassenger() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger")], {
      queryParams: {
        forType: FlightHotelTrainType.HotelInternational
      }
    });
  }
  async onOpenSelectedPassengers() {
    const removeitem = new EventEmitter();
    removeitem.subscribe(async (info: PassengerBookInfo<IInterHotelInfo>) => {
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
        removeitem
      }
    });
    await m.present();
    await m.onDidDismiss();
    removeitem.unsubscribe();
  }
  onShowSelectedBookinfos() {
    this.router.navigate([
      AppHelper.getRoutePath("international-hotel-bookinfos")
    ]);
  }
  async onSelecDate(isCheckIn: boolean) {
    const days = await this.hotelService.openCalendar(
      null,
      isCheckIn ? TripType.checkIn : TripType.checkOut
    );
    if (days && days.length >= 2) {
      const checkInDate = days[0];
      const checkOutDate = days[1];
      this.hotelService.setSearchConditionSource({
        ...this.hotelService.getSearchCondition(),
        checkinDate: checkInDate.date,
        checkoutDate: checkOutDate.date
      });
    }
  }
  onSegmentChanged(ev: CustomEvent) {
    this.hotelService.setSearchConditionSource({
      ...this.hotelService.getSearchCondition(),
      hotelType: ev.detail.value
    });
  }
  onSearchCity() {
    this.router.navigate([AppHelper.getRoutePath("select-inter-city")]);
  }
}
