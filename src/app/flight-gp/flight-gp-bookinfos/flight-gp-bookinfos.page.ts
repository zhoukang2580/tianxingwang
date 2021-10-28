import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { BehaviorSubject, fromEvent, Subject, Subscription } from "rxjs";
import { flyInOut } from "src/app/animations/flyInOut";
import { AppHelper } from "src/app/appHelper";
import { RefresherComponent } from "src/app/components/refresher/refresher.component";
import {
  CostCenterEntity,
  OrganizationEntity,
  StaffApprover,
  StaffEntity,
  HrService,
} from "src/app/hr/hr.service";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { LanguageHelper } from "src/app/languageHelper";
import {
  OrderTravelPayType,
  OrderTravelType,
} from "src/app/order/models/OrderTravelEntity";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import {
  IBookOrderResult,
  InitialBookDtoModel,
  PassengerBookInfo,
  TmcEntity,
  TmcService,
  TravelFormEntity,
} from "src/app/tmc/tmc.service";
import { TaskType } from "src/app/workflow/models/TaskType";
// import { ITmcOutNumberInfo } from '../components/flight-outnumber/flight-outnumber.component';
import {
  CardBinsBookInfo,
  IFlightSegmentInfo,
} from "../models/PassengerFlightInfo";
import { FlightGpService } from "../flight-gp.service";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import { BookGpDto } from "../models/flightgp/BookGpDto";
import { Routes } from "../models/flightgp/Routes";
import { TicketchangingComponent } from "../components/ticketchanging/ticketchanging.component";
import {
  IonCheckbox,
  IonContent,
  ModalController,
  NavController,
  Platform,
  PopoverController,
} from "@ionic/angular";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { GpBookReq, GpPassengerDto } from "src/app/order/models/GpBookReq";
import { OrderLinkmanDto } from "../models/flightgp/OrderLinkmanDto";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { OrderService } from "src/app/order/order.service";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";
import { OpenUrlComponent } from "src/app/pages/components/open-url-comp/open-url.component";
import { LangService } from "src/app/services/lang.service";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-flight-gp-bookinfos",
  templateUrl: "./flight-gp-bookinfos.page.html",
  styleUrls: ["./flight-gp-bookinfos.page.scss"],
  animations: [flyInOut],
})
export class FlightGpBookinfosPage implements OnInit, CanComponentDeactivate {
  // vmCombindInfos: ICombindInfo[] = [];

  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  isShowFee = false;
  disabled = false;
  showDetail = false;
  private payResult = false;
  private isHasTask = false;
  private isPageTimeout = false;
  private isShowInsuranceBack = false;
  private isManagentCredentails = false;
  orderTravelPayType: OrderTravelPayType;
  OrderTravelPayType = OrderTravelPayType;
  orderTravel = OrderTravelPayType;
  passengerList: {
    name: string;
    identityCard: string;
    id: string;
  }[];
  expenseTypes: { Name: string; Tag: string }[];
  private subscriptions: Subscription[] = [];
  private totalPriceSource: Subject<number>;
  errors: any;
  passengerServiceFeesObj: { [clientId: string]: string };
  totalPrice = 0;
  isSubmitDisabled = false;
  isCanSave = false;
  isTicketShow = false;
  Title = "购票须知";
  isShowAgreementAlert = false;
  rules: {
    key: string;
    src: string;
  }[] = [];
  InsurancePrice = 0;

