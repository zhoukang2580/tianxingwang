import { LangService } from "src/app/services/lang.service";
import { flyInOut } from "../../animations/flyInOut";
import { PriceDetailComponent } from "../components/price-detail/price-detail.component";
import { PayService } from "../../services/pay/pay.service";
import { OrderBookDto } from "../../order/models/OrderBookDto";
import {
  ActivatedRoute,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { InsuranceProductEntity } from "../../insurance/models/InsuranceProductEntity";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "../models/flight/FlightSegmentEntity";
import {
  NavController,
  ModalController,
  IonCheckbox,
  PopoverController,
  IonContent,
  Platform,
  IonRefresher,
  IonRadio,
  IonFooter,
  IonSelect,
} from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelFormEntity,
  TravelUrlInfo,
  PassengerBookInfo,
  InitialBookDtoModel,
  IBookOrderResult,
} from "../../tmc/tmc.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import {
  HrService,
  StaffEntity,
  CostCenterEntity,
  OrganizationEntity,
  StaffApprover,
  StaffBookType,
} from "../../hr/hr.service";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnDestroy,
} from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import * as moment from "moment";
import { DayModel } from "../../tmc/models/DayModel";
import { LanguageHelper } from "src/app/languageHelper";
import { trigger, state, style } from "@angular/animations";
import {
  Subject,
  BehaviorSubject,
  from,
  combineLatest,
  of,
  fromEvent,
  Subscription,
} from "rxjs";
import {
  OrderTravelType,
  OrderTravelPayType,
} from "../../order/models/OrderTravelEntity";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { TaskType } from "src/app/workflow/models/TaskType";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { IFlightSegmentInfo } from "../models/PassengerFlightInfo";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, tap } from "rxjs/operators";
import { AddContact } from "src/app/tmc/models/AddContact";
import { environment } from "src/environments/environment";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { IHotelInfo } from "src/app/hotel/hotel.service";
import { RefresherComponent } from "src/app/components/refresher";
import { BookCredentialCompComponent } from "src/app/tmc/components/book-credential-comp/book-credential-comp.component";
import {
  CandeactivateGuard,
  CanComponentDeactivate,
} from "src/app/guards/candeactivate.guard";
import { FlightCabinFareType } from "../models/flight/FlightCabinFareType";
import { SearchCostcenterComponent } from "src/app/tmc/components/search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { SelectComponent } from "src/app/components/select/select.component";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import { StorageService } from "src/app/services/storage-service.service";

