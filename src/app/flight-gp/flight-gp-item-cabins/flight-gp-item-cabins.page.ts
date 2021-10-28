import { IdentityService } from "../../services/identity/identity.service";
import { HrService, StaffEntity, StaffBookType } from "../../hr/hr.service";
import { DayModel } from "../../tmc/models/DayModel";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import { ActivatedRoute, Router } from "@angular/router";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import {
  ModalController,
  NavController,
  PopoverController,
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import {
  FlightPolicy,
  IFlightSegmentInfo,
} from "../models/PassengerFlightInfo";
import { of, Observable, Subscription } from "rxjs";
import {
  PassengerBookInfo,
  PassengerBookInfoGp,
  TmcService,
} from "src/app/tmc/tmc.service";
import { AppHelper } from "src/app/appHelper";
import { FlightFareType } from "../models/flight/FlightFareType";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchTypeModel } from "../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { OrderService } from "src/app/order/order.service";
import { FlightCabinFareType } from "../models/flight/FlightCabinFareType";
import { FlightGpService } from "../flight-gp.service";
import { FilterConditionModel } from "../models/flight/advanced-search-cond/FilterConditionModel";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-flight-gp-item-cabins",
  templateUrl: "./flight-gp-item-cabins.page.html",
  styleUrls: ["./flight-gp-item-cabins.page.scss"],
})
export class FlightGpItemCabinsPage implements OnInit {
  private cabins: FlightPolicy[] = [];
  private economyClassCabins: FlightPolicy[] = []; // 显示经济舱的最低价、协议价、全价
  private otherCabins: FlightPolicy[] = []; // 显示更多价格
  private pageUrl;
  segmenttype;
  vmCabins: FlightPolicy[] = [];
  bookInfos: PassengerBookInfo<any>[];
  @ViewChild(BackButtonComponent, { static: true })
  backbtn: BackButtonComponent;
  hasMoreCabins = true;
  hasFlightDynamic = false;
  vmFlightSegment: FlightSegmentEntity;
  FlightFareType = FlightFareType;
  staff: StaffEntity;
  showOpenBtn$ = of(0);