  checkPayCount = 5;
  checkPayCountIntervalTime = 3 * 1000;
  checkPayCountIntervalId: any;
  selectedInsuranceProductId: number;
  isRoundTrip = false;
  travelForm: TravelFormEntity;
  initialBookDtoModel: InitialBookDtoModel;
  initialBookDtoGpModel: any;
  tmc: TmcEntity;
  bookGpDto: BookGpDto[];
  DateTime: string;
  goOff: string;
  endOff: string;
  selectedFrequent: any[] = [];
  orderLinkmanDto: OrderLinkmanDto;
  isCheckingPay: boolean;
  identitySubscription = Subscription.EMPTY;
  identity: IdentityEntity;
  isDent = false;
  isAgent = false;
  private pageUrl;
  @ViewChild(BackButtonComponent, { static: true })
  backbtn: BackButtonComponent;
  @ViewChild(IonContent, { static: true }) contnt: IonContent;
  @ViewChild(RefresherComponent) ionRefresher: RefresherComponent;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChildren("checkboxs") checkboxs: QueryList<IonCheckbox>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private tmcService: TmcService,
    private orderService: OrderService,
    private flightGpService: FlightGpService,
    private staffService: HrService,
    private popoverController: PopoverController,
    public modalController: ModalController,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private plt: Platform,
    private natCtrl: NavController,
    private langService: LangService,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }

  private async initSearchModelParams() {
    this.subscriptions.push(
      this.flightGpService.getfrequentBookInfoSource().subscribe((m) => {
        this.selectedFrequent = m;
        this.calcTotalPrice();
      })
    );
  }

  private async empty() {
    this.selectedFrequent = [];
    this.flightGpService.setfrequentBookInfoSource(this.selectedFrequent);
    this.calcTotalPrice();
  }

  async ngOnInit() {
    this.refresh(false);
    this.isRoundTrip = this.flightGpService.getSearchFlightModel().isRoundTrip;
    this.flightGpService.setPassengerBookInfosSource(
      this.flightGpService.getPassengerBookInfos().filter((it) => !!it.bookInfo)
    );
    this.subscriptions.push(
      this.totalPriceSource.subscribe((p) => {
        this.totalPrice = p;
      })
    );
    this.route.queryParamMap.subscribe(async () => {
      this.calcTotalPrice();
      this.pageUrl = this.router.url;
      this.isPageTimeout = this.flightGpService.checkIfTimeout();
    });
    try {
      await this.initSearchModelParams();
      this.isCanSave = this.tmcService.isAgent;
      this.orderLinkmanDto = {
        Name: "",
        Mobile: "",
        Email: "",
      };
      // this.refresh(false);
    } catch (error) {
      console.error(error);
    }
  }

  canDeactivate(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ) {
    if (this.isPageTimeout) {
      this.isPageTimeout = false;
      this.router.navigate(["flight-gp-list"], {
        queryParams: { isClearBookInfos: true },
      });
      return false;
    }
    if (
      // this.isPlaceOrderOk &&
      nextState.url.includes("selected-confirm-bookinfos-gp")
    ) {
      this.natCtrl.navigateRoot("", { animated: true });
      return false;
    }
    // console.log(currentRoute.url, currentState.url, nextState.url);
    return true;
  }

  addPassengerGp() {
    this.router.navigate([AppHelper.getRoutePath("select-passenger-gp")]);
  }

  onAddLinkman() {
    this.router.navigate([AppHelper.getRoutePath("flight-gp-add-passenger")]);
  }

  onUpdate(evt: CustomEvent, item) {
    if (evt) {
      evt.stopPropagation();
    }
    const Id = item.passengerEntity.Id;
    console.log(Id, "id");
    this.router.navigate(
      [AppHelper.getRoutePath("flight-gp-update-passenger")],
      {
        queryParams: {
          id: Id,
        },
      }
    );
  }

  onTicketStatus() {
    this.isTicketShow = !this.isTicketShow;
  }

  onReadAgreement(isConsent = false) {
    if (isConsent) {
      const isCheckbox = this.checkboxs.toArray();
      isCheckbox[0].checked = true;
      this.isShowAgreementAlert = !this.isShowAgreementAlert;
    } else {
      this.isShowAgreementAlert = !this.isShowAgreementAlert;
    }
  }

  async onJumpPage(url: string) {
    if (url) {
      const m = await AppHelper.modalController.create({
        component: OpenUrlComponent,
        componentProps: {
          url,
          isOpenAsModal: true,
          isAppendTicket: true,
          isIframeOpen: true,
          isHideTitle: false,
          title: this.Title,
        },
      });
      m.present();
      await m.onDidDismiss();
    }
  }

  onToggleIsShowFee() {
    this.isShowFee = !this.isShowFee;
  }
  async onClose(item, id, evt: CustomEvent) {
    console.log(item);
    if (evt) {
      evt.stopPropagation();
    }
    let ok = await AppHelper.alert("你要删除这段信息嘛", true, "确定", "取消");

    if (ok) {
      this.selectedFrequent.splice(id, 1);
      await this.flightGpService.setfrequentBookInfoSource(
        this.selectedFrequent
      );
      this.calcTotalPrice();
    }
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
          "刷新将重新初始化页面，是否刷新？",
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (!ok) {
          return;
        }
      }
      // this.vmCombindInfos = [];
      this.initialBookDtoGpModel = await this.initializeBookDto();

      if (this.selectedFrequent) {
        for (let s of this.selectedFrequent) {
          if (s.passengerEntity.Id == undefined) {
            var end = this.initialBookDtoGpModel.FrequentPassengers.pop();
            s.passengerEntity.Id = end.Id;
          }
        }
      }

      if (this.initialBookDtoGpModel) {
        this.DateTime =
          this.initialBookDtoGpModel.Routes[0].Segment.TakeoffTime.substring(
            0,
            10
          );
        this.goOff =
          this.initialBookDtoGpModel.Routes[0].Segment.TakeoffTime.substring(
            11,
            16
          );
        this.endOff =
          this.initialBookDtoGpModel.Routes[0].Segment.ArrivalTime.substring(
            11,
            16
          );
        const Pordu = this.initialBookDtoGpModel?.InsuranceResult?.Products;
        if (Pordu) {
          for (let pro = 0; pro < Pordu.length; pro++) {
            Pordu[pro].showDetail = false;
          }
        }

        // console.log(this.initialBookDtoGpModel.InsuranceResult.Products, "Products");

        let cardInfo = this.initialBookDtoGpModel.CardBins;
        let cardBins = this.flightGpService.getCardBinsBookInfo();
        if (cardInfo) {
          cardBins[0] = cardInfo;
          this.flightGpService.setCardBinsBookInfoSource(cardBins);
        }
      }
      console.log(this.initialBookDtoGpModel, "initialBookDtoModel");

      await this.onTicketNeedKnow();

      if (!this.initialBookDtoModel) {
        this.errors = "网络错误";
      }
      this.tmc = this.initialBookDtoModel.Tmc;
      this.expenseTypes = this.initialBookDtoModel.ExpenseTypes || [];

      await this.getIdentity();
      await this.initOrderTravelPayTypes();
    } catch (err) {
      // this.errors = err || "please retry";
      console.error(err);
    }
  }

  private async onTicketNeedKnow() {
    try {
      this.rules = [];
      if (this.initialBookDtoGpModel.Routes[0].Segment.FlightRule) {
        // for (const it of this.initialBookDtoGpModel) {
        const ruleKey =
          this.initialBookDtoGpModel.Routes[0].Segment.FlightRule.AirlineRules;
        for (const k of Object.keys(ruleKey)) {
          const arr = ruleKey[k];
          for (const item of arr) {
            for (const itemK of Object.keys(item)) {
              this.rules.push({
                key: itemK,
                src: item[itemK],
              });
            }
          }
        }
        // }
        const it = this.initialBookDtoGpModel;
        if (it.Routes[0].Segment.FlightRule.CommonRules) {
          it.Routes[0].Segment.FlightRule.CommonRules.forEach((e) => {
            for (const itemK of Object.keys(e)) {
              this.rules.push({
                key: itemK,
                src: e[itemK],
              });
            }
          });
        }
        console.log(this.rules, "rules");
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getIdentity() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe((r) => {
        this.identity = r;
      });
    this.isAgent = this.tmcService.isAgent;

    if (!this.tmcService.isAgent) {
      this.isDent = true;
    }
  }

  private async initOrderTravelPayTypes() {
    const arr1 = Object.keys(this.initialBookDtoGpModel.PayTypes);
    this.orderTravelPayTypes = [];
    arr1.forEach((it) => {
      if (!this.orderTravelPayTypes.find((item) => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDtoGpModel.PayTypes[it],
          value: +it,
        });
      }
    });
    this.orderTravelPayType = this.getDefaultPayType(
      this.initialBookDtoGpModel.DefaultPayType.Key
    );
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

  getInsuranceDetails(detail: string) {
    return detail && detail.split("\n").join("<br/>");
  }

  private async initializeBookDto() {
    const bookGpDto = new BookGpDto();
    const infos = this.flightGpService.getPassengerBookInfosGp();
    bookGpDto.Routes = [];
    infos.forEach((item) => {
      if (item) {
        item.flightSegment = this.flightGpService.currentViewtFlightSegment;
        const p = new Routes();
        p.Seg = item.Seg;
        p.Segment = item.flightSegment;
        p.Fare = item.Cabin;
        bookGpDto.Routes.push(p);
      }
    });
    console.log("initializeBookDto", bookGpDto);
    this.initialBookDtoModel = await this.flightGpService.getInitializeBookDto(
      bookGpDto
    );
    this.initialPassengerServiceFeesObj();
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

  private getPassengerServiceFee(id: string) {
    const totalFees = this.getTotalServiceFees();
    if (!totalFees) {
      return null;
    }
    const bookInfos = this.flightGpService.getPassengerBookInfos();

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

  onShowInsuranceDetail(insurance: { showDetail: boolean }, evt: CustomEvent) {
    if (evt) {
      evt.stopImmediatePropagation();
      evt.preventDefault();
    }
    if (insurance) {
      insurance.showDetail = !insurance.showDetail;
    }
  }

  calcTotalPrice() {
    try {
      console.log(
        "order",
        this.orderTravelPayTypes + ":" + this.orderTravelPayType
      );
      let totalPrice = this.getTotalPriceNumber();
      if (this.initialBookDtoGpModel && this.selectedInsuranceProductId) {
        if (this.initialBookDtoGpModel?.InsuranceResult?.Products) {
          const ins = this.initialBookDtoGpModel.InsuranceResult.Products.find(
            (it) => it && it.Id == this.selectedInsuranceProductId
          );
          console.log("totalPrice ", totalPrice);
          const insPrice = AppHelper.multiply(
            ins.Price,
            this.selectedFrequent.length
          );
          totalPrice = AppHelper.add(totalPrice, insPrice);
        }
      }
      totalPrice = AppHelper.add(totalPrice, this.getServiceFees());
      this.totalPriceSource.next(totalPrice);
    } catch (error) {
      console.error(error);
    }
  }
  private getServiceFees() {
    return 0;
  }
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.navCtrl.pop();
    this.empty();
    this.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
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

  private getTotalPriceNumber() {
    let feestotalPrice = 0;
    try {
      if (this.selectedFrequent) {
        if (
          this.initialBookDtoGpModel &&
          this.initialBookDtoGpModel.Routes &&
          this.initialBookDtoGpModel.Routes[0]
        ) {
          let ticketprice =
            this.initialBookDtoGpModel.Routes[0].Fare.TicketPrice;
          let tax = this.initialBookDtoGpModel?.Routes[0].Fare.Tax;
          feestotalPrice = AppHelper.multiply(
            AppHelper.add(ticketprice, tax),
            this.selectedFrequent.length
          );
          return feestotalPrice;
        }
        const infos = this.flightGpService.getPassengerBookInfosGp();
        let ticketprice = +infos[0].Cabin.TicketPrice;
        let tax = +infos[0].Cabin.Tax;
        feestotalPrice = AppHelper.multiply(
          AppHelper.add(ticketprice, tax),
          this.selectedFrequent.length
        );
      }
    } catch (e) {
      console.error(e);
    }
    return feestotalPrice;
  }

  async onOpenrules(Routes: Routes) {
    console.log("cabin", Routes);
    const m = await this.popoverController.create({
      component: TicketchangingComponent,
      componentProps: { Routes: Routes },
      showBackdrop: true,
      cssClass: "ticket-changing",
      // animated: false
    });
    m.backdropDismiss = true;
    await m.present();
  }
  async onBookServeAgreement() {
    try {
      const isCheckbox = this.checkboxs.toArray();
      const isTicketstatus = isCheckbox[0].checked;
      if (isTicketstatus == false) {
        console.log("请勾选购票协议");
        this.isShowAgreementAlert = !this.isShowAgreementAlert;
        return false;
      } else {
        console.log("已勾选购票协议");
        return true;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async onSubmit(isSave: boolean, event: CustomEvent) {
    try {
      this.isPageTimeout = this.flightGpService.checkIfTimeout();
      if (this.flightGpService.checkIfTimeout()) {
        await this.flightGpService.showTimeoutPop(false, this.pageUrl);
        return;
      }
      let ticketAgreement = true;
      if (this.rules && this.rules.length) {
        ticketAgreement = await this.onBookServeAgreement();
      }
      // const isPay = this.initialBookDtoGpModel?.InsuranceResult;
      // if (!isPay) {
      //   AppHelper.alert("提交失败,请联系工作人员配置支付方式");
      //   return;
      // }
      this.isShowFee = false;
      event.stopPropagation();
      if (this.isSubmitDisabled) {
        return;
      }
      if (!ticketAgreement) {
        return;
      }
      const bookDto: GpBookReq = new GpBookReq();
      const arr = this.initialBookDtoGpModel;
      const canbook = await this.fillBookLinkmans();
      if (!canbook) {
        return false;
      }
      const canbook2 = await this.fillBookPassengers(bookDto, arr, isSave);
      // console.log(canbook);
      if (canbook && canbook2) {
        const res: IBookOrderResult = await this.flightGpService
          .bookGpFlight(bookDto)
          .catch((e) => {
            AppHelper.alert(e);
            return null;
          });
        if (res) {
          if (res.TradeNo && res.TradeNo != "0") {
            this.isSubmitDisabled = true;
            this.isHasTask = res.HasTasks;
            this.payResult = false;
            this.flightGpService.removeAllBookInfos();
            let checkPayResult = false;
            const isCheckPay = res.IsCheckPay;
            if (!isSave) {
              if (isCheckPay) {
                this.isCheckingPay = true;
                checkPayResult = await this.checkPay(res.TradeNo);
                this.isCheckingPay = false;
              } else {
                this.payResult = !(
                  this.orderTravelPayType == OrderTravelPayType.Person ||
                  this.orderTravelPayType == OrderTravelPayType.Credit
                );
              }
              if (checkPayResult) {
                if (this.isHasTask) {
                  await AppHelper.alert(
                    LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                    true
                  );
                } else {
                  if (isCheckPay) {
                    const isp =
                      this.orderTravelPayType == OrderTravelPayType.Person ||
                      this.orderTravelPayType == OrderTravelPayType.Credit;
                    this.payResult = await this.orderService.payOrder(
                      res.TradeNo,
                      null,
                      false,
                      isp ? this.tmcService.getQuickexpressPayWay() : []
                    );
                  }
                }
              } else {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingTip(isCheckPay),
                  true
                );
              }
              // await AppHelper.alert("下单成功");
            } else {
              if (isSave) {
                // bookDto.IsAllowIssueTicket = false;
                await AppHelper.alert("订单已保存!");
              }
            }
            await this.empty();
            this.goToMyOrders();
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  private goToMyOrders() {
    this.router.navigate(["order-list"], {
      queryParams: { tabId: ProductItemType.plane },
    });
  }

  fillBookPassengers(bookDto: GpBookReq, combindInfos: any, isSave: boolean) {
    console.log(combindInfos, "arr");
    bookDto.PassengerDtos = [];
    let rets: GpPassengerDto[] = [];
    for (let fre of this.selectedFrequent) {
      const ret = new GpPassengerDto();
      ret.Pid = fre.passengerEntity.Id;
      ret.Name = fre.passengerEntity.Name;
      ret.Type = fre.passengerEntity.CredentialsType;
      ret.Number = fre.passengerEntity.Number;
      ret.Mobile = fre.passengerEntity.Mobile;
      ret.GPValidateStatus = fre?.passengerEntity?.Variables?.Tag;
      ret.GPOrganization = fre?.passengerEntity?.Variables?.Organization || "";
      ret.GPCardBin = fre?.passengerEntity?.Variables?.BankBin || "";
      ret.GPCardName = fre?.passengerEntity?.Variables?.BankName || "";
      bookDto.PassengerDtos.push(ret);
    }

    const Linkman = {
      Id: this.orderLinkmanDto.Id,
      Name: this.orderLinkmanDto.Name,
      Mobile: this.orderLinkmanDto.Mobile,
      Email: this.orderLinkmanDto.Email,
      MessageLang: this.orderLinkmanDto.MessageLang,
    };

    bookDto.Linkman = Linkman;
    bookDto.FlightCabin = combindInfos.Routes[0].Fare;
    bookDto.FlightSegment = combindInfos.Routes[0].Segment;
    if (combindInfos?.InsuranceResult?.Products) {
      for (let insur of combindInfos?.InsuranceResult?.Products) {
        if (insur.Id == this.selectedInsuranceProductId) {
          bookDto.Insurance = {
            ...insur,
          };
        }
      }
    }
    if (!this.orderTravelPayType) {
      if (!this.orderTravelPayTypes || !this.orderTravelPayTypes.length) {
        const el = this.getEleByAttr(
          "orderTravelPayTypeId",
          "orderTravelPayTypeId"
        );
        const tip = this.langService.isEn
          ? "Payment method is not set, please contact customer service."
          : "没有可选择的支付方式或支付方式已经被关闭，请联系客服。";
        AppHelper.alert(tip).then(() => {
          this.moveRequiredEleToViewPort(el);
        });
        return false;
      }
      AppHelper.alert("请选择支付方式");
      return false;
    }
    bookDto.PayType = this.orderTravelPayType;

    bookDto.IsAllowIssueTicket = !isSave;
    console.log(bookDto, "arr1");

    return true;
  }

  private getEleByAttr(attrName: string, value: string) {
    return (
      this.contnt["el"] &&
      (this.contnt["el"].querySelector(
        `[${attrName}='${value}']`
      ) as HTMLElement)
    );
  }

  private moveRequiredEleToViewPort(ele: any) {
    const el: HTMLElement = (ele && ele.nativeElement) || ele;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect) {
      if (this.contnt) {
        this.contnt.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
      }
    }
    this.generateAnimation(el);
  }

  private generateAnimation(el: HTMLElement) {
    el.style.display = "block";
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

  fillBookLinkmans() {
    const isture = true;
    if (isture) {
      if (!this.selectedFrequent.length) {
        const el = this.getEleByAttr("travesInfo", "travesInfo");
        this.moveRequiredEleToViewPort(el);
        AppHelper.alert("乘客不能为空,请添加乘客");
        return;
      }

      if (this.initialBookDtoGpModel.IsCompelBuyIns) {
        if (!this.selectedInsuranceProductId) {
          const el = this.getEleByAttr("IsCompelBuyIns", "IsCompelBuyIns");
          this.moveRequiredEleToViewPort(el);
          AppHelper.alert("必须选择一个保险信息");
          return;
        }
      }
      const orderLinkman = {
        Name: this.orderLinkmanDto.Name,
        Mobile: this.orderLinkmanDto.Mobile,
        Email: this.orderLinkmanDto.Email,
      };
      let reg = /^[\u4E00-\u9FA5]{1,8}$/;
      let reg1 = /^1[0-9]{10}$/;
      let reg2 =
        /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/;
      console.log(
        !reg2.test(orderLinkman.Email) || orderLinkman.Email == "",
        "sas"
      );
      if (!orderLinkman.Name) {
        const el = this.getEleByAttr("PassengerName", "PassengerName");
        this.moveRequiredEleToViewPort(el);
        AppHelper.alert("请输入姓名");
        return;
      } else if (!reg.test(orderLinkman.Name)) {
        const el = this.getEleByAttr("PassengerName", "PassengerName");
        this.moveRequiredEleToViewPort(el);
        AppHelper.alert("请正确填写乘客姓名");
        return;
      } else if (!orderLinkman.Mobile) {
        const el = this.getEleByAttr("Mobile", "Mobile");
        this.moveRequiredEleToViewPort(el);
        AppHelper.alert("请输入手机号");
        return;
      } else if (!reg1.test(orderLinkman.Mobile)) {
        const el = this.getEleByAttr("Mobile", "Mobile");
        this.moveRequiredEleToViewPort(el);
        AppHelper.alert("手机号输入有误");
        return;
      } else if (orderLinkman.Email != "") {
        if (!reg2.test(orderLinkman.Email) || orderLinkman.Email == "") {
          const el = this.getEleByAttr("Email", "Email");
          this.moveRequiredEleToViewPort(el);
          AppHelper.alert("邮箱格式不正确");
          return;
        }
      }
    }

    return isture;
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
}