@Component({
  selector: "app-flight-book",
  templateUrl: "./flight-book.page.html",
  styleUrls: ["./flight-book.page.scss"],
  animations: [flyInOut],
})
export class FlightBookPage
  implements OnInit, AfterViewInit, CanComponentDeactivate, OnDestroy
{
  private isShowInsuranceBack = false;
  private isPlaceOrderOk = false;
  private isManagentCredentails = false;
  private subscriptions: Subscription[] = [];
  private totalPriceSource: Subject<number>;
  totalPrice = 0;
  vmCombindInfos: ICombindInfo[] = [];
  isSubmitDisabled = false;
  initialBookDtoModel: InitialBookDtoModel;
  errors: any;
  FlightCabinFareType = FlightCabinFareType;
  OrderTravelType = OrderTravelType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  orderTravelPayType: OrderTravelPayType;
  OrderTravelPayType = OrderTravelPayType;
  checkPayCount = 5;
  checkPayCountIntervalTime = 3 * 1000;
  checkPayCountIntervalId: any;
  tmc: TmcEntity;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[] = [];
  expenseTypes: { Name: string; Tag: string }[];
  selfStaff: StaffEntity;
  identity: IdentityEntity;
  isCheckingPay: boolean;
  isCanSkipApproval = false;
  isCanSave = false;
  isRoundTrip = false;
  isShowFee = false;
  appoval: {
    Value: string;
    Text: string;
  };
  passengerServiceFeesObj: { [clientId: string]: string };
  isDingTalk = AppHelper.isDingtalkH5();
  addContacts: AddContact[] = [];
  isself: boolean;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChild(IonContent, { static: true }) cnt: IonContent;
  @ViewChild(RefresherComponent) ionRefresher: RefresherComponent;
  @ViewChild("transfromEle", { static: true })
  transfromEle: ElementRef<HTMLElement>;
  @ViewChild(IonFooter, { static: true }) ionFooter: IonFooter;
  constructor(
    private flightService: FlightService,
    private staffService: HrService,
    private identityService: IdentityService,
    private tmcService: TmcService,
    private natCtrl: NavController,
    public modalCtrl: ModalController,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private plt: Platform,
    private router: Router,
    private storage: StorageService,
    private langService: LangService
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }

  async ngOnInit() {
    this.isRoundTrip = this.flightService.getSearchFlightModel().isRoundTrip;
    this.flightService.setPassengerBookInfosSource(
      this.flightService.getPassengerBookInfos().filter((it) => !!it.bookInfo)
    );
    this.subscriptions.push(
      this.totalPriceSource.subscribe((p) => {
        this.totalPrice = p;
      })
    );
    // ???????????????????????????????????????(??????????????????)
    this.route.queryParamMap.subscribe(async () => {
      this.isCanSave = await this.identityService
        .getIdentityAsync()
        .catch((_) => null as IdentityEntity)
        .then((id) => {
          return !!(id && id.Numbers && id.Numbers["AgentId"]);
        });
      try {
        if (this.isCanSave) {
          const bookInfos = this.flightService.getPassengerBookInfos();
          if (bookInfos && bookInfos.length) {
            if (
              bookInfos.some(
                (it) =>
                  it.bookInfo.flightSegment.Carrier == "9C" ||
                  it.bookInfo.flightSegment.AirlineName.includes("????????????")
              )
            ) {
              this.isCanSave = false;
            }
          }
        }
      } catch {}
      setTimeout(() => {
        if (!this.isShowInsuranceBack || this.isManagentCredentails) {
          this.refresh(false);
        }
        this.isShowInsuranceBack = false;
      }, 200);
    });
    const sub = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource(),
    ])
      .pipe(
        map(([tmc, isSelfType, identity]) => {
          return (
            tmc.FlightApprovalType &&
            tmc.FlightApprovalType != TmcApprovalType.None &&
            !isSelfType &&
            !(identity && identity.Numbers && identity.Numbers.AgentId)
          );
        }),
        tap((can) => {
          console.log("????????????????????????", can);
        })
      )
      .subscribe((is) => {
        this.isCanSkipApproval = is;
      });
    this.subscriptions.push(sub);
    this.isself = await this.staffService.isSelfBookType();
    console.log(this.isself, "isself");
  }
  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
  canDeactivate(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ) {
    if (
      // this.isPlaceOrderOk &&
      nextState.url.includes("selected-flight-bookinfos")
    ) {
      this.natCtrl.navigateRoot("", { animated: true });
      return false;
    }
    // console.log(currentRoute.url, currentState.url, nextState.url);
    return true;
  }
  onToggleIsShowFee() {
    this.isShowFee = !this.isShowFee;
    if (this.transfromEle && this.transfromEle) {
      this.transfromEle.nativeElement.style.transform = `transform: translate(0, -${this.ionFooter["el"].clientHeight}px)`;
    }
  }
  onToggleIsShowDetail(item: ICombindInfo) {
    item.isShowDetail = !item.isShowDetail;
  }

  async onSelectIllegalReason(item: ICombindInfo) {
    if (item.isOtherIllegalReason) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: SelectComponent,
      cssClass: "vw-70",
      componentProps: {
        label: "????????????",
        data: (this.illegalReasons || []).map((it) => {
          return {
            label: it.Name,
            value: it.Name,
          };
        }),
      },
    });
    p.present();
    const data = await p.onDidDismiss();
    if (data && data.data) {
      item.illegalReason = data.data;
    }
  }

  private async initOrderTravelPayTypes() {
    const bookInfos = this.flightService.getPassengerBookInfos();
    const cabinPaytypes: string[] = [];
    bookInfos.forEach((info) => {
      if (
        info.bookInfo &&
        info.bookInfo.flightPolicy &&
        info.bookInfo.flightPolicy.OrderTravelPays
      ) {
        const arr0 = info.bookInfo.flightPolicy.OrderTravelPays.split(",");
        arr0.forEach((t) => {
          if (!cabinPaytypes.find((type) => type == t)) {
            cabinPaytypes.push(t);
          }
        });
      }
    });
    this.tmc = this.tmc || (await this.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => ({} as any));
    if (!this.initialBookDtoModel || !this.initialBookDtoModel.PayTypes) {
      return;
    }
    this.orderTravelPayType = this.tmc && this.tmc.FlightPayType;
    const arr1 = Object.keys(this.initialBookDtoModel.PayTypes);
    this.orderTravelPayTypes = [];
    arr1.forEach((it) => {
      if (!this.orderTravelPayTypes.find((item) => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDtoModel.PayTypes[it],
          value: +it,
        });
      }
    });
    if (cabinPaytypes.length) {
      this.orderTravelPayTypes = this.orderTravelPayTypes.filter((it) =>
        cabinPaytypes.some(
          (cbt) => cbt == it.label || it.value == OrderTravelPayType[cbt]
        )
      );
    }
    this.orderTravelPayType = this.getDefaultPayType(this.tmc && this.tmc.FlightPayType);
  }
  private getDefaultPayType(tmcPayType: number) {
    const one = (this.orderTravelPayTypes || []).find(
      (it) => it.value == tmcPayType
    );
    const key = Object.keys(OrderTravelPayType).find(
      (k) => OrderTravelPayType[k] == (one && one.value)
    );
    const orderTravelPayType = key && OrderTravelPayType[key];

    console.log(
      "initOrderTravelPayTypes",
      this.orderTravelPayTypes,
      orderTravelPayType
    );
    return orderTravelPayType;
  }
  getExplain(explain: string) {
    return explain && explain.replace(/\\n/g, "<br/>");
  }
  private async initializeBookDto() {
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = this.tmcService.getTravelFormNumber();
    const infos = this.flightService.getPassengerBookInfos();
    bookDto.Passengers = [];
    const isSelf = await this.staffService.isSelfBookType();
    infos.forEach((item) => {
      if (item.passenger && item.bookInfo) {
        const p = new PassengerDto();
        p.ClientId = item.id;
        p.FlightSegment = item.bookInfo.flightSegment;
        p.FlightCabin = item.bookInfo.flightPolicy.Cabin;
        p.Credentials = item.credential;
        const account = new AccountEntity();
        account.Id = item.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        p.Policy = item.passenger.Policy;
        bookDto.Passengers.push(p);
      }
    });
    console.log("initializeBookDto", bookDto);
    this.initialBookDtoModel = await this.flightService.getInitializeBookDto(
      bookDto
    );
    this.initialPassengerServiceFeesObj();
    // if (isSelf) {
    //   if (this.initialBookDtoModel && infos.length == 2) {
    //     if (this.initialBookDtoModel.ServiceFees) {
    //       const fees = {};
    //       Object.keys(this.initialBookDtoModel.ServiceFees).forEach(k => {
    //         infos.forEach(info => {
    //           fees[info.id] = +this.initialBookDtoModel.ServiceFees[k] / 2;
    //         });
    //       });
    //       this.initialBookDtoModel.ServiceFees = fees;
    //     }
    //   }
    // }
    // if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
    //   // ??????????????????
    //   const bookInfos = this.flightService.getPassengerBookInfos();
    //   const notWhiteList = bookInfos.filter(it => it.isNotWhitelist);
    //   if (notWhiteList.length) {
    //     const fee = +this.initialBookDtoModel.ServiceFees[notWhiteList[0].id] / notWhiteList.length;
    //     notWhiteList.forEach(info => {
    //       this.initialBookDtoModel.ServiceFees[info.id] = `${fee}`;
    //     });
    //   }
    // }
    return this.initialBookDtoModel;
  }
  private initialPassengerServiceFeesObj() {
    this.passengerServiceFeesObj = {};
    if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
      Object.keys(this.initialBookDtoModel.ServiceFees).forEach((k) => {
        this.passengerServiceFeesObj[k] = this.getPassengerServiceFee(k);
      });
    }
  }
  ngAfterViewInit() {
    if (this.checkboxes) {
      this.checkboxes.changes.subscribe(() => {
        setTimeout(() => {
          this.calcTotalPrice();
        }, 0);
        this.checkboxes.forEach((c) => {
          c.ionChange.subscribe((_) => {
            this.calcTotalPrice();
          });
        });
      });
    }
  }
  private getTravelFormNumber(name: string) {
    if (!this.travelForm) {
      return "";
    }
    if (name == "TravelNumber") {
      return this.travelForm.TravelNumber;
    }
    if (this.travelForm.Numbers == null) {
      return "";
    }
    const one = this.travelForm.Numbers.find((n) => n.Name == name);
    if (one) {
      return one.Code;
    }
    return "";
  }
  async refresh(byUser: boolean) {
    const MOCK_FLIGHT_VMCOMBINDINFO = "mock_flight_vmcombindinfo";
    try {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 300);
      }
      if (byUser) {
        const ok = await AppHelper.alert(
          "????????????????????????????????????????????????",
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (!ok) {
          return;
        }
      }
      this.errors = "";
      this.vmCombindInfos = [];
      if (false && !environment.production) {
        const local = await this.storage.get(MOCK_FLIGHT_VMCOMBINDINFO);
        if (local && Array.isArray(local) && local.length) {
          this.vmCombindInfos = local;
          await this.initOrderTravelPayTypes();
          return local;
        }
      }
      this.initialBookDtoModel = await this.initializeBookDto();
      if (!this.initialBookDtoModel) {
        this.errors = "????????????";
      }
      this.tmc = this.initialBookDtoModel.Tmc;
      this.travelForm = this.initialBookDtoModel.TravelFrom;
      this.illegalReasons = (this.initialBookDtoModel.IllegalReasons || []).map(
        (it) => {
          const item = new IllegalReasonEntity();
          item.Name = it;
          return item;
        }
      );
      this.expenseTypes = this.initialBookDtoModel.ExpenseTypes || [];
      await this.initSelfBookTypeCredentials(); // ?????????????????????????????????????????????
      const notWhitelistCredentials = this.flightService
        .getPassengerBookInfos()
        .filter((it) => it.isNotWhitelist);
      if (notWhitelistCredentials.length) {
        // ???????????????????????????????????????
        console.log("notWhitelistCredentials", notWhitelistCredentials);
      }
      await this.initCombindInfos();
      this.initTmcOutNumberInfos();
      await this.initOrderTravelPayTypes();
      console.log("vmCombindInfos", this.vmCombindInfos);
      if (false && !environment.production) {
        this.storage.set(MOCK_FLIGHT_VMCOMBINDINFO, this.vmCombindInfos);
      }
    } catch (err) {
      this.errors = err || "please retry";
      console.error(err);
    }
  }

  checkOrderTravelType(type: OrderTravelType) {
    const Tmc = this.tmc;
    if (!Tmc || !Tmc.FlightOrderType) {
      return false;
    }
    return !!Tmc.FlightOrderType.split(",").find(
      (it) => it == OrderTravelType[type]
    );
  }

  private async initTmcOutNumberInfos() {
    const args: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[] = [];
    if (!this.vmCombindInfos) {
      return false;
    }
    const outnumbers =
      (this.initialBookDtoModel && this.initialBookDtoModel.OutNumbers) || {};
    this.vmCombindInfos.forEach((combindInfo) => {
      if (combindInfo.tmcOutNumberInfos) {
        combindInfo.tmcOutNumberInfos.forEach((it) => {
          it.labelDataList = outnumbers[it.label] || [];
          if (it.isLoadNumber) {
            if (
              it.staffNumber &&
              !args.find((n) => n.staffNumber == it.staffNumber)
            ) {
              args.push({
                staffNumber: it.staffNumber,
                staffOutNumber: it.staffOutNumber,
                name: it.value,
              });
            }
          }
        });
      }
    });
    const result = await this.tmcService.getTravelUrls(args, "Flight");
    const trvaelNumber = this.tmcService.getTravelFormNumber();
    if (result) {
      this.vmCombindInfos.forEach((combindInfo) => {
        if (combindInfo.tmcOutNumberInfos) {
          combindInfo.tmcOutNumberInfos.forEach((info) => {
            if (info.label.toLowerCase() == "travelnumber") {
              info.loadTravelUrlErrorMsg =
                result[info.staffNumber] && result[info.staffNumber].Message;
              info.travelUrlInfos =
                result[info.staffNumber] && result[info.staffNumber].Data;
              if (
                !info.value &&
                trvaelNumber &&
                info.travelUrlInfos &&
                info.travelUrlInfos.length
              ) {
                // info.value = info.travelUrlInfos.find(
                //   (it) => it.TravelNumber == trvaelNumber
                // ).TravelNumber;
                info.value = trvaelNumber;
              } else {
                info.value = "";
                info.placeholder = "?????????";
              }
            }
            info.isLoadingNumber = false;
          });
        }
      });
    }
  }
  onIllegalReason(
    reason: {
      isOtherIllegalReason: boolean;
      otherIllegalReason: string;
      illegalReason: string;
    },
    info: ICombindInfo
  ) {
    info.isOtherIllegalReason = reason.isOtherIllegalReason;
    info.illegalReason = reason.illegalReason;
    info.otherIllegalReason = reason.otherIllegalReason;
    if (info.isOtherIllegalReason) {
      info.illegalReason = null;
    }
  }
  onShowFriendlyReminder(item: ICombindInfo) {
    item.showFriendlyReminder = !item.showFriendlyReminder;
  }
  async onSelectTravelNumber(
    arg: {
      tmcOutNumberInfos: ITmcOutNumberInfo[];
      tmcOutNumberInfo: ITmcOutNumberInfo;
      travelUrlInfo: TravelUrlInfo;
    },
    item: IPassengerFlightBookInfo
  ) {
    item.tmcOutNumberInfos = arg.tmcOutNumberInfos;
    const data = arg.travelUrlInfo;
    if (data) {
      if (data.CostCenterCode) {
        item.costCenter.code = data.CostCenterCode;
      }
      if (data.CostCenterName) {
        item.costCenter.name = data.CostCenterName;
      }
      if (data.OrganizationCode) {
        item.organization.Code = data.OrganizationCode;
      }
      if (data.OrganizationName) {
        item.organization.Name = data.OrganizationName;
      }
      if (data.TravelNumber) {
        arg.tmcOutNumberInfo.value = data.TravelNumber;
      }
    }
  }
  async onOpenrules(item: ICombindInfo) {
    try {
      const cabin = item.modal.bookInfo.flightPolicy.Cabin;
      console.log("cabin", cabin);
      if (cabin && !cabin.Explain) {
        cabin.Explain = await this.flightService
          .getTravelNDCFlightCabinRuleResult(cabin as any)
          .catch(() => "");
        if (cabin.Explain) {
          cabin.Explain = cabin.Explain;
        }
      }
      // this.popoverController.dismiss().catch(_ => {});
      const m = await this.popoverCtrl.create({
        component: TicketchangingComponent,
        componentProps: { cabin: { Cabin: cabin } },
        showBackdrop: true,
        cssClass: "ticket-changing",
        // animated: false
      });
      m.backdropDismiss = true;
      await m.present();
    } catch (e) {
      console.error(e);
    }
  }
  async onChangeCredential(credentialSelect: IonSelect, item: ICombindInfo) {
    await this.onModify(item);
    if (credentialSelect) {
      credentialSelect.open();
    }
  }
  onManagementCredentials(item: ICombindInfo) {
    item.credentialsRequested = false;
    this.isManagentCredentails = true;
    this.router.navigate([AppHelper.getRoutePath("member-credential-list")]);
  }
  credentialCompareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  private async getTmc() {
    this.tmc = await this.tmcService.getTmc();
    console.log("tmc", this.tmc);
    return this.tmc;
  }
  onOrganizationChange(
    data: {
      isOtherOrganization: boolean;
      organization: OrganizationEntity;
      otherOrganizationName: string;
    },
    item: ICombindInfo
  ) {
    if (item && data.organization) {
      item.organization = data.organization;
      item.isOtherOrganization = data.isOtherOrganization;
      item.otherOrganizationName = data.otherOrganizationName;
    }
  }
  onCostCenterChange(
    data: {
      costCenter: {
        code: string;
        name: string;
      };
      isOtherCostCenter: boolean;
      otherCostCenterName: string;
      otherCostCenterCode: string;
    },
    item: ICombindInfo
  ) {
    console.log("oncostCenterchange", data, item);
    if (data.costCenter && item) {
      item.costCenter = data.costCenter;
      item.isOtherCostCenter = data.isOtherCostCenter;
      item.otherCostCenterCode = data.otherCostCenterCode;
      item.otherCostCenterName = data.otherCostCenterName;
    }
  }
  calcTotalPrice() {
    // console.time("??????");
    if (this.vmCombindInfos) {
      let totalPrice = this.vmCombindInfos.reduce((arr, item) => {
        if (item.modal.bookInfo && item.modal.bookInfo.flightPolicy) {
          const info = item.modal.bookInfo;
          arr = AppHelper.add(
            arr,
            +info.flightPolicy.Cabin.SalesPrice,
            +info.flightPolicy.Cabin.Tax
          );
        }
        if (item.insuranceProducts) {
          const insuranceSum = item.insuranceProducts
            .filter(
              (it) =>
                it.insuranceResult &&
                it.insuranceResult.Id == item.selectedInsuranceProductId
            )
            .reduce((sum, it) => {
              sum = AppHelper.add(+it.insuranceResult.Price, sum);
              return sum;
            }, 0);
          arr = AppHelper.add(arr, insuranceSum);
        }
        return arr;
      }, 0);
      // console.log("totalPrice ", totalPrice);
      const fees = this.getTotalServiceFees();
      totalPrice = AppHelper.add(fees, totalPrice);
      this.totalPriceSource.next(totalPrice);
    }
    // console.timeEnd("??????");
  }
  getMothDay(flightSegment: FlightSegmentEntity) {
    const t = flightSegment && moment(flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.calendarService.generateDayModel(t);
    }
    return `${t && t.format("MM???DD???")} ${d && d.dayOfWeekName} `;
  }
  getDate(s: FlightSegmentEntity) {
    if (!s) {
      return "";
    }
    const day = this.calendarService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTip(info: IFlightSegmentInfo) {
    if (!info) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
    }]`;
  }
  back() {
    this.natCtrl.back();
  }
  private getGroupedCombindInfo(arr: ICombindInfo[], tmc: TmcEntity) {
    const group = arr.reduce((acc, item) => {
      const id =
        (item.modal &&
          item.modal.passenger &&
          item.modal.passenger.AccountId) ||
        (tmc && tmc.Account && tmc.Account.Id);
      if (id) {
        if (acc[id]) {
          acc[id].push(item);
        } else {
          acc[id] = [item];
        }
      }
      return acc;
    }, {} as { [accountId: string]: ICombindInfo[] });
    return group;
  }
  getGroupedTitle(item: ICombindInfo) {
    const group = this.getGroupedCombindInfo(this.vmCombindInfos, this.tmc);
    if (group) {
      const accountId =
        item.modal.passenger.AccountId ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      if (group[accountId]) {
        return group[accountId]
          .map(
            (it) =>
              `${it.modal.credential.Surname}${it.modal.credential.Givenname}(${it.modal.credential.Number})`
          )
          .join("???");
      }
    }
  }
  private fillGroupConbindInfoApprovalInfo(arr: ICombindInfo[]) {
    const group = this.getGroupedCombindInfo(arr, this.tmc);
    let result = arr;
    result = [];
    Object.keys(group).forEach((key) => {
      if (group[key].length) {
        const last = group[key][group[key].length - 1];
        result = result.concat(
          group[key].map((it) => {
            it.appovalStaff = last.appovalStaff;
            it.notifyLanguage = last.notifyLanguage;
            it.isSkipApprove = last.isSkipApprove;
            return it;
          })
        );
      }
    });
    return result;
  }
  async bookFlight(isSave: boolean = false, event: CustomEvent) {
    this.isShowFee = false;
    event.stopPropagation();
    if (this.isSubmitDisabled) {
      return;
    }
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    bookDto.IsForbidAutoIssue = isSave;
    let canBook = false;
    let canBook2 = false;
    const isSelf = await this.staffService.isSelfBookType();
    this.isself = isSelf;
    const arr = this.fillGroupConbindInfoApprovalInfo(this.vmCombindInfos);
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = this.fillBookPassengers(bookDto, arr);
    if (canBook && canBook2) {
      if (isSelf && this.flightService.getSearchFlightModel().isRoundTrip) {
        const p1 = bookDto.Passengers.find((it) => !!it.OutNumbers);
        const p2 = bookDto.Passengers.find((it) => !it.OutNumbers);
        const p = p2 && p2.OutNumbers ? p2 : p1 && p1.OutNumbers ? p1 : null;
        if (p && p.OutNumbers) {
          bookDto.Passengers = bookDto.Passengers.map((it) => {
            it.OutNumbers = p.OutNumbers;
            return it;
          });
        }
      }
      const res: IBookOrderResult = await this.flightService
        .bookFlight(bookDto)
        .catch((e) => {
          AppHelper.alert(e);
          return null;
        });
      if (res) {
        if (res.TradeNo && res.TradeNo != "0") {
          // AppHelper.toast("????????????!", 1400, "top");
          this.isPlaceOrderOk = true;
          this.isSubmitDisabled = true;
          let isHasTask = res.HasTasks;
          let payResult = false;
          this.flightService.removeAllBookInfos();
          let checkPayResult = false;
          const isCheckPay = res.IsCheckPay;
          if (!isSave) {
            if (isCheckPay) {
              this.isCheckingPay = true;
              checkPayResult = await this.checkPay(res.TradeNo);
              this.isCheckingPay = false;
            } else {
              payResult = true;
            }
            if (checkPayResult) {
              if (this.isself && isHasTask) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                  true
                );
              } else {
                if (isCheckPay) {
                  payResult = await this.tmcService.payOrder(res.TradeNo);
                }
              }
            } else {
              if (this.isself) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingTip(isCheckPay),
                  true
                );
              }
            }
          } else {
            if (isSave) {
              await AppHelper.alert("???????????????!");
            } else {
              // await AppHelper.alert("????????????!");
            }
          }
          this.goToMyOrders({
            isHasTask: isHasTask,
            payResult,
            isCheckPay:
              isCheckPay ||
              this.orderTravelPayType == OrderTravelPayType.Person ||
              this.orderTravelPayType == OrderTravelPayType.Credit,
          });
        }
      }
    }
  }
  private goToMyOrders(data: {
    isHasTask: boolean;
    payResult: boolean;
    isCheckPay: boolean;
  }) {
    // this.router.navigate(["order-list"], {
    //   // isbackhome:true???????????? android ???????????????????????????????????????
    //   queryParams: { tabId: tab, fromRoute: "bookflight", isBackHome: true },
    // });
    try {
      const m = this.flightService.getSearchFlightModel();
      // const cities = await this.flightService.getStationsAsync();
      // const city = m.toCity;
      const cities = this.flightService.getSearchFlightModel().toCity;
      // const c = cities.find(it => it.Code == (city && city.Code));
      this.router.navigate(["checkout-success"], {
        queryParams: {
          tabId: ProductItemType.plane,
          cityCode: cities && cities.CityCode,
          cityName: cities && cities.CityName,
          isApproval: data.isHasTask,
          payResult: data.payResult,
          isCheckPay: data.isCheckPay,
          date: m.Date,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>((s) => {
      let loading = false;
      this.checkPayCountIntervalId = setInterval(async () => {
        if (!loading) {
          loading = true;
          const result = await this.tmcService.checkPay(tradeNo, false);
          loading = false;
          this.checkPayCount--;
          if (!result) {
            if (this.checkPayCount < 0) {
              clearInterval(this.checkPayCountIntervalId);
              s(false);
            }
          } else {
            clearInterval(this.checkPayCountIntervalId);
            s(true);
          }
        }
      }, this.checkPayCountIntervalTime);
    });
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    if (!this.addContacts || this.addContacts.length == 0) {
      return true;
    }
    bookDto.Linkmans = [];
    const showErrorMsg = (msg: string, idx: number) => {
      AppHelper.alert(`???${idx + 1}??????????????????${msg}????????????`);
    };
    for (let j = 0; j < this.addContacts.length; j++) {
      const man = this.addContacts[j];
      const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
      if (!man.accountId) {
        showErrorMsg("", j);
        return false;
      }
      if (!man.mobile && !man.email) {
        if (!man.mobile) {
          showErrorMsg("Mobile", j);
          return false;
        }
        if (!man.email) {
          showErrorMsg("Email", j);
          return false;
        }
      }
      if (
        !(
          man.notifyLanguage == "" ||
          man.notifyLanguage == "cn" ||
          man.notifyLanguage == "en"
        )
      ) {
        showErrorMsg(LanguageHelper.getNotifyLanguageTip(), j);
        return false;
      }

      if (!man.name) {
        showErrorMsg("Name", j);
        return false;
      }
      linkMan.Id = man.accountId;
      if (man.email) {
        linkMan.Email = man.email;
      }
      linkMan.MessageLang = man.notifyLanguage;
      if (man.mobile) {
        linkMan.Mobile = man.mobile;
      }
      linkMan.Name = man.name;
      bookDto.Linkmans.push(linkMan);
    }
    return true;
  }
  private fillBookPassengers(
    bookDto: OrderBookDto,
    combindInfos: ICombindInfo[]
  ) {
    const showErrorMsg = async (
      msg: string,
      item: ICombindInfo,
      ele: HTMLElement
    ) => {
      if (!item.isShowDetail) {
        item.isShowDetail = true;
      }
      await AppHelper.alert(
        `${item.vmCredential && item.vmCredential.Name} ???${
          item.vmCredential && item.vmCredential.Number
        }??? ${msg} ??????????????????`
      );
      this.moveRequiredEleToViewPort(ele);
    };
    bookDto.Passengers = [];
    for (const combindInfo of combindInfos) {
      const accountId =
        combindInfo.modal.passenger.AccountId ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove
      ) {
        const ele: HTMLElement = this.getEleByAttr(
          "approvalid",
          combindInfo.id
        );
        showErrorMsg(LanguageHelper.Flight.getApproverTip(), combindInfo, ele);
        return;
      }
      const info = combindInfo.modal.bookInfo;
      const p = new PassengerDto();
      p.ClientId = accountId;
      p.ApprovalId =
        (this.isAllowSelectApprove(combindInfo) &&
          !combindInfo.isSkipApprove &&
          combindInfo.appovalStaff &&
          (combindInfo.appovalStaff.AccountId ||
            (combindInfo.appovalStaff.Account &&
              combindInfo.appovalStaff.Account.Id))) ||
        "0";
      if (
        !(
          combindInfo.notifyLanguage == "" ||
          combindInfo.notifyLanguage == "cn" ||
          combindInfo.notifyLanguage == "en"
        )
      ) {
        const ele: HTMLElement = this.getEleByAttr(
          "notifyLanguageid",
          combindInfo.id
        );
        showErrorMsg(LanguageHelper.getNotifyLanguageTip(), combindInfo, ele);
        return false;
      }
      p.MessageLang = combindInfo.notifyLanguage;
      p.CardName = "";
      p.CardNumber = "";
      p.TicketNum = "";
      p.Credentials = new CredentialsEntity();
      p.Credentials = { ...combindInfo.vmCredential };
      const el = this.getEleByAttr(
        "credentialcompid",
        combindInfo.id
      ) as HTMLElement;
      if (!combindInfo.vmCredential.Type) {
        showErrorMsg(LanguageHelper.getCredentialTypeTip(), combindInfo, el);
        return false;
      }
      p.Credentials.Type = combindInfo.vmCredential.Type;
      p.Credentials.Gender = combindInfo.vmCredential.Gender;
      if (!combindInfo.vmCredential.Number) {
        showErrorMsg(LanguageHelper.getCredentialNumberTip(), combindInfo, el);
        return false;
      }
      p.Credentials.Number = combindInfo.vmCredential.Number;
      p.Credentials.Surname = combindInfo.vmCredential.Surname;
      p.Credentials.Givenname = combindInfo.vmCredential.Givenname;
      p.IllegalPolicy =
        (info.flightPolicy &&
          info.flightPolicy.Rules &&
          info.flightPolicy.Rules.join(",")) ||
        "";
      p.Mobile =
        (combindInfo.credentialStaffMobiles &&
          combindInfo.credentialStaffMobiles
            .filter((m) => m.checked)
            .map((m) => m.mobile)
            .join(",")) ||
        "";
      if (combindInfo.credentialStaffOtherMobile) {
        p.Mobile = `${
          p.Mobile
            ? p.Mobile + "," + combindInfo.credentialStaffOtherMobile
            : combindInfo.credentialStaffOtherMobile
        }`;
      }
      p.Email =
        (combindInfo.credentialStaffEmails &&
          combindInfo.credentialStaffEmails
            .filter((e) => e.checked)
            .map((m) => m.email)
            .join(",")) ||
        "";
      if (combindInfo.credentialStaffOtherEmail) {
        p.Email = `${
          p.Email
            ? p.Email + "," + combindInfo.credentialStaffOtherEmail
            : combindInfo.credentialStaffOtherEmail
        }`;
      }
      if (combindInfo.insuranceProducts) {
        p.InsuranceProducts = [];
        for (const it of combindInfo.insuranceProducts) {
          if (
            it.insuranceResult &&
            it.insuranceResult.Id == combindInfo.selectedInsuranceProductId
          ) {
            p.InsuranceProducts.push(it.insuranceResult);
          }
        }
      }
      p.ExpenseType = combindInfo.expenseType;
      p.IllegalReason =
        (this.tmc &&
          this.tmc.IsAllowCustomReason &&
          combindInfo.otherIllegalReason) ||
        combindInfo.illegalReason ||
        "";
      if (
        !combindInfo.modal.isNotWhitelist &&
        combindInfo.modal.bookInfo &&
        combindInfo.modal.bookInfo.flightPolicy &&
        combindInfo.modal.bookInfo.flightPolicy.Rules &&
        combindInfo.modal.bookInfo.flightPolicy.Rules.length
      ) {
        // ???????????????????????????????????????
        const ele: HTMLElement = this.getEleByAttr(
          "illegalreasonsid",
          combindInfo.id
        );
        if (!p.IllegalReason) {
          showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo,
            ele
          );
          return false;
        }
      }
      if (!p.Mobile) {
        const ele: HTMLElement = this.getEleByAttr("mobileid", combindInfo.id);
        showErrorMsg(LanguageHelper.Flight.getMobileTip(), combindInfo, ele);
        return false;
      }
      p.CostCenterCode =
        combindInfo.otherCostCenterCode ||
        (combindInfo.costCenter && combindInfo.costCenter.code) ||
        "";
      p.CostCenterName =
        combindInfo.otherCostCenterName ||
        (combindInfo.costCenter && combindInfo.costCenter.name) ||
        "";
      p.OrganizationName =
        combindInfo.otherOrganizationName ||
        (combindInfo.organization && combindInfo.organization.Name);
      p.OrganizationCode = combindInfo.otherOrganizationName
        ? ""
        : (combindInfo.organization && combindInfo.organization.Code) || "";
      const exists = bookDto.Passengers.find((it) => it.ClientId == accountId);
      if (combindInfo.tmcOutNumberInfos) {
        if (!exists || !exists.OutNumbers) {
          p.OutNumbers = {};
          for (const it of combindInfo.tmcOutNumberInfos) {
            if (it.required && !it.value) {
              const el = this.getEleByAttr("outnumberid", combindInfo.id);
              showErrorMsg(
                it.label + (this.langService.isCn ? "??????" : " Required "),
                combindInfo,
                el
              );
              return;
            }
            if (it.value) {
              p.OutNumbers[it.key] = it.value;
            }
          }
          if (!Object.keys(p.OutNumbers).length) {
            p.OutNumbers = null;
          }
        }
      }
      if (!combindInfo.travelType) {
        showErrorMsg(
          LanguageHelper.Flight.getTravelTypeTip(),
          combindInfo,
          null
        );
        return false;
      }
      if (!this.orderTravelPayType) {
        const el = this.getEleByAttr(
          "orderTravelPayTypeid",
          "orderTravelPayTypeid"
        );
        if (!this.orderTravelPayTypes || !this.orderTravelPayTypes.length) {
          const tip = this.langService.isEn
            ? "Payment method is not set, please contact customer service."
            : "?????????????????????????????????????????????????????????????????????????????????";
          AppHelper.alert(tip);
          this.moveRequiredEleToViewPort(el);
          return false;
        }
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo,
          el as any
        );
        return false;
      }
      if (
        combindInfo.credentialStaff &&
        combindInfo.credentialStaff.Account &&
        combindInfo.credentialStaff.Account.Id &&
        combindInfo.credentialStaff.Account.Id != "0"
      ) {
        p.Credentials.Account =
          combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
        p.Credentials.Account =
          p.Credentials.Account || combindInfo.modal.credential.Account;
      }
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = this.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      p.FlightSegment = combindInfo.modal.bookInfo.flightSegment;
      p.FlightCabin = combindInfo.modal.bookInfo.flightPolicy.Cabin;
      if (p.FlightCabin) {
        p.FlightCabin.InsuranceProducts = p.InsuranceProducts;
        p.InsuranceProducts = null;
        if (p.FlightSegment) {
          if (!p.FlightSegment.CabinCode) {
            p.FlightSegment.CabinCode =
              p.FlightCabin.CabinCodes[p.FlightSegment.Number];
          }
          if (p.FlightCabin.CabinCodes && !p.FlightCabin.Code) {
            p.FlightCabin.Code =
              p.FlightCabin.CabinCodes[p.FlightSegment.Number];
          }
        }
      }
      p.Policy = combindInfo.modal.passenger.Policy;
      bookDto.Passengers.push(p);
    }
    return true;
  }
  private getEleByAttr(attrName: string, value: string) {
    return this.cnt["el"].querySelector(
      `[${attrName}='${value}']`
    ) as HTMLElement;
  }
  async onModify(item: ICombindInfo) {
    if (!item.credentialsRequested) {
      const res: {
        [accountId: string]: CredentialsEntity[];
      } = await this.tmcService
        .getPassengerCredentials([item.modal.passenger.AccountId])
        .catch((_) => ({ [item.modal.passenger.AccountId]: [] }));
      if (item.credentials.length) {
        const exist = item.credentials[0];
        const credentials = res && res[item.modal.passenger.AccountId];
        item.credentialsRequested = credentials && credentials.length > 0;
        if (credentials) {
          if (credentials.length) {
            const one = credentials.find(
              (it) => it.Number == exist.Number && exist.Type == it.Type
            );
            if (one) {
              item.credentials = [
                one,
                ...credentials.filter((it) => it != one),
              ];
            } else {
              if (item.credentialsRequested) {
                item.credentials = credentials;
              }
            }
          } else {
          }
        }
      }
    }
    if (item.credentials) {
      item.credentials = item.credentials.filter((it) => !!it.Number);
    }
    console.log("onModify", item.credentials);
  }

  private moveRequiredEleToViewPort(ele: any) {
    const el: HTMLElement = (ele && ele.nativeElement) || ele;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect) {
      if (this.cnt) {
        this.cnt.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
      }
    }
    this.generateAnimation(el);
  }
  private generateAnimation(el: HTMLElement) {
    // el.style.display = "block";
    setTimeout(() => {
      requestAnimationFrame(() => {
        el.style.color = "var(--ion-color-danger)";
        el.classList.add("animated");
        el.classList.toggle("shake", true);
      });
    }, 200);
    const sub = fromEvent(el, "animationend").subscribe(() => {
      el.style.display = "";
      el.style.color = "";
      el.classList.toggle("shake", false);
      sub.unsubscribe();
    });
  }
  async openApproverModal(item: ICombindInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      const [name, emmail, number] = res.Text.split("|");
      item.appovalStaff =
        item.appovalStaff ||
        ({
          Account: new AccountEntity(),
        } as any);
      item.appovalStaff.AccountId = item.appovalStaff.Account.Id = res.Value;
      item.appovalStaff.Email = item.appovalStaff.Account.Email = emmail;
      // item.appovalStaff.Mobile = item.appovalStaff.Account.Mobile = mobile;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
      item.appovalStaff.Number = number;
    }
  }

  private async initSelfBookTypeCredentials(): Promise<CredentialsEntity[]> {
    if (await this.staffService.isSelfBookType()) {
      const identity = await this.identityService.getIdentityAsync();
      const id = (identity && identity.Id) || "";
      if (!id) {
        return [];
      }
      const res = await this.flightService.getPassengerCredentials([id]);
      let credential: CredentialsEntity;
      if (res && res[id] && res[id].length) {
        credential = res[id][0];
      }
      this.vmCombindInfos = this.vmCombindInfos.map((item) => {
        if (!item.modal.credential || !item.modal.credential.Number) {
          item.modal.credential = credential;
        }
        item.vmModal = { ...item.modal };
        return item;
      });
    }
  }
  private getOneServiceFee(item: ICombindInfo) {
    return (
      (this.initialBookDtoModel &&
        this.initialBookDtoModel.ServiceFees &&
        +this.initialBookDtoModel.ServiceFees[item.modal.id]) ||
      0
    );
  }
  private getTotalServiceFees() {
    let fees = 0;
    if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
      fees = Object.keys(this.initialBookDtoModel.ServiceFees).reduce(
        (acc, key) => {
          const fee = +this.initialBookDtoModel.ServiceFees[key];
          acc = AppHelper.add(fee, acc);
          return acc;
        },
        0
      );
    }
    if (!this.tmcService.isAgent) {
      if (this.tmc && !this.tmc.IsShowServiceFee) {
        if (
          this.orderTravelPayType != OrderTravelPayType.Person &&
          this.orderTravelPayType != OrderTravelPayType.Credit
        ) {
          fees = 0;
        }
      }
    }
    return fees as number;
  }
  getInsuranceDetails(detail: string) {
    return detail && detail.split("\n").join("<br/>");
  }
  onShowInsuranceDetail(insurance: { showDetail: boolean }, evt: CustomEvent) {
    if (evt) {
      evt.stopImmediatePropagation();
      evt.preventDefault();
    }
    if (insurance) {
      insurance.showDetail = !insurance.showDetail;
    }
  }
  async onShowPriceDetail() {
    const isSelf = await this.staffService.isSelfBookType();
    const p = await this.popoverCtrl.create({
      component: PriceDetailComponent,
      cssClass: "ticket-changing",
      componentProps: {
        priceInfos:
          this.vmCombindInfos &&
          this.vmCombindInfos
            .map((item) => {
              const bookInfo = item.modal && item.modal.bookInfo;
              return {
                id: item.modal.id,
                passengerCredential: item.modal && item.modal.credential,
                from:
                  bookInfo &&
                  bookInfo.flightSegment &&
                  bookInfo.flightSegment.FromCityName,
                to:
                  bookInfo &&
                  bookInfo.flightSegment &&
                  bookInfo.flightSegment.ToCityName,
                price:
                  bookInfo &&
                  bookInfo.flightPolicy &&
                  bookInfo.flightPolicy.Cabin &&
                  bookInfo.flightPolicy.Cabin.SalesPrice,
                tax:
                  bookInfo &&
                  bookInfo.flightSegment &&
                  bookInfo.flightSegment.Tax,
                insurances: item.insuranceProducts
                  .filter(
                    (it) =>
                      it.insuranceResult &&
                      it.insuranceResult.Id == item.selectedInsuranceProductId
                  )
                  .map((it) => {
                    return {
                      name: it.insuranceResult && it.insuranceResult.Name,
                      price: it.insuranceResult && it.insuranceResult.Price,
                    };
                  }),
              };
            })
            .filter((it) => !!it.from),
        // fees: this.getTicketsFees(),
        isSelf,
      },
    });
    p.present();
  }
  onShowProductDetail(insurance: InsuranceProductEntity, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (!insurance || !insurance.DetailUrl) {
      return;
    }
    this.isShowInsuranceBack = true;
    this.router.navigate([AppHelper.getRoutePath("open-url")], {
      queryParams: { url: insurance.DetailUrl, title: insurance.Name },
    });
  }
  private getPassengerServiceFee(id: string) {
    const totalFees = this.getTotalServiceFees();
    if (!totalFees) {
      return null;
    }
    const bookInfos = this.flightService.getPassengerBookInfos();

    const fs = bookInfos.reduce((acc, it) => {
      acc = {
        ...acc,
        [it.id]:
          this.initialBookDtoModel &&
          this.initialBookDtoModel.ServiceFees[it.id],
      };
      return acc;
    }, {});
    console.log(id, fs, "fs[id]", this.initialBookDtoModel.ServiceFees);
    return fs[id];
  }
  private async initCombindInfos() {
    try {
      const accountIdTmcOutNumberInfosMap: {
        [accountId: string]: ITmcOutNumberInfo[];
      } = {} as any;
      const isSelfOrisSecretary =
        (await this.staffService.isSelfBookType()) ||
        (await this.staffService.isSecretaryBookType());
      const pfs = this.flightService
        .getPassengerBookInfos()
        .filter((it) => !!it.bookInfo);
      for (const item of pfs) {
        const cs = this.initialBookDtoModel.Staffs.find(
          (it) => it.Account.Id == item.passenger.AccountId
        );
        const cstaff =
          item.passenger.AccountId == this.tmc.Account.Id
            ? item.credential.Staff
            : cs && cs.CredentialStaff;
        const credentials = [];
        const arr = cstaff && cstaff.Approvers;
        let credentialStaffApprovers: {
          Tag: string;
          Type: TaskType;
          approvers: StaffApprover[];
        }[];
        if (arr) {
          arr.sort((a, b) => a.Tag && b.Tag && +a.Tag - +b.Tag);
          const tempObj = arr.reduce((obj, it) => {
            if (obj[it.Tag]) {
              obj[it.Tag].push(it);
            } else {
              obj[it.Tag] = [it];
            }
            return obj;
          }, {} as { [Tag: string]: StaffApprover[] });
          credentialStaffApprovers = Object.keys(tempObj).map((key) => {
            const it = tempObj[key][0];
            return {
              Tag: it && it.Tag,
              Type: it && it.Type,
              approvers: tempObj[key],
            };
          });
          console.log("credentialStaffApprovers", credentialStaffApprovers);
        }
        // console.log("credentials", credentials, cstaff);
        if (
          item.credential &&
          !credentials.find(
            (it) =>
              it.Number == item.credential.Number &&
              it.Type == item.credential.Type
          )
        ) {
          credentials.push(item.credential);
        }
        const insuranceProducts =
          (this.initialBookDtoModel.Insurances &&
            this.initialBookDtoModel.Insurances[item.id]) ||
          [];

        const insurances = insuranceProducts.map((insurance) => {
          return {
            insuranceResult: insurance,
            disabled:
              item.passenger &&
              item.passenger.Policy &&
              !!item.passenger.Policy.FlightForceInsuranceId,
            showDetail: false,
          };
        });
        const forceInsurance = insurances.find(
          (it) =>
            (item.passenger &&
              item.passenger.Policy &&
              item.passenger.Policy.FlightForceInsuranceId) ==
            +it.insuranceResult.Id
        );
        const combineInfo: ICombindInfo = {} as ICombindInfo;
        combineInfo.selectedInsuranceProductId =
          forceInsurance &&
          forceInsurance.insuranceResult &&
          forceInsurance.insuranceResult.Id;
        combineInfo.id = AppHelper.uuid();
        combineInfo.vmCredential = item.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.openrules = false;
        combineInfo.credentialStaff = cstaff;
        combineInfo.isOtherIllegalReason = false;
        combineInfo.showFriendlyReminder = false;
        combineInfo.isOtherOrganization = false;
        combineInfo.notifyLanguage = "cn";
        if (this.expenseTypes && this.expenseTypes.length) {
          combineInfo.expenseType = this.expenseTypes[0].Name;
        }
        combineInfo.travelType = OrderTravelType.Business; // ??????????????????
        combineInfo.insuranceProducts = this.isShowInsurances(
          item.bookInfo &&
            item.bookInfo.flightSegment &&
            item.bookInfo.flightSegment.TakeoffTime
        )
          ? insurances
          : [];
        combineInfo.credentialStaffMobiles =
          cstaff && cstaff.Account && cstaff.Account.Mobile
            ? cstaff.Account.Mobile.split(",").map((mobile, idx) => {
                return {
                  checked: idx == 0,
                  mobile,
                };
              })
            : [];
        combineInfo.credentialStaffEmails =
          cstaff && cstaff.Account && cstaff.Account.Email
            ? cstaff.Account.Email.split(",").map((email, idx) => {
                return {
                  checked: idx == 0,
                  email,
                };
              })
            : [];
        combineInfo.credentialStaffApprovers = credentialStaffApprovers;
        combineInfo.organization = {
          Code: cstaff && cstaff.Organization && cstaff.Organization.Code,
          Name: cstaff && cstaff.Organization && cstaff.Organization.Name,
        } as any;
        combineInfo.costCenter = {
          code: cstaff && cstaff.CostCenter && cstaff.CostCenter.Code,
          name: cstaff && cstaff.CostCenter && cstaff.CostCenter.Name,
        };
        combineInfo.modal = item;
        combineInfo.vmModal = { ...item };
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        const accountId =
          item.passenger.AccountId ||
          (this.tmc && this.tmc.Account && this.tmc.Account.Id);
        const tmcOutNumberInfos = accountIdTmcOutNumberInfosMap[accountId];
        combineInfo.tmcOutNumberInfos =
          tmcOutNumberInfos ||
          (
            (this.tmc &&
              this.tmc.OutNumberNameArray &&
              this.tmc.OutNumberNameArray) ||
            []
          ).map((n) => {
            console.log("inti tmcOutNumberInfos", n);
            return {
              label: n,
              key: n,
              isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
              required:
                isSelfOrisSecretary &&
                this.tmc &&
                this.tmc.OutNumberRequiryNameArray &&
                this.tmc.OutNumberRequiryNameArray.some((name) => name == n),
              value: this.getTravelFormNumber(n),
              staffNumber: cstaff && cstaff.Number,
              staffOutNumber: cstaff && cstaff.OutNumber,
              isTravelNumber: n.toLowerCase() == "TravelNumber".toLowerCase(),
              canSelect: true, // n.toLowerCase() == "TravelNumber".toLowerCase(),
              isDisabled: !!(
                this.travelForm && n.toLowerCase() == "travelnumber"
              ),
            } as ITmcOutNumberInfo;
          });
        if (!accountIdTmcOutNumberInfosMap[accountId]) {
          accountIdTmcOutNumberInfosMap[accountId] =
            combineInfo.tmcOutNumberInfos;
        }
        this.vmCombindInfos.push(combineInfo);
      }
      await this.initCombineInfosShowApproveInfo();
    } catch (e) {
      console.error(e);
    }
  }
  private async initCombineInfosShowApproveInfo() {
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc();
    }
    if (this.vmCombindInfos) {
      const group = this.getGroupedCombindInfo(this.vmCombindInfos, this.tmc);
      this.vmCombindInfos = [];
      Object.keys(group).forEach((key) => {
        if (group[key].length) {
          const idx = group[key].length - 1;
          group[key][idx].isShowGroupedInfo = true;
          if (
            this.initialBookDtoModel &&
            this.initialBookDtoModel.ServiceFees
          ) {
            const showTotalFees = group[key].reduce(
              (acc, it) =>
                (acc = AppHelper.add(acc, this.getOneServiceFee(it))),
              0
            );
            group[key][idx].serviceFee = showTotalFees;
          }
        }
        this.vmCombindInfos = this.vmCombindInfos.concat(group[key]);
      });
    }
  }
  private isShowInsurances(takeoffTime: string) {
    if (takeoffTime) {
      return +moment(takeoffTime) > +moment(moment().add(2, "hours"));
    }
    return true;
  }
  onSavecredential(credential: CredentialsEntity, info: ICombindInfo) {
    if (info && credential) {
      info.vmCredential = credential;
      info.modal.credential = credential;
    }
  }
  isShowApprove() {
    const Tmc = this.initialBookDtoModel && this.initialBookDtoModel.Tmc;
    if (
      !Tmc ||
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      !Tmc.FlightApprovalType
    ) {
      return false;
    }
    if (Tmc.FlightApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      this.flightService
        .getPassengerBookInfos()
        .some(
          (it) =>
            it.bookInfo &&
            it.bookInfo.flightPolicy &&
            it.bookInfo.flightPolicy.Rules &&
            it.bookInfo.flightPolicy.Rules.length > 0
        )
    ) {
      return true;
    }
    return false;
  }
  isAllowSelectApprove(info: ICombindInfo) {
    const Tmc = this.tmc;
    const staff = info.credentialStaff;
    if (
      !Tmc ||
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      !Tmc.FlightApprovalType
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.FlightApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyFree &&
      info.modal.bookInfo &&
      info.modal.bookInfo.flightPolicy &&
      info.modal.bookInfo.flightPolicy.Rules &&
      info.modal.bookInfo.flightPolicy.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.modal.bookInfo &&
      info.modal.bookInfo.flightPolicy &&
      info.modal.bookInfo.flightPolicy.Rules &&
      info.modal.bookInfo.flightPolicy.Rules.length
    ) {
      return true;
    }
    return false;
  }
  isHasAgreement(segment) {
    return (
      segment.Cabins &&
      segment.Cabins.some((c) => c.FareType == FlightCabinFareType.Agreement)
    );
  }
  onToggleShowCredentialDetail(item: ICombindInfo) {
    item.isShowCredentialDetail = !item.isShowCredentialDetail;
  }
  onToggleShowTravelDetail(item: ICombindInfo) {
    item.isShowTravelDetail = !item.isShowTravelDetail;
  }
  onOpenSelect(select: IonSelect) {
    if (select) {
      select.open();
    }
  }
  hasInsurance(item: ICombindInfo) {
    if (!item.insuranceProducts || !item.insuranceProducts.length) {
      return null;
    }
    return item.insuranceProducts.find(
      (it) => it.insuranceResult.Id == item.selectedInsuranceProductId
    );
  }
  async searchOrganization(combindInfo: ICombindInfo) {
    if (combindInfo.isOtherOrganization) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: OrganizationComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    console.log("organization", result.data);
    if (result && result.data) {
      const res = result.data as OrganizationEntity;
      combindInfo.organization = {
        ...combindInfo.organization,
        Code: res.Code,
        Name: res.Name,
      };
    }
  }
  async searchCostCenter(combindInfo: ICombindInfo) {
    if (combindInfo.isOtherCostCenter) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: SearchCostcenterComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      combindInfo.costCenter = {
        code: res.Value,
        name: res.Text && res.Text.substring(res.Text.lastIndexOf("-") + 1),
      };
    }
  }
}
// updateCredential(credential){

// }

interface IPassengerFlightBookInfo {
  arrivalHotelTime: string;
  creditCardInfo: {
    isShowCreditCard: boolean;
    creditCardType: string;
    creditCardNumber: string;
    creditCardCvv: string;
    creditCardExpirationDate: string;
    expirationYear: string;
    expirationMonth: string;
    years: number[];
  };
  creditCardPersionInfo: {
    credentialType: string;
    credentialNumber: string;
    name: string;
  };
  isShowApprovalInfo: boolean;
  isNotWhitelist?: boolean;
  vmCredential: CredentialsEntity;
  credential: CredentialsEntity;
  credentials: CredentialsEntity[];
  notifyLanguage: string;
  isSkipApprove: boolean;
  isCanEditCrendentails: boolean;
  isShowRoomPlanRulesDesc: boolean;
  id: string;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  bookInfo: PassengerBookInfo<IFlightSegmentInfo>;
  isOpenrules?: boolean;
  travelType: OrderTravelType;
  addContacts?: AddContact[];
  isOtherCostCenter?: boolean;
  otherCostCenterCode?: string;
  otherCostCenterName?: string;
  isOtherOrganization?: boolean;
  costCenter: { code: string; name: string };
  organization: OrganizationEntity;
  otherOrganizationName: string;
  credentialStaffMobiles: {
    checked: boolean;
    mobile: string;
  }[];
  credentialStaffOtherMobile: string;
  credentialStaffEmails: {
    checked: boolean;
    email: string;
  }[];
  credentialStaffOtherEmail: string;

  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  credentialsRequested?: boolean;
  isOtherIllegalReason?: boolean;
  isShowFriendlyReminder?: boolean;
  illegalReason?: string;
  otherIllegalReason?: string;
}
interface ICombindInfo {
  id: string;
  vmModal: PassengerBookInfo<IFlightSegmentInfo>;
  modal: PassengerBookInfo<IFlightSegmentInfo>;
  passengerDto: PassengerDto;
  openrules: boolean; // ?????????????????????
  vmCredential: CredentialsEntity;
  credentials: CredentialsEntity[];
  expenseType: string;
  credentialsRequested: boolean;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  isSkipApprove: boolean;
  isShowDetail: boolean;
  isShowCredentialDetail: boolean;
  isShowTravelDetail: boolean;
  notifyLanguage: string;
  serviceFee: number;
  isShowGroupedInfo: boolean;
  credentialStaffMobiles: {
    checked: boolean;
    mobile: string;
  }[];
  credentialStaffOtherMobile: string;
  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  credentialStaffEmails: {
    checked: boolean;
    email: string;
  }[];
  credentialStaffOtherEmail: string;
  showFriendlyReminder: boolean;
  costCenters: CostCenterEntity[];
  selectedCostCenter: CostCenterEntity;
  illegalReason: any;
  otherIllegalReason: any;
  isOtherIllegalReason: boolean;
  isOtherCostCenter: boolean;
  costCenter: {
    code: string;
    name: string;
  };
  otherCostCenterName: any;
  otherCostCenterCode: any;
  isOtherOrganization: boolean;
  organization: OrganizationEntity;
  otherOrganizationName: string;
  selectedInsuranceProductId: string;
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    disabled: boolean;
    showDetail?: boolean;
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  travelType: OrderTravelType; // ???????????????
}
