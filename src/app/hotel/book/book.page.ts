import { LangService } from "src/app/services/lang.service";
import { RefresherComponent } from "src/app/components/refresher";
import { BookTmcOutnumberComponent } from "./../../tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { PayService } from "src/app/services/pay/pay.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CalendarService } from "src/app/tmc/calendar.service";
import { RoomPlanEntity } from "./../models/RoomPlanEntity";
import { HrService } from "../../hr/hr.service";
import {
  InitialBookDtoModel,
  TravelUrlInfo,
  TmcService,
  TmcApprovalType,
  PassengerBookInfo,
  TravelFormEntity,
  IllegalReasonEntity,
  IBookOrderResult,
} from "./../../tmc/tmc.service";
import { TmcEntity } from "src/app/tmc/tmc.service";
import { HotelService, IHotelInfo } from "./../hotel.service";
import { IdentityService } from "./../../services/identity/identity.service";
import {
  IonRefresher,
  PopoverController,
  ModalController,
  IonContent,
  IonItemGroup,
  Platform,
} from "@ionic/angular";
import { NavController } from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  HostListener,
  HostBinding,
  AfterViewInit,
  QueryList,
  ElementRef,
  ViewChildren,
  OnDestroy,
} from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  StaffEntity,
  OrganizationEntity,
  StaffApprover,
} from "src/app/hr/hr.service";
import {
  OrderTravelType,
  OrderTravelPayType,
} from "src/app/order/models/OrderTravelEntity";
import { AddContact } from "src/app/tmc/models/AddContact";
import { TaskType } from "src/app/workflow/models/TaskType";
import { of, combineLatest, from, Subscription, fromEvent } from "rxjs";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { map, tap, mergeMap } from "rxjs/operators";
import { trigger, state, style } from "@angular/animations";
import { HotelPaymentType } from "../models/HotelPaymentType";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { OrderCardEntity } from "src/app/order/models/OrderCardEntity";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { HotelEntity } from "../models/HotelEntity";
import { RoomEntity } from "../models/RoomEntity";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { flyInOut } from "src/app/animations/flyInOut";
import { OrderHotelType } from "src/app/order/models/OrderHotelEntity";
import { WarrantyComponent } from "../components/warranty/warranty.component";
import { StorageService } from "src/app/services/storage-service.service";
@Component({
  selector: "app-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"],
  animations: [
    flyInOut,
    trigger("showHide", [
      state("true", style({ display: "initial" })),
      state("false", style({ display: "none" })),
    ]),
  ],
})
export class BookPage implements OnInit, AfterViewInit, OnDestroy {
  private initialBookDto: InitialBookDtoModel;
  private isManagentCredentails = false;
  private subscriptions: Subscription[] = [];
  HotelPaymentType = HotelPaymentType;
  CredentialsType = CredentialsType;
  combindInfos: IPassengerHotelBookInfo[];
  OrderTravelPayType = OrderTravelPayType;
  orderTravelPayType: any;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
    checked?: boolean;
  }[];
  @ViewChild(RefresherComponent) ionRefresher: RefresherComponent;
  @ViewChild(IonContent) ionContent: IonContent;
  error: any;
  identity: IdentityEntity;
  bookInfos: PassengerBookInfo<IHotelInfo>[];
  tmc: TmcEntity;
  serviceFee: number;
  detailServiceFee: number;
  isCanSkipApproval$ = of(false);
  illegalReasons: any[];
  expenseTypes: {Name:string;Tag:string;}[];
  travelForm: TravelFormEntity;
  isCheckingPay = false;
  isSubmitDisabled = false;
  isPlaceOrderOk = false;
  isShowFee = false;
  isNotShowServiceFee = false;
  checkPayCountIntervalId: any;
  checkPayCount = 3;
  checkPayCountIntervalTime = 5 * 1000;
  curSelectedBookInfo: PassengerBookInfo<IHotelInfo>;
  isSelfBookType = true;
  @HostBinding("class.show-price-detail") isShowPriceDetail = false;
  dates: { date: string; price: string | number }[] = [];
  constructor(
    private navCtrl: NavController,
    private identityService: IdentityService,
    private hotelService: HotelService,
    private storage: StorageService,
    private tmcService: TmcService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private staffService: HrService,
    private calendarService: CalendarService,
    private router: Router,
    private payService: PayService,
    private plt: Platform,
    route: ActivatedRoute,
    private LangService: LangService
  ) {
    this.subscriptions.push(
      route.queryParamMap.subscribe(() => {
        this.staffService.isSelfBookType().then((s) => {
          this.isSelfBookType = s;
        });
        if (this.isManagentCredentails) {
          this.doRefresh(false);
        }
      })
    );
  }
  calcNights() {
    this.curSelectedBookInfo = this.hotelService.getBookInfos()[0];
    if (
      this.curSelectedBookInfo &&
      this.curSelectedBookInfo.bookInfo &&
      this.curSelectedBookInfo.bookInfo.roomPlan &&
      this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate &&
      this.curSelectedBookInfo.bookInfo.roomPlan.EndDate
    ) {
      const st = AppHelper.getDate(
        this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate.substr(0, 10)
      );
      const ed = AppHelper.getDate(
        this.curSelectedBookInfo.bookInfo.roomPlan.EndDate.substr(0, 10)
      );
      return Math.floor(ed.getTime() - st.getTime()) / 24 / 3600 / 1000;
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onArrivalHotel(arrivalTime: string, item: IPassengerHotelBookInfo) {
    if (item && arrivalTime) {
      item.arrivalHotelTime = arrivalTime;
      if (this.initialBookDto && this.initialBookDto.RoomPlans) {
        const plan = this.initialBookDto.RoomPlans.find(
          (it) => it.PassengerClientId == item.id
        );
        if (plan && plan.GuaranteeStartTime && plan.GuaranteeEndTime) {
          const date = this.calendarService.getMoment(0, item.arrivalHotelTime);
          const start = this.calendarService.getMoment(
            0,
            plan.GuaranteeStartTime
          );
          const end = this.calendarService.getMoment(0, plan.GuaranteeEndTime);
          item.creditCardInfo.isShowCreditCard =
            +start <= +date && +date <= +end;
        }
      }
    }
  }
  onBedchange(bed: string, bookInfo: PassengerBookInfo<IHotelInfo>) {
    if (bookInfo && bookInfo.bookInfo && bookInfo.bookInfo.roomPlan) {
      bookInfo.bookInfo.roomPlan.Remark = bed;
    }
  }
  onManagementCredentials(item: IPassengerHotelBookInfo) {
    item.credentialsRequested = false;
    this.isManagentCredentails = true;
    this.router.navigate([AppHelper.getRoutePath("member-credential-list")]);
  }
  onShowPriceDetails(evt: {
    isShow: boolean;
    bookInfo: PassengerBookInfo<IHotelInfo>;
  }) {
    this.curSelectedBookInfo = evt.bookInfo;
    if (evt.isShow) {
      this.dates = [];
      const n = this.calcNights();
      if (
        this.curSelectedBookInfo &&
        this.curSelectedBookInfo.bookInfo &&
        this.curSelectedBookInfo.bookInfo.roomPlan &&
        this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate
      ) {
        for (let i = 0; i < n; i++) {
          this.dates.push({
            date: this.calendarService
              .getMoment(
                0,
                this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate
              )
              .add(i, "days")
              .format("YYYY-MM-DD"),
            price: this.hotelService.getAvgPrice(
              this.curSelectedBookInfo.bookInfo.roomPlan
            ),
          });
        }
      }
    }
    this.isShowPriceDetail = evt.isShow;
  }
  @HostListener("click")
  closePriceDetail() {
    this.isShowPriceDetail = false;
  }
  back() {
    this.navCtrl.pop();
  }
  async doRefresh(byUser: boolean) {
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
      this.error = "";
      this.identity = await this.identityService.getIdentityAsync();
      this.bookInfos = this.hotelService
        .getBookInfos()
        .filter((it) => !!it.bookInfo);
      this.initialBookDto = await this.getInitializeBookDto();
      console.log("getInitializeBookDto", this.initialBookDto);
      if (!this.initialBookDto) {
        this.error = "???????????????";
        return "";
      }
      this.tmc = this.initialBookDto.Tmc;
      await this.initializeViewModel();
    } catch (e) {
      console.log(e);
      this.error = e;
    }
    this.isPlaceOrderOk = false;
  }
  ngAfterViewInit() {
    // console.log("outnumberEles", this.outnumberEles.first);
  }
  get totalPrice() {
    const fees = this.getServiceFees();
    const infos = this.hotelService.getBookInfos();
    let roomPlanTotalAmount = infos.reduce((arr, item) => {
      if (item && item.bookInfo && item.bookInfo.roomPlan) {
        const info = item.bookInfo;
        const roomPrice = +info.roomPlan.TotalAmount;
        arr = AppHelper.add(arr, roomPrice);
      }
      return arr;
    }, 0);
    if (this.hotelPaymentType == HotelPaymentType.SelfPay) {
      roomPlanTotalAmount = 0;
    }
    return AppHelper.add(fees, roomPlanTotalAmount);
  }
  private getServiceFees() {
    let fees = 0;
    if (this.initialBookDto && this.initialBookDto.ServiceFees) {
      fees = Object.keys(this.initialBookDto.ServiceFees).reduce((acc, key) => {
        const fee = +this.initialBookDto.ServiceFees[key];
        acc = AppHelper.add(fee, acc);
        return acc;
      }, 0);
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
  onOrderTravelPayTypeSelect() {
    const orderTravelPayType = this.orderTravelPayTypes.find((it) => {
      return it.value == this.orderTravelPayType;
    });
    console.log("????????? orderTravelPayType ", orderTravelPayType);
  }
  private async initOrderTravelPayTypes() {
    // console.log("initOrderTravelPayTypes", this.initialBookDto);
    this.tmc = this.tmc || (await this.tmcService.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => ({} as any));
    if (!this.initialBookDto || !this.initialBookDto.PayTypes) {
      return;
    }
    this.orderTravelPayType = this.tmc && this.tmc.HotelPayType;
    const arr = Object.keys(this.initialBookDto.PayTypes);
    this.orderTravelPayTypes = [];
    arr.forEach((it) => {
      if (!this.orderTravelPayTypes.find((item) => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDto.PayTypes[it],
          value: +it,
        });
      }
    });
    this.orderTravelPayTypes = this.orderTravelPayTypes.filter((t) =>
      this.checkOrderTravelPayType(`${t.value}`)
    );
    this.serviceFee = this.getServiceFees();
    console.log(
      "initOrderTravelPayTypes",
      this.orderTravelPayTypes,
      `viewModel.orderTravelPayType=${this.orderTravelPayType}`
    );
  }
  getServiceFee(item: IPassengerHotelBookInfo) {
    const fee =
      this.initialBookDto &&
      this.initialBookDto.ServiceFees &&
      this.initialBookDto.ServiceFees[item.id];
    // console.log(item.id, fee, this.initialBookDto);
    return fee;
  }
  isShowApprove(item: IPassengerHotelBookInfo) {
    const Tmc = this.tmc;
    if (
      !Tmc ||
      Tmc.HotelApprovalType == TmcApprovalType.None ||
      !Tmc.HotelApprovalType 
    ) {
      return false;
    }
    if (Tmc.HotelApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.HotelApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      this.getRuleMessage(item.bookInfo.bookInfo.roomPlan)
    ) {
      return true;
    }
    return false;
  }
  isAllowSelectApprove(info: IPassengerHotelBookInfo) {
    const Tmc = this.initialBookDto.Tmc;
    const staff = info.credentialStaff;
    if (
      !Tmc ||
      Tmc.HotelApprovalType == TmcApprovalType.None ||
      !Tmc.HotelApprovalType
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.HotelApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.HotelApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }

    if (
      Tmc.HotelApprovalType == TmcApprovalType.ExceedPolicyFree &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.roomPlan.Rules &&
      info.bookInfo.bookInfo.roomPlan.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.roomPlan.Rules &&
      info.bookInfo.bookInfo.roomPlan.Rules.length
    ) {
      return true;
    }
    return false;
  }
  private getDate(roomPlan: RoomPlanEntity) {
    if (!roomPlan || !roomPlan.BeginDate) {
      return "";
    }
    const day = this.calendarService.generateDayModelByDate(roomPlan.BeginDate);
    return `${day.date} ${day.dayOfWeekName}`;
  }
  private async showErrorMsg(
    msg: string,
    item: IPassengerHotelBookInfo,
    ele: HTMLElement
  ) {
    await AppHelper.alert(
      this.LangService.isCn
        ? `${
            (item.credentialStaff && item.credentialStaff.Name) ||
            (item.credential &&
              item.credential.Surname + item.credential.Givenname)
          } ???${
            item.credential && item.credential.Number
          }??? ${msg} ??????????????????`
        : `${
            (item.credentialStaff && item.credentialStaff.Name) ||
            (item.credential &&
              item.credential.Surname + item.credential.Givenname)
          } ???${
            item.credential && item.credential.Number
          }??? ${msg} Information cannot be empty`
    );
    this.moveRequiredEleToViewPort(ele);
  }
  private getEleByAttr(attrName: string, value: string) {
    return (
      this.ionContent["el"] &&
      (this.ionContent["el"].querySelector(
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
      if (this.ionContent) {
        this.ionContent.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
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
  private fillCredicardInfo(item: IPassengerHotelBookInfo) {
    if (!item.creditCardInfo || !item.creditCardInfo.isShowCreditCard) {
      return true;
    }

    if (!item.creditCardInfo.creditCardType) {
      this.showErrorMsg(
        "?????????????????????????????????",
        item,
        this.getEleByAttr("creditCardInfocreditCardType", item.id)
      );
      return false;
    }
    if (!item.creditCardInfo.creditCardNumber) {
      this.showErrorMsg(
        "?????????????????????",
        item,
        this.getEleByAttr("creditCardInfocreditCardNumber", item.id)
      );
      return false;
    }
    if (!item.creditCardInfo.creditCardCvv) {
      this.showErrorMsg(
        "?????????CVV??????",
        item,
        this.getEleByAttr("creditCardInfocreditCardCvv", item.id)
      );
      return false;
    }
    if (!item.creditCardPersionInfo) {
      this.showErrorMsg(
        "??????????????????????????????",
        item,
        this.getEleByAttr("creditCardPersionInfo", item.id)
      );
      return false;
    }
    if (!item.creditCardPersionInfo.credentialType) {
      this.showErrorMsg(
        "???????????????????????????",
        item,
        this.getEleByAttr("creditCardPersionInfocredentialType", item.id)
      );
      return false;
    }
    if (!item.creditCardPersionInfo.credentialNumber) {
      this.showErrorMsg(
        "???????????????????????????",
        item,
        this.getEleByAttr("creditCardPersionInfocredentialNumber", item.id)
      );
      return false;
    }
    // if (!item.creditCardPersionInfo.name) {
    //   showErrorMsg("??????????????????");
    //   return false;
    // }
    return true;
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    bookDto.Linkmans = [];
    const showErrorMsg = (msg: string, item: IPassengerHotelBookInfo) =>
      `?????????${
        (item.credentialStaff && item.credentialStaff.Name) ||
        (item.credential && item.credential.Number)
      }??????${msg}????????????`;
    for (let i = 0; i < this.combindInfos.length; i++) {
      const item = this.combindInfos[i];
      if (item.addContacts) {
        for (let j = 0; j < item.addContacts.length; j++) {
          const man = item.addContacts[j];
          const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
          if (!man.accountId) {
            this.showErrorMsg(
              showErrorMsg("", item),
              item,
              this.getEleByAttr("linkmanid", item.id)
            );
            return false;
          }
          if (!man.email) {
            this.showErrorMsg(
              showErrorMsg("Email", item),
              item,
              this.getEleByAttr("linkmanid", item.id)
            );
            return false;
          }
          if (
            !(
              man.notifyLanguage == "" ||
              man.notifyLanguage == "cn" ||
              man.notifyLanguage == "en"
            )
          ) {
            this.showErrorMsg(
              showErrorMsg(LanguageHelper.getNotifyLanguageTip(), item),
              item,
              this.getEleByAttr("linkmanid", item.id)
            );
            return false;
          }
          if (!man.mobile) {
            this.showErrorMsg(
              showErrorMsg("Mobile", item),
              item,
              this.getEleByAttr("linkmanid", item.id)
            );
            return false;
          }
          if (!man.name) {
            this.showErrorMsg(
              showErrorMsg("Name", item),
              item,
              this.getEleByAttr("linkmanid", item.id)
            );
            return false;
          }
          linkMan.Id = man.accountId;
          linkMan.Email = man.email;
          linkMan.MessageLang = man.notifyLanguage;
          linkMan.Mobile = man.mobile;
          linkMan.Name = man.name;
          bookDto.Linkmans.push(linkMan);
        }
      }
    }
    return true;
  }
  private fillBookPassengers(bookDto: OrderBookDto) {
    bookDto.Passengers = [];
    for (const combindInfo of this.combindInfos) {
      const accountId =
        combindInfo.bookInfo.passenger.AccountId ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove
      ) {
        this.showErrorMsg(
          LanguageHelper.Flight.getApproverTip(),
          combindInfo,
          this.getEleByAttr("approverid", combindInfo.id)
        );
        return;
      }
      const info = combindInfo.bookInfo && combindInfo.bookInfo.bookInfo;
      if (!info) {
        continue;
      }
      const p = new PassengerDto();
      const canbook = this.fillCredicardInfo(combindInfo);
      if (!canbook) {
        return false;
      }
      if (
        combindInfo.creditCardInfo &&
        combindInfo.creditCardInfo.isShowCreditCard
      ) {
        p.OrderCard = new OrderCardEntity();
        p.OrderCard.Description = "?????????";
        p.OrderCard.Number = combindInfo.creditCardInfo.creditCardNumber;
        p.OrderCard.Description = "";
        p.OrderCard.SetVariable(
          "CredentialsName",
          combindInfo.creditCardPersionInfo &&
            combindInfo.creditCardPersionInfo.name
        );
        p.OrderCard.SetVariable(
          "CredentialsNumber",
          combindInfo.creditCardPersionInfo &&
            combindInfo.creditCardPersionInfo.credentialNumber
        );
        p.OrderCard.SetVariable(
          "CredentialsType",
          combindInfo.creditCardPersionInfo &&
            combindInfo.creditCardPersionInfo.credentialType
        );
        p.OrderCard.SetVariable(
          "Year",
          combindInfo.creditCardInfo.expirationYear
        );
        p.OrderCard.SetVariable(
          "Month",
          combindInfo.creditCardInfo.expirationMonth
        );
        p.OrderCard.SetVariable(
          "Cvv",
          combindInfo.creditCardInfo.creditCardCvv
        );
        p.OrderCard.SetVariable(
          "VendorCode",
          combindInfo.creditCardInfo.creditCardType
        );
        p.OrderCard.Variables = JSON.stringify(p.OrderCard.Variables);
      }
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
        this.showErrorMsg(
          LanguageHelper.getNotifyLanguageTip(),
          combindInfo,
          this.getEleByAttr("notifyLanguageid", combindInfo.id)
        );
        return false;
      }
      p.MessageLang = combindInfo.notifyLanguage;
      p.CardName = "";
      p.CardNumber = "";
      p.TicketNum = "";
      p.Credentials = new CredentialsEntity();
      p.Credentials = { ...combindInfo.vmCredential };
      if (!combindInfo.vmCredential.Type) {
        this.showErrorMsg(
          LanguageHelper.getCredentialTypeTip(),
          combindInfo,
          this.getEleByAttr("credentialsid", combindInfo.id)
        );
        return false;
      }
      p.Credentials.Type = combindInfo.vmCredential.Type;
      p.Credentials.Gender = combindInfo.vmCredential.Gender;
      if (!combindInfo.vmCredential.Number) {
        this.showErrorMsg(
          LanguageHelper.getCredentialNumberTip(),
          combindInfo,
          this.getEleByAttr("credentialsid", combindInfo.id)
        );
        return false;
      }
      p.Credentials.Number = combindInfo.vmCredential.Number;
      p.Credentials.Surname = combindInfo.vmCredential.Surname;
      p.Credentials.Givenname = combindInfo.vmCredential.Givenname;
      p.ExpenseType = combindInfo.expenseType;
      p.IllegalPolicy =
        (info.roomPlan &&
          info.roomPlan.Rules &&
          Object.keys(info.roomPlan.Rules)
            .map((key) => info.roomPlan.Rules[key])
            .join(",")) ||
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
      p.IllegalReason =
        (this.tmc &&
          this.tmc.IsAllowCustomReason &&
          combindInfo.otherIllegalReason) ||
        combindInfo.illegalReason ||
        "";
      if (
        !combindInfo.isNotWhitelist &&
        combindInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.roomPlan &&
        combindInfo.bookInfo.bookInfo.roomPlan.Rules
      ) {
        // ???????????????????????????????????????
        if (!p.IllegalReason) {
          this.showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo,
            this.getEleByAttr("illegalReasonsid", combindInfo.id)
          );
          return false;
        }
      }
      if (!p.Mobile) {
        this.showErrorMsg(
          LanguageHelper.Flight.getMobileTip(),
          combindInfo,
          this.getEleByAttr("mobilesid", combindInfo.id)
        );
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
              this.showErrorMsg(it.label + "??????", combindInfo, el);
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
        this.showErrorMsg(
          LanguageHelper.Flight.getTravelTypeTip(),
          combindInfo,
          this.getEleByAttr("travelTypeid", combindInfo.id)
        );
        return false;
      }
      if (!this.orderTravelPayType) {
        this.showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo,
          this.getEleByAttr("orderTravelPayTypeid", "orderTravelPayType")
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
          p.Credentials.Account || combindInfo.credential.Account;
      }
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = this.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      p.OrderHotelType = OrderHotelType.Domestic;
      if (
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.roomPlan &&
        combindInfo.bookInfo.bookInfo.roomPlan
      ) {
        p.CheckinTime = combindInfo.arrivalHotelTime;
        p.RoomPlan = combindInfo.bookInfo.bookInfo.roomPlan;
        const room =
          combindInfo.bookInfo.bookInfo.hotelEntity.Rooms &&
          combindInfo.bookInfo.bookInfo.hotelEntity.Rooms.find(
            (it) => it.Id == (p.RoomPlan.Room && p.RoomPlan.Room.Id)
          );
        p.RoomPlan.Room = {
          ...p.RoomPlan.Room,
          Name: room && room.Name,
          Hotel: {
            Id: combindInfo.bookInfo.bookInfo.hotelEntity.Id,
            Name: combindInfo.bookInfo.bookInfo.hotelEntity.Name,
            Address: combindInfo.bookInfo.bookInfo.hotelEntity.Address,
            Phone: combindInfo.bookInfo.bookInfo.hotelEntity.Phone,
            CityCode: combindInfo.bookInfo.bookInfo.hotelEntity.CityCode,
          },
        } as RoomEntity;
        // p.RoomPlan.Room = {
        //   Name:combindInfo.bookInfo.bookInfo.hotelRoom.Name,
        //   RoomPlans:combindInfo.bookInfo.bookInfo.hotelRoom.RoomPlans.map(it=>{
        //     const plan = new RoomPlanEntity();
        //     plan.Room=new RoomEntity();
        //     plan.Room.Id=combindInfo.bookInfo.bookInfo.hotelRoom.Id;
        //     plan.Remark=p.RoomPlan.Remark;
        //     return plan;
        //   }),
        //   Hotel: { Id: combindInfo.bookInfo.bookInfo.hotelEntity.Id }
        // } as RoomEntity;
        // p.RoomPlan.Room.Hotel = {
        //   // ...combindInfo.bookInfo.bookInfo.hotelEntity,
        //   Rooms: null,
        //   Id:combindInfo.bookInfo.bookInfo.hotelEntity.Id,
        //   HotelDayPrices: [],
        //   HotelDetails: []
        // } as HotelEntity;
      }
      if (combindInfo.bookInfo) {
        p.Policy = combindInfo.bookInfo.passenger.Policy;
      }
      bookDto.Passengers.push(p);
    }
    return true;
  }
  private async initializeViewModel() {
    this.isCanSkipApproval$ = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource(),
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.HotelApprovalType  &&
          tmc.HotelApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap((can) => {
        console.log("????????????????????????", can);
      })
    );
    this.travelForm = this.initialBookDto.TravelFrom;
    this.expenseTypes = this.initialBookDto.ExpenseTypes;
    this.illegalReasons = (this.initialBookDto.IllegalReasons || []).map(
      (it) => {
        return {
          Name: it,
        } as IllegalReasonEntity;
      }
    );
    await this.initCombindInfos();
    await this.initCombineInfosShowApproveInfo();
    await this.initSelfBookTypeCredentials();
    this.initTmcOutNumberInfos();
    await this.initOrderTravelPayTypes();
    this.isNotShowServiceFee = this.notShowServiceFee();
    console.log("combindInfos", this.combindInfos);
  }
  private async initCombindInfos() {
    try {
      this.combindInfos = [];
      const isSelfOrisSecretary =
        (await this.staffService.isSelfBookType()) ||
        (await this.staffService.isSecretaryBookType());
      const bookInfos = this.hotelService.getBookInfos();
      for (let i = 0; i < bookInfos.length; i++) {
        const bookInfo = bookInfos[i];
        const cs = (
          (this.initialBookDto && this.initialBookDto.Staffs) ||
          []
        ).find((it) => it.Account.Id == bookInfo.passenger.AccountId);
        const cstaff =
          bookInfo.passenger.AccountId == this.tmc.Account.Id
            ? bookInfo.credential.Staff
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
          bookInfo.credential &&
          !credentials.find(
            (it) =>
              it.Number == bookInfo.credential.Number &&
              it.Type == bookInfo.credential.Type
          )
        ) {
          credentials.push(bookInfo.credential);
        }
        const combineInfo: IPassengerHotelBookInfo = {} as any;
        const years = [];
        for (let i = 0; i <= 30; i++) {
          years.push(
            this.calendarService
              .getMoment(0)
              .clone()
              .add(i, "years")
              .format("YYYY")
          );
        }
        combineInfo.creditCardInfo = {
          years,
          expirationYear: `${new Date().getFullYear()}`,
          expirationMonth: `1`,
          creditCardExpirationDate: `${this.calendarService
            .getMoment(0)
            .startOf("year")
            .format("YYYY-MM-DD")}`,
        } as any;
        combineInfo.creditCardPersionInfo = {} as any;
        combineInfo.credential = bookInfo.credential;
        combineInfo.id = bookInfo.id;
        combineInfo.bookInfo = bookInfo;
        combineInfo.vmCredential = bookInfo.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.isOpenrules = false;
        combineInfo.credentialStaff = cstaff;
        combineInfo.isOtherIllegalReason = false;
        combineInfo.isShowFriendlyReminder = false;
        combineInfo.isOtherOrganization = false;
        combineInfo.notifyLanguage = "cn";
        if (this.expenseTypes && this.expenseTypes.length) {
          combineInfo.expenseType = this.expenseTypes[0].Name;
        }
        combineInfo.travelType = OrderTravelType.Business; // ??????????????????
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
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        combineInfo.tmcOutNumberInfos = (
          (this.tmc && this.tmc.OutNumberNameArray) ||
          []
        ).map((n) => {
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
            canSelect: n.toLowerCase() == "TravelNumber".toLowerCase(),
            isDisabled: !!(
              this.travelForm && n == "TravelNumber".toLowerCase()
            ),
          } as ITmcOutNumberInfo;
        });

        combineInfo.addContacts = [];
        combineInfo.isShowRoomPlanRulesDesc = true;
        this.combindInfos.push(combineInfo);
      }
    } catch (e) {
      console.error(e);
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
  private async initSelfBookTypeCredentials(): Promise<CredentialsEntity[]> {
    if (await this.staffService.isSelfBookType()) {
      const identity = await this.identityService.getIdentityAsync();
      const id = (identity && identity.Id) || "";
      if (!id) {
        return [];
      }
      const res = await this.tmcService.getPassengerCredentials([id]);
      let credential: CredentialsEntity;
      if (res && res[id] && res[id].length) {
        credential = res[id][0];
      }
      this.combindInfos = this.combindInfos.map((item) => {
        if (!item.credential || !item.credential.Number) {
          item.credential = credential;
        }
        return item;
      });
    }
  }
  private async getInitializeBookDto() {
    // const mock = await this.storage.get("mock-initialBookDto-hotel");
    // if (mock) {
    //   return mock;
    // }
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"] || "";
    const infos = this.hotelService.getBookInfos();
    bookDto.Passengers = [];
    infos.forEach((bookInfo) => {
      if (bookInfo.passenger && bookInfo.bookInfo) {
        const p = new PassengerDto();
        p.ClientId = bookInfo.id;
        p.RoomPlan = bookInfo.bookInfo.roomPlan;
        p.Credentials = bookInfo.credential;
        const account = new AccountEntity();
        account.Id = bookInfo.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        p.Policy = bookInfo.passenger.Policy;
        p.OrderHotelType = OrderHotelType.Domestic;
        bookDto.Passengers.push(p);
      }
    });
    const initialBookDto = await this.hotelService.getInitializeBookDto(
      bookDto
    );
    console.log("initializeBookDto", initialBookDto);
    // await this.storage.set("mock-initialBookDto-hotel", initialBookDto);
    return initialBookDto;
  }
  ngOnInit() {
    this.hotelService.setBookInfos(
      this.hotelService.getBookInfos().filter((it) => !!it.bookInfo)
    );
    this.initDayPrice();
    this.doRefresh(false);
  }
  onShowFeesDetails() {
    this.isShowFee = !this.isShowFee;
    this.detailServiceFee = this.getServiceFees();
    this.initDayPrice();
  }
  private initDayPrice() {
    const bookInfos = this.hotelService.getBookInfos();
    this.curSelectedBookInfo = bookInfos[0];
    if (
      this.curSelectedBookInfo &&
      this.curSelectedBookInfo.bookInfo &&
      this.curSelectedBookInfo.bookInfo.roomPlan
    ) {
      this.dates = (
        this.curSelectedBookInfo.bookInfo.roomPlan.RoomPlanPrices || []
      ).map((it) => {
        return {
          date: it.Date && it.Date.substr(0, 10),
          price: it.Price,
        };
      });
    }
  }
  get hotelPaymentType(): HotelPaymentType {
    if (
      this.combindInfos &&
      this.combindInfos.length &&
      this.combindInfos[0] &&
      this.combindInfos[0].bookInfo &&
      this.combindInfos[0].bookInfo.bookInfo
    ) {
      return (
        this.combindInfos[0].bookInfo.bookInfo.roomPlan &&
        this.combindInfos[0].bookInfo.bookInfo.roomPlan.PaymentType
      );
    }
    return null;
  }
  private notShowServiceFee() {
    let totalFee = 0;
    if (this.initialBookDto && this.initialBookDto.ServiceFees) {
      Object.keys(this.initialBookDto.ServiceFees).forEach((k) => {
        totalFee = AppHelper.add(+this.initialBookDto.ServiceFees[k], totalFee);
      });
    }
    return !(this.tmc && this.tmc.IsShowServiceFee) || totalFee == 0;
  }
  private checkOrderTravelPayType(pt: string) {
    const payType = OrderTravelPayType[pt];
    if (!this.tmc || !this.tmc.HotelOrderPayType) {
      return false;
    }
    return this.tmc.HotelOrderPayType.includes(payType);
  }
  private async scrollEleToView(ele: Element) {
    if (this.ionContent) {
      setTimeout(() => {
        ele.classList.add("animated");
        ele.classList.toggle("shake", true);
        ele.addEventListener("transitionend", () => {
          ele.classList.toggle("shake", false);
        });
      }, 200);
      const scrollEle = await this.ionContent.getScrollElement();
      const rect = ele && ele.getBoundingClientRect();
      if (rect && scrollEle) {
        scrollEle.scrollBy({
          behavior: "smooth",
          top: rect.top - this.plt.height() / 2,
        });
      }
    }
  }

  async onBook(isSave: boolean, event: CustomEvent) {
    this.isShowFee = false;
    event.stopPropagation();
    if (this.isSubmitDisabled) {
      return;
    }
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    let canBook = false;
    let canBook2 = false;
    const isSelf = await this.staffService.isSelfBookType();
    if (this.combindInfos) {
      const c = this.combindInfos.find((it) => !it.arrivalHotelTime);
      if (c) {
        this.showErrorMsg(
          this.LangService.isCn
            ? "?????????????????????"
            : "Please select store information",
          c,
          this.getEleByAttr("arrivalHoteltimeid", c.id)
        );
        return;
      }
    }
    this.combindInfos = this.fillGroupConbindInfoApprovalInfo(
      this.combindInfos
    );
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = this.fillBookPassengers(bookDto);
    if (canBook && canBook2) {
      const popover = await this.popoverCtrl.create({
        component: WarrantyComponent,
        // event: ev,
        // translucent: true,
        cssClass: "warranty",
        componentProps: {
          title: this.getRoomPlanRulesDesc(
            this.combindInfos[0].bookInfo.bookInfo.roomPlan
          ),
        },
      });
      await popover.present();
      const warranty = await popover.onDidDismiss();
      const checked = warranty && (warranty.data as "checked" | "unchecked");
      if (!checked || checked == "unchecked") {
        return;
      }
      this.isSubmitDisabled = true;

      const res = await this.hotelService.onBook(bookDto).catch((e) => {
        AppHelper.alert(e);
        return { TradeNo: "", HasTasks: true } as IBookOrderResult;
      });
      this.isSubmitDisabled = false;
      if (res) {
        if (res.TradeNo && res.TradeNo != "0") {
          // AppHelper.toast("????????????!", 1400, "top");
          this.isPlaceOrderOk = true;
          this.isSubmitDisabled = true;
          let isHasTask = res.HasTasks;
          let payResult = false;
          this.hotelService.removeAllBookInfos();
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
              if (isSelf && isHasTask) {
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
              if (isSelf) {
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
          this.goToMyOrders();
        }
      }
      // if (res) {
      //   if (res.TradeNo) {
      //     AppHelper.toast(
      //       this.LangService.isCn ? "????????????!" : "Checkout success",
      //       1400,
      //       "top"
      //     );
      //     this.isSubmitDisabled = true;
      //     this.isPlaceOrderOk = true;
      //     if (
      //       !isSave &&
      //       isSelf &&
      //       (this.orderTravelPayType == OrderTravelPayType.Person ||
      //         this.orderTravelPayType == OrderTravelPayType.Credit)
      //     ) {
      //       let canPay = true;
      //       if (res.IsCheckPay) {
      //         this.isCheckingPay = true;
      //         canPay = await this.checkPay(res.TradeNo);
      //         this.isCheckingPay = false;
      //       }
      //       if (canPay) {
      //         if (res.HasTasks) {
      //           await AppHelper.alert(
      //             LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
      //             true
      //           );
      //         } else {
      //           await this.tmcService.payOrder(res.TradeNo);
      //         }
      //       } else {
      //         await AppHelper.alert(
      //           LanguageHelper.Order.getBookTicketWaitingTip(res.IsCheckPay),
      //           true
      //         );
      //       }
      //     } else {
      //       if (isSave) {
      //         await AppHelper.alert(
      //           "???????????????",
      //           true,
      //           LanguageHelper.getConfirmTip()
      //         );
      //       } else {
      //         await AppHelper.alert(
      //           this.LangService.isCn ? "????????????!" : "Checkout success"
      //         );
      //       }
      //     }
      //     this.hotelService.removeAllBookInfos();
      //     this.combindInfos = [];
      //     this.hotelService.dismissAllTopOverlays();
      //     this.goToMyOrders(ProductItemType.hotel);
      //   }
      // }
    }
  }
  private goToMyOrders() {
    this.router.navigate(["order-list"], {
      queryParams: { tabId: ProductItemType.plane },
    });
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>((s) => {
      let loading = false;
      if (this.checkPayCountIntervalId) {
        clearInterval(this.checkPayCountIntervalId);
      }
      this.checkPayCountIntervalId = setInterval(async () => {
        if (!loading) {
          loading = true;
          const result = await this.tmcService.checkPay(tradeNo);
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
  private getGroupedCombindInfo(
    arr: IPassengerHotelBookInfo[],
    tmc: TmcEntity
  ) {
    const group = arr.reduce((acc, item) => {
      const id =
        (item &&
          item.bookInfo.passenger &&
          item.bookInfo.passenger.AccountId) ||
        (tmc && tmc.Account && tmc.Account.Id);
      if (id) {
        if (acc[id]) {
          acc[id].push(item);
        } else {
          acc[id] = [item];
        }
      }
      return acc;
    }, {} as { [accountId: string]: IPassengerHotelBookInfo[] });
    return group;
  }
  private async initCombineInfosShowApproveInfo() {
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc();
    }
    if (this.combindInfos) {
      const group = this.getGroupedCombindInfo(this.combindInfos, this.tmc);
      this.combindInfos = [];
      Object.keys(group).forEach((key) => {
        if (group[key].length) {
          group[key][0].isShowApprovalInfo = true;
        }
        this.combindInfos = this.combindInfos.concat(group[key]);
      });
    }
  }
  private fillGroupConbindInfoApprovalInfo(arr: IPassengerHotelBookInfo[]) {
    const group = this.getGroupedCombindInfo(arr, this.tmc);
    let result = arr;
    result = [];
    Object.keys(group).forEach((key) => {
      if (group[key].length) {
        const first = group[key][0];
        result = result.concat(
          group[key].map((it) => {
            it.appovalStaff = first.appovalStaff;
            it.notifyLanguage = first.notifyLanguage;
            it.isSkipApprove = first.isSkipApprove;
            return it;
          })
        );
      }
    });
    return result;
  }
  async openApproverModal(item: IPassengerHotelBookInfo) {
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
      item.appovalStaff.Number = number;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
    }
  }
  private async initTmcOutNumberInfos() {
    const args: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[] = [];
    if (!this.combindInfos) {
      return false;
    }
    const outnumbers =
      (this.initialBookDto && this.initialBookDto.OutNumbers) || {};
    this.combindInfos.forEach((item) => {
      item.tmcOutNumberInfos.forEach((it) => {
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
    });
    const result = await this.tmcService.getTravelUrls(args,'Hotel');
    if (result) {
      this.combindInfos.forEach((item) =>
        item.tmcOutNumberInfos.forEach((info) => {
          if (info.label.toLowerCase() == "travelnumber") {
            info.loadTravelUrlErrorMsg =
              result[info.staffNumber] && result[info.staffNumber].Message;
            info.travelUrlInfos =
              result[info.staffNumber] && result[info.staffNumber].Data;
            // if (
            //   !info.value &&
            //   info.travelUrlInfos &&
            //   info.travelUrlInfos.length
            // ) {
            //   info.value = info.travelUrlInfos[0].TravelNumber;
            // }
          }
          info.isLoadingNumber = false;
        })
      );
    }
  }
  onIllegalReason(
    reason: {
      isOtherIllegalReason: boolean;
      otherIllegalReason: string;
      illegalReason: string;
    },
    info: IPassengerHotelBookInfo
  ) {
    info.isOtherIllegalReason = reason.isOtherIllegalReason;
    info.illegalReason = reason.illegalReason;
    info.otherIllegalReason = reason.otherIllegalReason;
  }
  async onModify(item: IPassengerHotelBookInfo) {
    if (!item.credentialsRequested) {
      const res: {
        [accountId: string]: CredentialsEntity[];
      } = await this.tmcService
        .getPassengerCredentials([item.bookInfo.passenger.AccountId])
        .catch((_) => ({ [item.bookInfo.passenger.AccountId]: [] }));
      if (item.credentials.length) {
        const exist = item.credentials[0];
        const credentials = res && res[item.bookInfo.passenger.AccountId];
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
    item: IPassengerHotelBookInfo
  ) {
    console.log("oncostCenterchange", data, item);
    if (data.costCenter && item) {
      item.costCenter = data.costCenter;
      item.isOtherCostCenter = data.isOtherCostCenter;
      item.otherCostCenterCode = data.otherCostCenterCode;
      item.otherCostCenterName = data.otherCostCenterName;
    }
  }
  onOrganizationChange(
    data: {
      isOtherOrganization: boolean;
      organization: OrganizationEntity;
      otherOrganizationName: string;
    },
    item: IPassengerHotelBookInfo
  ) {
    if (item && data.organization) {
      item.organization = data.organization;
      item.isOtherOrganization = data.isOtherOrganization;
      item.otherOrganizationName = data.otherOrganizationName;
    }
  }

  onSavecredential(
    credential: CredentialsEntity,
    info: IPassengerHotelBookInfo
  ) {
    if (info && credential) {
      info.vmCredential = credential;
    }
  }
  getRuleMessage(roomPlan: RoomPlanEntity) {
    return (
      roomPlan &&
      roomPlan.Rules &&
      Object.keys(roomPlan.Rules)
        .map((k) => roomPlan.Rules[k])
        .join(",")
    );
  }
  getRoomPlanRulesDesc(roomPlan: RoomPlanEntity) {
    return (
      roomPlan &&
      roomPlan.RoomPlanRules &&
      roomPlan.RoomPlanRules.map((it) => it.Description).join(",")
    );
  }
  async onSelectTravelNumber(
    arg: {
      tmcOutNumberInfos: ITmcOutNumberInfo[];
      tmcOutNumberInfo: ITmcOutNumberInfo;
      travelUrlInfo: TravelUrlInfo;
    },
    item: IPassengerHotelBookInfo
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
}
interface IPassengerHotelBookInfo {
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
  expenseType: string;
  isCanEditCrendentails: boolean;
  isNotWhitelist?: boolean;
  vmCredential: CredentialsEntity;
  credential: CredentialsEntity;
  credentials: CredentialsEntity[];
  notifyLanguage: string;
  isSkipApprove: boolean;
  isShowRoomPlanRulesDesc: boolean;
  id: string;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  bookInfo: PassengerBookInfo<IHotelInfo>;
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
