import { LanguageHelper } from "src/app/languageHelper";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";
import { FlightCabinEntity } from "./../models/flight/FlightCabinEntity";
import { IdentityService } from "./../../services/identity/identity.service";
import { HrService, StaffEntity, StaffBookType } from "../../hr/hr.service";
import { DayModel } from "../../tmc/models/DayModel";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { ActivatedRoute, Router } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { Component, ElementRef, EventEmitter, OnInit, ViewChild } from "@angular/core";
import {
  ModalController,
  AlertController,
  NavController,
  PopoverController,
} from "@ionic/angular";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import * as moment from "moment";
import { FilterPassengersPolicyComponent } from "../../tmc/components/filter-passengers-popover/filter-passengers-policy-popover.component";
import {
  FlightPolicy,
  IFlightSegmentInfo,
} from "../models/PassengerFlightInfo";
import { of, Observable, Subscription } from "rxjs";
import { map, tap, filter } from "rxjs/operators";
import {
  FlightHotelTrainType,
  PassengerBookInfo,
  TmcService,
} from "src/app/tmc/tmc.service";
import { AppHelper } from "src/app/appHelper";
import { FlightFareType } from "../models/flight/FlightFareType";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchTypeModel } from "../models/flight/advanced-search-cond/SearchTypeModel";
import { FlightCabinType } from "../models/flight/FlightCabinType";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
import { OrderService } from "src/app/order/order.service";
import { TripType } from "src/app/tmc/models/TripType";
import { FlightCabinFareType } from "../models/flight/FlightCabinFareType";
import { SelectFlightsegmentCabinComponent } from "../components/select-flightsegment-cabin/select-flightsegment-cabin.component";
import { SelectFlightPassengerComponent } from "../components/select-flight-passenger/select-flight-passenger.component";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { FlightDynamicService } from "src/app/flight-dynamic/flight-dynamic.service";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-flight-item-cabins",
  templateUrl: "./flight-item-cabins.page.html",
  styleUrls: ["./flight-item-cabins.page.scss"],
})
export class FlightItemCabinsPage implements OnInit {
  private cabins: FlightPolicy[] = [];
  private economyClassCabins: FlightPolicy[] = []; // 显示经济舱的最低价、协议价、全价
  // private moreCabins: FlightPolicy[] = []; // 显示更多价格
  private otherCabins: FlightPolicy[] = [];
  private pageUrl;
  @ViewChild(BackButtonComponent, { static: true })
  backbtn: BackButtonComponent;
  vmCabins: FlightPolicy[] = [];
  hasMoreCabins = true;
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
  hasFlightDynamic = false;
  segmenttype;
  constructor(
    private flightService: FlightService,
    private flightDynamicService: FlightDynamicService,
    private route: ActivatedRoute,
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
    route.queryParamMap.subscribe(async (p) => {
      this.pageUrl = this.router.url;
      this.themeService.getModeSource().subscribe(m=>{
        if(m=='dark'){
          this.refEle.nativeElement.classList.add("dark")
        }else{
          this.refEle.nativeElement.classList.remove("dark")
        }
      })
      try {
        this.vmFlightSegment = this.flightService.currentViewtFlightSegment;
        // this.initFlightSegments(this.vmFlightSegment);

        this.tmcService
          .getAgent()
          .then((a) => {
            this.hasFlightDynamic = a&&a.HasFlightDynamic;
          })
          .catch();
        if (
          this.vmFlightSegment &&
          this.vmFlightSegment.Cabins &&
          this.vmFlightSegment.Cabins.some(
            (it) => it.FareType == FlightCabinFareType.Agreement
          )
        ) {
          this.isAgreement = true;
        }

        console.log(this.vmFlightSegment,"vmFlightSegment")
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
        const arr = this.flightService.getPassengerBookInfos();
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
    this.router.navigate([AppHelper.getRoutePath("flight-list")]);
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
    const bookInfos = this.flightService.getPassengerBookInfos();
    const info = bookInfos.find((it) => it.isFilterPolicy);
    return (
      info &&
      info.passenger &&
      info.passenger.Policy &&
      info.passenger.Policy.FlightIllegalTip
    );
  }
  getFlightlegalTip() {
    const bookInfos = this.flightService.getPassengerBookInfos();
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

  private setDefaultFilteredInfo() {
    let bookInfos = this.flightService.getPassengerBookInfos();
    bookInfos = this.flightService.getPassengerBookInfos().map((it) => {
      it.isFilterPolicy = this.isSelf || !it.bookInfo || bookInfos.length == 1;
      return it;
    });
    this.flightService.setPassengerBookInfosSource(bookInfos);
  }

  // async initFlightSegments(s: FlightSegmentEntity) {
  //   try {
  //     const result = await this.flightService.getFlightSegmentDetail(s);
  //     console.log(this.vmFlightSegment,"vmFlightSegment1")
  //     // this.vmFlightSegment = result.FlightSegments[0];
  //     this.vmFlightSegment = {
  //       ...this.vmFlightSegment,
  //       PlaneAge:result.FlightSegments[0].PlaneAge,
  //       PlaneType:result.FlightSegments[0].PlaneType,
  //       TakeoffOntimeRate:result.FlightSegments[0].TakeoffOntimeRate,
  //       AverageDelay:result.FlightSegments[0].AverageDelay
  //     }
      
  //     // this.vmFlightSegment.PlaneAge = result.FlightSegments[0].PlaneAge;
  //     // this.vmFlightSegment.PlaneType = result.FlightSegments[0].PlaneType;
  //     // this.vmFlightSegment.TakeoffOntimeRate = result.FlightSegments[0].TakeoffOntimeRate;
  //     // this.vmFlightSegment.AverageDelay = result.FlightSegments[0].AverageDelay;
  //     console.log(this.vmFlightSegment,"vmFlightSegment2")
  //   } catch (e) {
  //     console.error(e);
  //   }
  // }
  private async getLowestFlightPolicyCabin(
    lowestFlightSegment: FlightSegmentEntity
  ) {
    let flightPolicyCabin: FlightPolicy;
    try {
      if (lowestFlightSegment) {
        const segs = this.flightService.getTotalFlySegments();
        let seg = segs.find((it) => it.Number == lowestFlightSegment.Number);
        seg =
          segs.find(
            (it) =>
              it.Number == lowestFlightSegment.Number &&
              it.TakeoffTime == lowestFlightSegment.TakeoffTime
          ) || seg;
        if (!seg.Cabins || !seg.Cabins.length) {
          await this.flightService.initFlightSegmentCabins(seg);
        }
        if (seg.Cabins) {
          seg.Cabins.sort((a, b) => +a.SalesPrice - +b.SalesPrice);
          flightPolicyCabin = {
            Cabin: seg.Cabins[0],
            CabinCode: seg.Cabins[0].Code,
            Rules: [],
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
  private async selectLowerCabin(
    info: PassengerBookInfo<IFlightSegmentInfo>,
    cabin: FlightPolicy
  ) {
    if (!cabin || !cabin.LowerSegment) {
      return false;
    }
    let fs = this.flightService.flightGoTripResult.FlightSegments.find(
      (it) =>
        it.Number == cabin.LowerSegment.Number &&
        it.TakeoffTime == cabin.LowerSegment.TakeoffTime
    );
    if (!fs) {
      fs = this.flightService.flightGoTripResult.FlightSegments.find(
        (it) => it.Number == cabin.LowerSegment.Number
      );
    }
    if (!cabin.LowerSegment.Cabins || !cabin.LowerSegment.Cabins.length) {
      await this.flightService.initFlightSegmentCabins(fs);
      cabin.LowerSegment.Cabins = fs.Cabins.map((it) => ({ ...it }));

      console.log(cabin.LowerSegment.Cabins,"=======")

    }
    if (!cabin.LowerSegment.Cabins || !cabin.LowerSegment.Cabins.length) {
      return false;
    }
    const lowestFlightSegment: FlightSegmentEntity = fs;
    const lowestCabin = await this.getLowestFlightPolicyCabin(fs);
    const m = await this.modalCtrl.create({
      component: SelectFlightsegmentCabinComponent,
      componentProps: {
        policiedCabins: [lowestCabin],
        flightSegment: lowestFlightSegment,
        isAgent: this.isAgent,
      },
    });
    m.backdropDismiss = false;
    await this.flightService.dismissTopOverlay();
    await m.present();
    const result = await m.onDidDismiss();
    // const data = info.bookInfo;
    if (result.data) {
      const cbin = result.data;
      if (!cbin) {
        await AppHelper.alert(
          LanguageHelper.Flight.getTheLowestCabinNotFoundTip()
        );
      } else {
        const bookInfo: IFlightSegmentInfo = {
          flightPolicy: cbin,
          flightSegment: lowestFlightSegment,
          // tripType: (data && data.tripType) || TripType.departureTrip,
          id: AppHelper.uuid(),
          lowerSegmentInfo: null,
          originalBookInfo: {
            ...info,
            bookInfo: {
              ...info.bookInfo,
              lowerSegmentInfo: null,
            },
          },
        };
        bookInfo.flightPolicy.LowerSegment = null; // 更低价仅能选择一次.
        const newInfo: PassengerBookInfo<IFlightSegmentInfo> = {
          id: AppHelper.uuid(),
          passenger: info.passenger,
          credential: info.credential,
          isNotWhitelist: info.isNotWhitelist,
          bookInfo,
          exchangeInfo: info.exchangeInfo,
        };
        this.flightService.replacePassengerBookInfo(info, newInfo);
        if (
          this.flightService
            .getPassengerBookInfos()
            .filter((it) => !!it.bookInfo).length
        ) {
          await this.onShowSelectedInfosPage();
        }
        return true;
      }
    } else {
      return false;
    }
    return true;
  }
  async selectPassenger() {
    const removeitem = new EventEmitter<
      PassengerBookInfo<IFlightSegmentInfo>
    >();
    const sub = removeitem.subscribe(async (info) => {
      const ok = await AppHelper.alert(
        LanguageHelper.getConfirmDeleteTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      if (ok) {
        this.flightService.removePassengerBookInfo(info, true);
      }
    });
    const m = await this.modalCtrl.create({
      component: SelectFlightPassengerComponent,
      componentProps: {
        isOpenPageAsModal: true,
        removeitem,
        forType: FlightHotelTrainType.Flight,
        bookInfos$: this.flightService.getPassengerBookInfoSource(),
      },
    });
    // const oldBookInfos = this.flightService
    //   .getPassengerBookInfos()
    //   .map((it) => it.id);
    await m.present();
    await m.onDidDismiss();
    if (sub) {
      sub.unsubscribe();
    }
    // const newBookInfos = this.flightService
    //   .getPassengerBookInfos()
    //   .map((it) => it.id);
    // console.log(
    //   "old ",
    //   oldBookInfos.map((it) => it),
    //   "new ",
    //   newBookInfos.map((it) => it)
    // );
    this.setDefaultFilteredInfo();
    this.backbtn.popToPrePage();
  }
  async onBookTicket(cabin: FlightPolicy) {
    try {
      if (this.flightService.checkIfTimeout()) {
        await this.flightService.showTimeoutPop(true, this.pageUrl);
        this.backbtn.popToPrePage();
        return;
      }
      const should = await this.flightService.checkIfShouldAddPassenger();
      if (should) {
        await AppHelper.alert("请您先添加旅客");
        await this.selectPassenger();
        return;
      }
      const flightCabin = cabin.Cabin;
      const bookInfos = this.flightService.getPassengerBookInfos();
      let isShowPage = false;
      if (!bookInfos.length) {
        await this.flightService.initSelfBookTypeBookInfos();
      }
      if (bookInfos[0]) {
        if (!bookInfos[0].exchangeInfo) {
          if (
            !this.flightService.policyFlights ||
            !this.flightService.policyFlights.length
          ) {
            await this.flightService.loadPolicyedFlightsAsync(
              this.flightService.flightGoTripResult
            );
          }
          if (
            !this.flightService.policyFlights ||
            !this.flightService.policyFlights.length
          ) {
            AppHelper.alert("差标获取失败");
            if (!this.flightService.isAgent) {
              return;
            }
          }
          const isSelf = await this.staffService.isSelfBookType();
          if (isSelf) {
            const bookInfo = bookInfos[0];
            const info = this.flightService.getPolicyCabinBookInfo(
              bookInfo,
              flightCabin,
              this.vmFlightSegment
            );
            const rules =
              (info && info.flightPolicy && info.flightPolicy.Rules) || [];
            let msg = rules.join(";");
            if (!this.flightService.isAgent) {
              if (info && info.isDontAllowBook) {
                if (rules.length) {
                  msg += ",不可预订";
                }
                await AppHelper.alert(
                  msg,
                  true,
                  LanguageHelper.getConfirmTip(),
                  LanguageHelper.getCancelTip()
                );
                if (cabin.LowerSegment) {
                  if (cabin.LowerSegment.LowerSegmentRangTime) {
                    msg = `您指定的航班在差标指定范围${
                      cabin.LowerSegment.LowerSegmentRangTime
                    }内有更低价航班:${cabin.LowerSegment.Number} ${(
                      cabin.LowerSegment.TakeoffTime || ""
                    ).substr(11, 5)},是否预订更低价航班？`;
                  } else {
                    msg = `是否预订更低价航班？${cabin.LowerSegment.Number} ${(
                      cabin.LowerSegment.TakeoffTime || ""
                    ).substr(11, 5)}`;
                  }
                  const ok = await AppHelper.alert(
                    msg,
                    true,
                    LanguageHelper.getConfirmTip(),
                    LanguageHelper.getCancelTip()
                  );
                  if (ok) {
                    const res = await this.selectLowerCabin(bookInfo, cabin);

                    return;
                  } else {
                    return;
                  }
                } else {
                  return;
                }
              }
            } else {
              AppHelper.alert(
                msg,
                true,
                LanguageHelper.getConfirmTip(),
                LanguageHelper.getCancelTip()
              );
            }
          }
          const res = await this.flightService.addOrReplaceSegmentInfo(
            flightCabin,
            this.vmFlightSegment
          );
          if (res.isReselect) {
            await this.flightService.onSelectReturnTrip();
            return;
          }
          isShowPage = res.isReplace || res.isSelfBookType || res.isProcessOk;
        } else {
          const info = {
            flightSegment: this.vmFlightSegment,
            flightPolicy: {
              Cabin: flightCabin,
              CabinCode: flightCabin.Code,
              IsAllowBook: true,
            },
            tripType: TripType.departureTrip,
            id: AppHelper.uuid(),
          } as IFlightSegmentInfo;
          bookInfos[0].bookInfo = info;
          this.flightService.setPassengerBookInfosSource([bookInfos[0]]);
          isShowPage = true;
        }
        if (isShowPage) {
          if (
            this.flightService
              .getPassengerBookInfos()
              .filter((it) => !!it.bookInfo).length
          ) {
            await this.onShowSelectedInfosPage();
          }
        }
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  async filterPolicyFlights() {
    const popover = await this.popoverController.create({
      component: FilterPassengersPolicyComponent,
      translucent: true,
      componentProps: {
        bookInfos$: this.flightService.getPassengerBookInfoSource(),
      },
      // backdropDismiss: false
    });
    await popover.present();
    const d = await popover.onDidDismiss();
    const data =
      d &&
      (d.data as PassengerBookInfo<IFlightSegmentInfo> | "isUnFilterPolicy");
    if (!data) {
      return;
    }
    const arr = this.flightService.getPassengerBookInfos().map((it) => {
      it.isFilterPolicy =
        data != "isUnFilterPolicy"
          ? it.id == data.id && data.isFilterPolicy
          : false;
      return it;
    });
    this.flightService.setPassengerBookInfosSource(arr);
    this.cabins = this.getPolicyCabins();
    this.initVmCabins(this.cabins);
    // this.concatMoreCabins();
  }
  private concatMoreCabins() {
    this.vmCabins = this.economyClassCabins.concat(this.otherCabins);
    this.otherCabins = [];
    this.economyClassCabins = [];
    const BusinessCabins = []; //公务舱
    const DiscountCabins = []; //头等舱
    this.vmCabins.forEach((it) => {
      if (it.Cabin) {
        if (it.Cabin.Type == FlightCabinType.Y) {
          this.economyClassCabins.push(it);
        } else if (it.Cabin.Type == FlightCabinType.SeniorY) {
          BusinessCabins.push(it);
        } else if (
          it.Cabin.Type == FlightCabinType.C ||
          it.Cabin.Type == FlightCabinType.DiscountC ||
          it.Cabin.Type == FlightCabinType.BusinessPremier
        ) {
          DiscountCabins.push(it);
        } else {
          this.otherCabins.push(it);
        }
      }
    });
    this.economyClassCabins.sort((a, b) =>
      b.Cabin && a.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    this.otherCabins.sort((a, b) =>
      a.Cabin && b.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    BusinessCabins.sort((a, b) =>
      b.Cabin && a.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    DiscountCabins.sort((a, b) =>
      a.Cabin && b.Cabin ? +a.Cabin.SalesPrice - +b.Cabin.SalesPrice : 0
    );
    this.vmCabins = this.economyClassCabins
      .concat(BusinessCabins)
      .concat(DiscountCabins)
      .concat(this.otherCabins);
    this.hasMoreCabins = false;
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
        // &&
        // // 最低价
        // (it.Cabin.SalesPrice == `${lowestPrice}` ||
        //   // 全价
        //   +it.Cabin.Discount >= 1 ||
        //   // 协议价
        //   +it.Cabin.FareType == FlightFareType.Agreement
        //   )
      ) {
        this.economyClassCabins.push(it);
        // if (+it.Cabin.FareType == FlightFareType.Agreement) {
        //   if (it == isfirstAgreementCabin) {
        //     this.economyClassCabins.push(it);
        //   } else {
        //     this.moreCabins.push(it);
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
      this.segmenttype = "normal";
      this.vmCabins = this.economyClassCabins;
    } else {
      this.hasMoreCabins = false;
      this.segmenttype = "others";
      this.vmCabins = this.otherCabins;
    }
    console.log(this.vmCabins, "cabins");
  }
  onShowSelectedInfosPage() {
    this.flightService.showSelectedBookInfosPage();
  }
  async openrules(cabin: any) {
    console.log("cabin", cabin);
    if (cabin && cabin.Cabin && !cabin.Cabin.Explain) {
      cabin.Explain = await this.flightService
        .getTravelNDCFlightCabinRuleResult(cabin.Cabin)
        .catch(() => "");
      if (cabin.Explain) {
        cabin.Cabin.Explain = cabin.Explain;
      }
    }
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
      this.flightService.setFilterConditionSource({
        ...this.flightService.getFilterCondition(),
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
    this.filterConditionSub = this.flightService
      .getFilterConditionSource()
      .subscribe((c) => {
        this.filterConditions = c;
        const cabin = c && c.cabins.find((it) => it.isChecked);
        if (cabin) {
          this.selectedCabinType = +cabin.id;
        }
      });
    this.setDefaultFilteredInfo();
    this.filteredPolicyPassenger$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(
        tap((infos) => {
          this.isExchange = infos && infos.every((it) => it.exchangeInfo);
        }),
        map((infos) =>
          infos.find((it) => it.isFilterPolicy && !it.exchangeInfo)
        )
      );
    this.showOpenBtn$ = this.flightService
      .getPassengerBookInfoSource()
      .pipe(
        map((infos) => infos && infos.filter((it) => !!it.bookInfo).length)
      );
    this.cabins = this.getPolicyCabins();
    this.initVmCabins(this.cabins);
  }

  private getPolicyCabins() {
    const isfilteredBookInfo = this.flightService
      .getPassengerBookInfos()
      .find((it) => it.isFilterPolicy);
    const bookInfo = isfilteredBookInfo;
    let policyCabins = this.flightService.filterPassengerPolicyCabins({
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
