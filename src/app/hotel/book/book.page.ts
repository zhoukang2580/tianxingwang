import { BookTmcOutnumberComponent } from "./../../tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { PayService } from "src/app/services/pay/pay.service";
import { Router, ActivatedRoute } from "@angular/router";
import { CalendarService } from "src/app/tmc/calendar.service";
import { RoomPlanEntity } from "./../models/RoomPlanEntity";
import { StaffService } from "./../../hr/staff.service";
import {
  InitialBookDtoModel,
  TravelUrlInfo,
  TmcService,
  TmcApprovalType,
  PassengerBookInfo,
  TravelFormEntity,
  IllegalReasonEntity
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
  Platform
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
  OnDestroy
} from "@angular/core";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { Storage } from "@ionic/storage";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  StaffEntity,
  OrganizationEntity,
  StaffApprover
} from "src/app/hr/staff.service";
import {
  OrderTravelType,
  OrderTravelPayType
} from "src/app/order/models/OrderTravelEntity";
import { AddContact } from "src/app/tmc/models/AddContact";
import { TaskType } from "src/app/workflow/models/TaskType";
import { of, combineLatest, from, Subscription } from "rxjs";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { LanguageHelper } from "src/app/languageHelper";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { map, tap, mergeMap } from "rxjs/operators";
import * as moment from "moment";
import { trigger, state, style } from "@angular/animations";
import { HotelPaymentType } from "../models/HotelPaymentType";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { OrderCardEntity } from "src/app/order/models/OrderCardEntity";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { HotelEntity } from "../models/HotelEntity";
import { RoomEntity } from "../models/RoomEntity";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
@Component({
  selector: "app-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"],
  animations: [
    trigger("showHide", [
      state("true", style({ display: "initial" })),
      state("false", style({ display: "none" }))
    ])
  ]
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
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChildren("illegalReasonsEle") illegalReasonsEles: QueryList<
    ElementRef<HTMLElement>
  >;
  @ViewChildren(BookTmcOutnumberComponent) outnumberEles: QueryList<
    BookTmcOutnumberComponent
  >;
  error: any;
  identity: IdentityEntity;
  bookInfos: PassengerBookInfo<IHotelInfo>[];
  tmc: TmcEntity;
  isCanSkipApproval$ = of(false);
  illegalReasons: any[];
  travelForm: TravelFormEntity;
  isCheckingPay = false;
  isSubmitDisabled = false;
  isPlaceOrderOk = false;
  checkPayCountIntervalId: any;
  checkPayCount = 3;
  checkPayCountIntervalTime = 5 * 1000;
  curSelectedBookInfo: PassengerBookInfo<IHotelInfo>;
  @HostBinding("class.show-price-detail") isShowPriceDetail = false;
  dates: { date: string; price: string }[] = [];
  constructor(
    private navCtrl: NavController,
    private identityService: IdentityService,
    private hotelService: HotelService,
    private storage: Storage,
    private tmcService: TmcService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private staffService: StaffService,
    private calendarService: CalendarService,
    private router: Router,
    private payService: PayService,
    private plt: Platform,
    route: ActivatedRoute
  ) {
    this.subscriptions.push(
      route.queryParamMap.subscribe(() => {
        if (this.isManagentCredentails) {
          this.doRefresh(false);
        }
      })
    );
  }
  calcNights() {
    if (
      this.curSelectedBookInfo &&
      this.curSelectedBookInfo.bookInfo &&
      this.curSelectedBookInfo.bookInfo.roomPlan &&
      this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate &&
      this.curSelectedBookInfo.bookInfo.roomPlan.EndDate
    ) {
      return moment(this.curSelectedBookInfo.bookInfo.roomPlan.EndDate).diff(
        this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate,
        "days"
      );
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  onArrivalHotel(arrivalTime: string, item: IPassengerHotelBookInfo) {
    if (item && arrivalTime) {
      item.arrivalHotelTime = arrivalTime;
      if (this.initialBookDto && this.initialBookDto.RoomPlans) {
        const plan = this.initialBookDto.RoomPlans.find(
          it => it.PassengerClientId == item.id
        );
        if (plan && plan.GuaranteeStartTime && plan.GuaranteeEndTime) {
          const date = moment(item.arrivalHotelTime);
          const start = moment(plan.GuaranteeStartTime);
          const end = moment(plan.GuaranteeEndTime);
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
    this.router.navigate([
      AppHelper.getRoutePath("member-credential-management")
    ]);
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
            date: moment(this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate)
              .add(i, "days")
              .format("YYYY-MM-DD"),
            price: this.hotelService.getAvgPrice(
              this.curSelectedBookInfo.bookInfo.roomPlan
            )
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
          "刷新将重新初始化页面，是否刷新？",
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
        .filter(it => !!it.bookInfo);
      this.initialBookDto = await this.getInitializeBookDto();
      console.log("getInitializeBookDto", this.initialBookDto);
      if (!this.initialBookDto) {
        this.error = "初始化失败";
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
    const infos = this.hotelService.getBookInfos();
    let totalPrice = infos.reduce((arr, item) => {
      if (item && item.bookInfo && item.bookInfo.roomPlan) {
        const info = item.bookInfo;
        arr = AppHelper.add(arr, +info.roomPlan.TotalAmount);
      }
      return arr;
    }, 0);
    if (this.initialBookDto && this.initialBookDto.ServiceFees) {
      const fees = Object.keys(this.initialBookDto.ServiceFees).reduce(
        (acc, key) => {
          const fee = +this.initialBookDto.ServiceFees[key];
          acc = AppHelper.add(fee, acc);
          return acc;
        },
        0
      );
      totalPrice = AppHelper.add(fees, totalPrice);
    }
    return totalPrice;
  }
  onOrderTravelPayTypeSelect(pt: { value: number }) {
    this.orderTravelPayTypes = this.orderTravelPayTypes.map(it => {
      it.checked = +it.value == pt.value;
      return it;
    });
  }
  private async initOrderTravelPayTypes() {
    // console.log("initOrderTravelPayTypes", this.initialBookDto);
    this.tmc = this.tmc || (await this.tmcService.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch(_ => ({} as any));
    if (!this.initialBookDto || !this.initialBookDto.PayTypes) {
      return;
    }
    this.orderTravelPayType = this.tmc && this.tmc.HotelPayType;
    const arr = Object.keys(this.initialBookDto.PayTypes);
    this.orderTravelPayTypes = [];
    arr.forEach(it => {
      if (!this.orderTravelPayTypes.find(item => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDto.PayTypes[it],
          value: +it
        });
      }
    });
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
      Tmc.HotelApprovalType == 0
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
      Tmc.HotelApprovalType == 0
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
  getDate(roomPlan: RoomPlanEntity) {
    if (!roomPlan || !roomPlan.BeginDate) {
      return "";
    }
    const day = this.calendarService.generateDayModelByDate(roomPlan.BeginDate);
    return `${day.date} ${day.dayOfWeekName}`;
  }
  private fillCredicardInfo(item: IPassengerHotelBookInfo) {
    if (!item.creditCardInfo || !item.creditCardInfo.isShowCreditCard) {
      return true;
    }
    const showErrorMsg = (msg: string) => {
      AppHelper.alert(
        `${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.credential && item.credential.Number)}信用卡信息${msg}`
      );
      const ele = document.querySelector(`[datacreditcardid='${item.id}']`);
      this.scrollEleToView(ele);
    };
    if (!item.creditCardInfo.creditCardType) {
      showErrorMsg("未选择信用卡的类型必填");
      return false;
    }
    if (!item.creditCardInfo.creditCardNumber) {
      showErrorMsg("信用卡号未必填");
      return false;
    }
    if (!item.creditCardInfo.creditCardCvv) {
      showErrorMsg("信用卡CVV必填");
      return false;
    }
    if (!item.creditCardPersionInfo) {
      showErrorMsg("信用卡持卡人信息必填");
      return false;
    }
    if (!item.creditCardPersionInfo.credentialType) {
      showErrorMsg("持卡人证件类型必填");
      return false;
    }
    if (!item.creditCardPersionInfo.credentialNumber) {
      showErrorMsg("持卡人证件号码必填");
      return false;
    }
    // if (!item.creditCardPersionInfo.name) {
    //   showErrorMsg("持卡人名必填");
    //   return false;
    // }
    return true;
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    bookDto.Linkmans = [];
    const showErrorMsg = (msg: string, item: IPassengerHotelBookInfo) => {
      AppHelper.alert(
        `联系人${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.credential && item.credential.Number)}信息${msg}不能为空`
      );
    };
    for (let i = 0; i < this.combindInfos.length; i++) {
      const item = this.combindInfos[i];
      if (item.addContacts) {
        for (let j = 0; j < item.addContacts.length; j++) {
          const man = item.addContacts[j];
          const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
          if (!man.accountId) {
            showErrorMsg("", item);
            return false;
          }
          if (!man.email) {
            showErrorMsg("Email", item);
            return false;
          }
          if (
            !(
              man.notifyLanguage == "" ||
              man.notifyLanguage == "cn" ||
              man.notifyLanguage == "en"
            )
          ) {
            showErrorMsg(LanguageHelper.getNotifyLanguageTip(), item);
            return false;
          }
          if (!man.mobile) {
            showErrorMsg("Mobile", item);
            return false;
          }
          if (!man.name) {
            showErrorMsg("Name", item);
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
    const showErrorMsg = (msg: string, item: IPassengerHotelBookInfo) => {
      AppHelper.alert(
        `${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.credential &&
            item.credential.CheckFirstName +
              item.credential.CheckLastName)} 【${item.credential &&
          item.credential.Number}】 ${msg} 信息不能为空`
      );
    };
    bookDto.Passengers = [];
    for (let i = 0; i < this.combindInfos.length; i++) {
      const combindInfo = this.combindInfos[i];
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove
      ) {
        showErrorMsg(LanguageHelper.Flight.getApproverTip(), combindInfo);
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
        p.OrderCard.Description = "信用卡";
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
        showErrorMsg(LanguageHelper.getNotifyLanguageTip(), combindInfo);
        return false;
      }
      p.MessageLang = combindInfo.notifyLanguage;
      p.CardName = "";
      p.CardNumber = "";
      p.TicketNum = "";
      p.Credentials = new CredentialsEntity();
      p.Credentials = { ...combindInfo.vmCredential };
      if (!combindInfo.vmCredential.Type) {
        showErrorMsg(LanguageHelper.getCredentialTypeTip(), combindInfo);
        return false;
      }
      p.Credentials.Type = combindInfo.vmCredential.Type;
      p.Credentials.Gender = combindInfo.vmCredential.Gender;
      if (!combindInfo.vmCredential.Number) {
        showErrorMsg(LanguageHelper.getCredentialNumberTip(), combindInfo);
        return false;
      }
      p.Credentials.Number = combindInfo.vmCredential.Number;
      if (!combindInfo.vmCredential.CheckLastName) {
        showErrorMsg(LanguageHelper.Flight.getCheckLastNameTip(), combindInfo);
        return false;
      }
      p.Credentials.CheckFirstName = combindInfo.vmCredential.CheckLastName;
      if (!combindInfo.vmCredential.CheckFirstName) {
        showErrorMsg(LanguageHelper.Flight.getCheckFirstNameTip(), combindInfo);
        return false;
      }
      p.Credentials.CheckFirstName = combindInfo.vmCredential.CheckFirstName;
      p.IllegalPolicy =
        (info.roomPlan &&
          info.roomPlan.Rules &&
          Object.keys(info.roomPlan.Rules)
            .map(key => info.roomPlan.Rules[key])
            .join(",")) ||
        "";
      p.Mobile =
        (combindInfo.credentialStaffMobiles &&
          combindInfo.credentialStaffMobiles
            .filter(m => m.checked)
            .map(m => m.mobile)
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
            .filter(e => e.checked)
            .map(m => m.email)
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
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason) {
          showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo
          );
          if (
            this.illegalReasonsEles &&
            this.illegalReasonsEles.first &&
            this.illegalReasonsEles.first.nativeElement
          ) {
            this.scrollEleToView(this.illegalReasonsEles.first.nativeElement);
          }
          return false;
        }
      }
      if (!p.Mobile) {
        showErrorMsg(LanguageHelper.Flight.getMobileTip(), combindInfo);
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
      if (
        this.tmc &&
        this.tmc.OutNumberRequiryNameArray &&
        this.tmc.OutNumberRequiryNameArray.length
      ) {
        if (
          !combindInfo.tmcOutNumberInfos ||
          combindInfo.tmcOutNumberInfos.some(it =>
            this.tmc.OutNumberRequiryNameArray.some(
              k => it.key == k && !it.value
            )
          )
        ) {
          showErrorMsg("外部编号", combindInfo);
          console.log(this.outnumberEles.first);
          if (
            this.outnumberEles &&
            this.outnumberEles.first &&
            this.outnumberEles.first.nativeElement
          ) {
            this.scrollEleToView(this.outnumberEles.first.nativeElement);
          }
          return false;
        }
      }
      if (combindInfo.tmcOutNumberInfos) {
        p.OutNumbers = {};
        combindInfo.tmcOutNumberInfos.forEach(it => {
          if (it.value) {
            p.OutNumbers[it.key] = it.value;
          }
        });
      }
      if (!combindInfo.travelType) {
        showErrorMsg(LanguageHelper.Flight.getTravelTypeTip(), combindInfo);
        return false;
      }
      if (!this.orderTravelPayType) {
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo
        );
        return false;
      }
      p.Credentials.Account =
        combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
      p.Credentials.Account =
        p.Credentials.Account || combindInfo.credential.Account;
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = this.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
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
            it => it.Id == (p.RoomPlan.Room && p.RoomPlan.Room.Id)
          );
        p.RoomPlan.Room = {
          ...p.RoomPlan.Room,
          Name: room && room.Name,
          Hotel: {
            Id: combindInfo.bookInfo.bookInfo.hotelEntity.Id,
            Name: combindInfo.bookInfo.bookInfo.hotelEntity.Name,
            Address: combindInfo.bookInfo.bookInfo.hotelEntity.Address,
            Phone: combindInfo.bookInfo.bookInfo.hotelEntity.Phone
          }
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
      this.identityService.getIdentitySource()
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.TrainApprovalType != 0 &&
          tmc.TrainApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap(can => {
        console.log("是否可以跳过审批", can);
      })
    );
    this.travelForm = this.initialBookDto.TravelFrom;
    this.illegalReasons = (this.initialBookDto.IllegalReasons || []).map(it => {
      return {
        Name: it
      } as IllegalReasonEntity;
    });
    await this.initCombindInfos();
    await this.initCombineInfosShowApproveInfo();
    await this.initSelfBookTypeCredentials();
    this.initTmcOutNumberInfos();
    await this.initOrderTravelPayTypes();
    console.log("combindInfos", this.combindInfos);
  }
  private async initCombindInfos() {
    try {
      this.combindInfos = [];
      const bookInfos = this.hotelService.getBookInfos();
      for (let i = 0; i < bookInfos.length; i++) {
        const bookInfo = bookInfos[i];
        const cs = (
          (this.initialBookDto && this.initialBookDto.Staffs) ||
          []
        ).find(it => it.Account.Id == bookInfo.passenger.AccountId);
        const cstaff = cs && cs.CredentialStaff;
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
          credentialStaffApprovers = Object.keys(tempObj).map(key => {
            const it = tempObj[key][0];
            return {
              Tag: it && it.Tag,
              Type: it && it.Type,
              approvers: tempObj[key]
            };
          });
          console.log("credentialStaffApprovers", credentialStaffApprovers);
        }
        // console.log("credentials", credentials, cstaff);
        if (
          bookInfo.credential &&
          !credentials.find(
            it =>
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
            moment()
              .clone()
              .add(i, "years")
              .format("YYYY")
          );
        }
        combineInfo.creditCardInfo = {
          years,
          expirationYear: `${new Date().getFullYear()}`,
          expirationMonth: `1`,
          creditCardExpirationDate: `${moment()
            .startOf("year")
            .format("YYYY-MM-DD")}`
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
        combineInfo.travelType = OrderTravelType.Business; // 默认全部因公
        combineInfo.credentialStaffMobiles =
          cstaff && cstaff.Account && cstaff.Account.Mobile
            ? cstaff.Account.Mobile.split(",").map((mobile, idx) => {
                return {
                  checked: idx == 0,
                  mobile
                };
              })
            : [];
        combineInfo.credentialStaffEmails =
          cstaff && cstaff.Account && cstaff.Account.Email
            ? cstaff.Account.Email.split(",").map((email, idx) => {
                return {
                  checked: idx == 0,
                  email
                };
              })
            : [];
        combineInfo.credentialStaffApprovers = credentialStaffApprovers;
        combineInfo.organization = {
          Code: cstaff && cstaff.Organization && cstaff.Organization.Code,
          Name: cstaff && cstaff.Organization && cstaff.Organization.Name
        } as any;
        combineInfo.costCenter = {
          code: cstaff && cstaff.CostCenter && cstaff.CostCenter.Code,
          name: cstaff && cstaff.CostCenter && cstaff.CostCenter.Name
        };
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        combineInfo.tmcOutNumberInfos = (
          (this.tmc && this.tmc.OutNumberNameArray) ||
          []
        ).map(n => {
          return {
            label: n,
            key: n,
            isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
            required:
              this.tmc &&
              this.tmc.OutNumberRequiryNameArray &&
              this.tmc.OutNumberRequiryNameArray.some(name => name == n),
            value: this.getTravelFormNumber(n),
            staffNumber: cstaff && cstaff.Number,
            staffOutNumber: cstaff && cstaff.OutNumber,
            isTravelNumber: n.toLowerCase() == "TravelNumber".toLowerCase(),
            canSelect: n.toLowerCase() == "TravelNumber".toLowerCase(),
            isDisabled: !!(this.travelForm && n == "TravelNumber".toLowerCase())
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
    const one = this.travelForm.Numbers.find(n => n.Name == name);
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
      this.combindInfos = this.combindInfos.map(item => {
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
    infos.forEach(bookInfo => {
      if (bookInfo.passenger && bookInfo.bookInfo) {
        const p = new PassengerDto();
        p.ClientId = bookInfo.id;
        p.RoomPlan = bookInfo.bookInfo.roomPlan;
        p.Credentials = bookInfo.credential;
        const account = new AccountEntity();
        account.Id = bookInfo.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        p.Policy = bookInfo.passenger.Policy;
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
      this.hotelService.getBookInfos().filter(it => !!it.bookInfo)
    );
    this.doRefresh(false);
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
  notShowServiceFee() {
    let totalFee = 0;
    if (this.initialBookDto && this.initialBookDto.ServiceFees) {
      Object.keys(this.initialBookDto.ServiceFees).forEach(k => {
        totalFee = AppHelper.add(+this.initialBookDto.ServiceFees[k], totalFee);
      });
    }
    return !(this.tmc && this.tmc.IsShowServiceFee) || totalFee == 0;
  }
  checkOrderTravelPayType(pt: string) {
    const payType = OrderTravelPayType[pt];
    // console.log(
    //   "checkOrderTravelPayType",
    //   payType,
    //   this.tmc && this.tmc.HotelOrderPayType
    // );
    if (!this.tmc || !this.tmc.HotelOrderPayType) {
      return false;
    }
    return this.tmc.HotelOrderPayType.includes(payType);
  }
  private async scrollEleToView(ele: Element) {
    if (this.ionContent) {
      const scrollEle = await this.ionContent.getScrollElement();
      const rect = ele && ele.getBoundingClientRect();
      if (rect && scrollEle) {
        scrollEle.scrollBy({
          behavior: "smooth",
          top: rect.top - this.plt.height() / 2
        });
      }
    }
  }
  async onBook(isSave: boolean) {
    if (this.isSubmitDisabled) {
      return;
    }
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    let canBook = false;
    let canBook2 = false;
    const isSelf = await this.staffService.isSelfBookType();
    if (this.combindInfos) {
      const c = this.combindInfos.find(it => !it.arrivalHotelTime);
      if (c) {
        AppHelper.alert("请选择到店时间");
        const ele = document.querySelector(
          `app-room-show-item[dataid='${c.id}']`
        );
        this.scrollEleToView(ele);
        return;
      }
    }
    this.combindInfos = this.fillGroupConbindInfoApprovalInfo(
      this.combindInfos
    );
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = this.fillBookPassengers(bookDto);
    if (canBook && canBook2) {
      this.isSubmitDisabled = true;
      const res = await this.hotelService.onBook(bookDto).catch(e => {
        AppHelper.alert(e);
        return { TradeNo: "", HasTasks: true };
      });
      this.isSubmitDisabled = false;
      if (res) {
        if (res.TradeNo) {
          AppHelper.toast("下单成功!", 1400, "top");
          this.isSubmitDisabled = true;
          this.isPlaceOrderOk = true;
          if (
            !isSave &&
            isSelf &&
            this.orderTravelPayType == OrderTravelPayType.Person
          ) {
            this.isCheckingPay = true;
            const canPay = await this.checkPay(res.TradeNo);
            this.isCheckingPay = false;
            if (canPay) {
              if (res.HasTasks) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                  true
                );
              } else {
                await this.tmcService.payOrder(res.TradeNo);
              }
            } else {
              await AppHelper.alert(
                LanguageHelper.Order.getBookTicketWaitingTip(),
                true
              );
            }
          } else {
            if (isSave) {
              await AppHelper.alert(
                "订单已保存",
                true,
                LanguageHelper.getConfirmTip()
              );
            } else {
              await AppHelper.alert("下单成功");
            }
          }
          this.hotelService.removeAllBookInfos();
          this.combindInfos = [];
          this.hotelService.dismissAllTopOverlays();
          this.goToMyOrders(ProductItemType.hotel);
        }
      }
    }
  }
  private goToMyOrders(tab: ProductItemType) {
    this.router.navigate(["product-tabs"], {
      queryParams: { tabId: tab }
    });
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>(s => {
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
      Object.keys(group).forEach(key => {
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
    Object.keys(group).forEach(key => {
      if (group[key].length) {
        const first = group[key][0];
        result = result.concat(
          group[key].map(it => {
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
      component: SearchApprovalComponent
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
          Account: new AccountEntity()
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
    this.combindInfos.forEach(item => {
      item.tmcOutNumberInfos.forEach(it => {
        if (it.isLoadNumber) {
          if (
            it.staffNumber &&
            !args.find(n => n.staffNumber == it.staffNumber)
          ) {
            args.push({
              staffNumber: it.staffNumber,
              staffOutNumber: it.staffOutNumber,
              name: it.value
            });
          }
        }
      });
    });
    const result = await this.tmcService.getTravelUrls(args);
    if (result) {
      this.combindInfos.forEach(item =>
        item.tmcOutNumberInfos.forEach(info => {
          info.loadTravelUrlErrorMsg =
            result[info.staffNumber] && result[info.staffNumber].Message;
          info.travelUrlInfos =
            result[info.staffNumber] && result[info.staffNumber].Data;
          if (
            !info.value &&
            info.travelUrlInfos &&
            info.travelUrlInfos.length
          ) {
            info.value = info.travelUrlInfos[0].TravelNumber;
          }
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
        .catch(_ => ({ [item.bookInfo.passenger.AccountId]: [] }));
      if (item.credentials.length) {
        const exist = item.credentials[0];
        const credentials = res && res[item.bookInfo.passenger.AccountId];
        item.credentialsRequested = credentials && credentials.length > 0;
        if (credentials) {
          if (credentials.length) {
            const one = credentials.find(
              it => it.Number == exist.Number && exist.Type == it.Type
            );
            if (one) {
              item.credentials = [one, ...credentials.filter(it => it != one)];
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
      item.credentials = item.credentials.filter(it => !!it.Number);
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
  onContactsChange(contacts: AddContact[], info: IPassengerHotelBookInfo) {
    if (info && contacts) {
      info.addContacts = contacts;
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
        .map(k => roomPlan.Rules[k])
        .join(",")
    );
  }
  getRoomPlanRulesDesc(roomPlan: RoomPlanEntity) {
    return (
      roomPlan &&
      roomPlan.RoomPlanRules &&
      roomPlan.RoomPlanRules.map(it => it.Description).join(",")
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