  identity: IdentityEntity;
  filteredPolicyPassenger$: Observable<PassengerBookInfo<IFlightSegmentInfo>>;
  filterConditions: FilterConditionModel;
  filterConditionSub = Subscription.EMPTY;
  selectedCabinType: number;
  cabinTypes: SearchTypeModel[];
  isSelf = true;
  isAgreement = false;
  isExchange = false;
  constructor(
    private flightGpService: FlightGpService,
    activatedRoute: ActivatedRoute,
    private modalCtrl: ModalController,
    private flydayService: CalendarService,
    private staffService: HrService,
    private identityService: IdentityService,
    private router: Router,
    private popoverController: PopoverController,
    private orderService: OrderService,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
    activatedRoute.queryParamMap.subscribe(async (p) => {
      this.pageUrl = this.router.url;
      try {
        this.vmFlightSegment = this.flightGpService.currentViewtFlightSegment;
        // this.initFlightSegments(this.vmFlightSegment)
        if (
          this.vmFlightSegment &&
          this.vmFlightSegment.Cabins &&
          this.vmFlightSegment.Cabins.some(
            (it) => it.FareType == FlightCabinFareType.Agreement
          )
        ) {
          this.isAgreement = true;
        }
        this.tmcService
          .getAgent()
          .then((a) => {
            this.hasFlightDynamic = a && a.HasFlightDynamic;
          })
          .catch();
        this.isSelf = await this.staffService.isSelfBookType();
        this.cabinTypes = this.getCabinTypes();
        const identity = await this.identityService
          .getIdentityAsync()
          .catch((_) => null);
        this.identity = identity;
        this.staff = await this.staffService.getStaff();
        if (
          this.staff &&
          this.staff.BookType == StaffBookType.Self &&
          !this.staff.Name
        ) {
          this.staff.Name = identity && identity.Name;
        }
        this.setDefaultFilteredInfo();
        const arr = this.flightGpService.getPassengerBookInfos();
        if (
          !arr.some((it) => it.isFilterPolicy) &&
          arr.length > 1 &&
          !this.isSelf
        ) {
          this.cabins = this.getPolicyCabins();
          this.initVmCabins(this.cabins);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
  get isAgent() {
    return this.tmcService.isAgent;
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("flight-list-gp")]);
  }
  private getCabinTypes() {
    let cts: SearchTypeModel[] = [];
    if (this.vmFlightSegment && this.vmFlightSegment.Cabins) {
      this.vmFlightSegment.Cabins.forEach((c) => {
        if (!cts.find((it) => it.id == c.Type)) {
          cts.push({
            id: c.Type,
            label: c.TypeName,
            isChecked: false,
          });
        }
      });
    }
    return cts;
  }
  getMothDay() {
    const t = this.vmFlightSegment && moment(this.vmFlightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    if (!d || !t) {
      return "";
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  getFlightIllegalTip() {
    const bookInfos = this.flightGpService.getPassengerBookInfos();
    const info = bookInfos.find((it) => it.isFilterPolicy);
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightIllegalTip
    );
  }
  getFlightlegalTip() {
    const bookInfos = this.flightGpService.getPassengerBookInfos();
    const info = bookInfos.find((it) => it.isFilterPolicy);
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightLegalTip
    );
  }

  onSearchDynamic(vmFlightSegment: any) {
    this.router.navigate([AppHelper.getRoutePath("flight-dynamic-info")], {
      queryParams: {
        Date: vmFlightSegment.TakeoffTime.substring(0, 10),
        FlightNumber: vmFlightSegment.Number,
        distinguish:
          vmFlightSegment.FromCityName + "," + vmFlightSegment.ToCityName,
      },
    });
  }

  // async initFlightSegments(s: FlightSegmentEntity) {
  //   try {
  //     const result = await this.flightGpService.getFlightSegmentDetail(s);
  //     // this.vmFlightSegment = result.FlightSegments[0];
  //     this.vmFlightSegment = {
  //       ...this.vmFlightSegment,
  //       PlaneAge:result.FlightSegments[0].PlaneAge,
  //       PlaneType:result.FlightSegments[0].PlaneType,
  //       TakeoffOntimeRate:result.FlightSegments[0].TakeoffOntimeRate,
  //       AverageDelay:result.FlightSegments[0].AverageDelay
  //     }
  //     console.log(this.vmFlightSegment,"vmFlightSegment")
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }

  private setDefaultFilteredInfo() {
    let bookInfos = this.flightGpService.getPassengerBookInfos();
    bookInfos = this.flightGpService.getPassengerBookInfos().map((it) => {
      it.isFilterPolicy = this.isSelf || !it.bookInfo || bookInfos.length == 1;
      return it;
    });
    this.flightGpService.setPassengerBookInfosSource(bookInfos);
  }
  private async getLowestFlightPolicyCabin(
    lowestFlightSegment: FlightSegmentEntity
  ) {
    let flightPolicyCabin: FlightPolicy;
    try {
      if (lowestFlightSegment) {
        const segs = this.flightGpService.getTotalFlySegments();
        let seg = segs.find((it) => it.Number == lowestFlightSegment.Number);
        seg =
          segs.find(
            (it) =>
              it.Number == lowestFlightSegment.Number &&
              it.TakeoffTime == lowestFlightSegment.TakeoffTime
          ) || seg;
        if (!seg.Cabins || !seg.Cabins.length) {
          await this.flightGpService.initFlightSegmentCabins(seg);
        }
        if (seg.Cabins) {
          seg.Cabins.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
          flightPolicyCabin = {
            Cabin: seg.Cabins[0],
            CabinCode: seg.Cabins[0].Code,
            // Rules: [],
            IsAllowBook: true,
            FlightNo: seg.Number,
          } as FlightPolicy;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return flightPolicyCabin;
  }

  async dismissAllTopOverlays() {
    console.time("dismissAllTopOverlays");
    let top = await this.modalCtrl.getTop();
    let i = 10;
    while (top && --i > 0) {
      await top.dismiss().catch((_) => {});
      top = await this.modalCtrl.getTop();
    }
    console.timeEnd("dismissAllTopOverlays");
    return true;
  }

  async onBookTicket(cabin: FlightPolicy) {
    try {
      if (this.flightGpService.checkIfTimeout()) {
        await this.flightGpService.showTimeoutPop(true, this.pageUrl);
        this.backbtn.popToPrePage();
        return;
      }
      const flightCabin = cabin.Cabin;
      // let isShowPage = false;
      let bookInfos = this.flightGpService.currentViewtFlightSegment;
      let bookInfogp = this.flightGpService.getPassengerBookInfosGp();
      // const res = await this.flightGpService.addOrReplaceSegmentInfo(
      if (bookInfos) {
        const info = {
          ...bookInfogp[0],
          Seg: 0,
          Cabin: flightCabin,
          flightSegment: this.vmFlightSegment,
        } as PassengerBookInfoGp;
        bookInfogp[0] = info;
        this.flightGpService.setPassengerBookInfoGpSource(bookInfogp);
      }

      this.dismissAllTopOverlays();
      this.router.navigate([
        AppHelper.getRoutePath("selected-confirm-bookinfos-gp"),
      ]);

      // console.log(flightCabin,'====',bookInfos)
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  onSegmentChanged(ev: CustomEvent) {
    this.segmenttype = ev.detail.value;
    if (this.segmenttype == "normal") {
      this.vmCabins = this.economyClassCabins;
    } else {
      this.vmCabins = this.otherCabins;
    }
  }
  private initVmCabins(cabins: FlightPolicy[]) {
    if (!cabins || !cabins.length) {
      return;
    }
    this.otherCabins = [];
    this.economyClassCabins = [];
    let lowestPrice = Infinity;
    if (cabins) {
      cabins.forEach((it) => {
        lowestPrice = Math.min(+it.Cabin.SalesPrice, lowestPrice);
      });
    }
    cabins.sort((a, b) => +a.Cabin.SalesPrice - +b.Cabin.SalesPrice);
    const isfirstAgreementCabin = cabins.find(
      (it) => it.Cabin && +it.Cabin.FareType == FlightFareType.Agreement
    );

    cabins.forEach((it) => {
      if (
        it.Cabin &&
        it.Cabin.TypeName.includes("经济")
        // it.Cabin.Type == FlightCabinType.Y &&
        // // 最低价
        // (it.Cabin.SalesPrice == `${lowestPrice}` ||
        //   // 全价
        //   +it.Cabin.Discount >= 1 ||
        //   // 协议价
        //   +it.Cabin.FareType == FlightFareType.Agreement
      ) {
        this.economyClassCabins.push(it);
        // if (+it.Cabin.FareType == FlightFareType.Agreement) {
        //   if (it == isfirstAgreementCabin) {
        //     this.economyClassCabins.push(it);
        //   } else {
        //     this.otherCabins.push(it);
        //   }
        // } else if (+it.Cabin.FareType != FlightFareType.Agreement) {
        //   this.economyClassCabins.push(it);
        // }
      } else if (it.Cabin) {
        this.otherCabins.push(it);
      }
    });
    this.hasMoreCabins = !!this.otherCabins.length;
    this.economyClassCabins.sort((a, b) =>
      b.Cabin && a.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    this.otherCabins.sort((a, b) =>
      a.Cabin && b.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    if (this.economyClassCabins.length) {
      this.vmCabins = this.economyClassCabins;
      this.segmenttype = "normal";
    } else {
      this.segmenttype = "others";
      this.hasMoreCabins = false;
      this.vmCabins = this.otherCabins;
    }
    console.log(this.vmCabins, "cabins");
  }
  // onShowSelectedInfosPage() {
  //   this.flightService.showSelectedBookInfosPage();
  // }
  async openrules(cabin: any) {
    console.log("cabin", cabin);
    // roomPlan.Variables = JSON.stringify(roomPlan.VariablesJsonObj);
    // this.Variables
    // if (cabin && cabin.Cabin && !cabin.Cabin.Variables.Change) {
    //   cabin.Explain = await this.flightGpService
    //     .getTravelNDCFlightCabinRuleResult(cabin.Cabin)
    //     .catch(() => "");
    //   if (cabin.Explain) {
    //     cabin.Cabin.Explain = cabin.Explain;
    //   }
    // }
    // this.popoverController.dismiss().catch(_ => {});
    const m = await this.popoverController.create({
      component: TicketchangingComponent,
      componentProps: { cabin: cabin },
      showBackdrop: true,
      cssClass: "ticket-changing",
      // animated: false
    });
    await m.present();
  }
  async onFilterCabinType(evt: CustomEvent) {
    console.log(evt, this.cabinTypes);
    if (evt && evt.detail) {
      const cabins = this.cabinTypes.filter((it) => it.isChecked);
      this.flightGpService.setFilterConditionSource({
        ...this.flightGpService.getFilterCondition(),
        cabins,
      });
      this.cabins = this.getPolicyCabins();
      this.initVmCabins(this.cabins);
    }
  }
  onionChange(c: { id: string }) {
    if (this.isSelf) {
      this.cabinTypes = this.cabinTypes.map((it) => {
        it.isChecked = it.id == c.id;
        return it;
      });
    }
  }
  async ngOnInit() {
    this.filterConditionSub = this.flightGpService
      .getFilterConditionSource()
      .subscribe((c) => {
        this.filterConditions = c;
        const cabin = c && c.cabins.find((it) => it.isChecked);
        if (cabin) {
          this.selectedCabinType = +cabin.id;
        }
      });
    this.setDefaultFilteredInfo();
    // this.filteredPolicyPassenger$ = this.flightGpService
    //   .getPassengerBookInfoSource()
    //   .pipe(
    //     tap((infos) => {
    //       this.isExchange = infos && infos.every((it) => it.exchangeInfo);
    //     }),
    //     map((infos) => infos.find((it) => it.isFilterPolicy&&!it.exchangeInfo))
    //   );
    // this.showOpenBtn$ = this.flightGpService
    //   .getPassengerBookInfoSource()
    //   .pipe(
    //     map((infos) => infos && infos.filter((it) => !!it.bookInfo).length)
    //   );
    this.cabins = this.getPolicyCabins();
    this.initVmCabins(this.cabins);
    // this.onShowMoreCabins();
  }

  private getPolicyCabins() {
    const isfilteredBookInfo = this.flightGpService
      .getPassengerBookInfos()
      .find((it) => it.isFilterPolicy);
    const bookInfo = isfilteredBookInfo;
    let policyCabins = this.flightGpService.filterPassengerPolicyCabins({
      data: bookInfo,
      flightSegment: { ...this.vmFlightSegment },
    });
    if (
      this.filterConditions &&
      this.filterConditions.cabins &&
      this.filterConditions.cabins.length
    ) {
      policyCabins = policyCabins.filter(
        (c) =>
          c.Cabin &&
          this.filterConditions.cabins.some((it) => it.id == c.Cabin.Type)
      );
    }
    console.log("showPolicyCabins ", policyCabins);
    return policyCabins;
  }
}
