import { LangService } from "src/app/services/lang.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { BookCredentialCompComponent } from "../../tmc/components/book-credential-comp/book-credential-comp.component";
import { flyInOut } from "../../animations/flyInOut";
import { environment } from "../../../environments/environment";
import * as moment from "moment";
import {
  InternationalHotelService,
  IInterHotelInfo,
} from "../international-hotel.service";
import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList,
  ElementRef,
  HostBinding,
  HostListener,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";
import {
  PassengerBookInfo,
  TmcService,
  InitialBookDtoModel,
  TmcEntity,
  TravelFormEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelUrlInfo,
  IBookOrderResult,
} from "src/app/tmc/tmc.service";
import {
  NavController,
  PopoverController,
  ModalController,
  IonRefresher,
  IonContent,
  Platform,
  IonSelect,
} from "@ionic/angular";
import {
  HrService,
  StaffApprover,
  OrganizationEntity,
  StaffEntity,
} from "src/app/hr/hr.service";
import { Router, ActivatedRoute } from "@angular/router";
import { PayService } from "src/app/services/pay/pay.service";
import { CalendarService } from "src/app/tmc/calendar.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { HotelPaymentType } from "src/app/hotel/models/HotelPaymentType";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import {
  OrderTravelPayType,
  OrderTravelType,
} from "src/app/order/models/OrderTravelEntity";
import {
  BookTmcOutnumberComponent,
  ITmcOutNumberInfo,
} from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { of, combineLatest, from, Subscription, fromEvent } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { RoomPlanEntity } from "src/app/hotel/models/RoomPlanEntity";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { OrderCardEntity } from "src/app/order/models/OrderCardEntity";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { RoomEntity } from "src/app/hotel/models/RoomEntity";
import { map, tap } from "rxjs/operators";
import { TaskType } from "src/app/workflow/models/TaskType";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { AddContact } from "src/app/tmc/models/AddContact";
import { BookCostcenterCompComponent } from "src/app/tmc/components/book-costcenter-comp/book-costcenter-comp.component";
import { OrderHotelType } from "src/app/order/models/OrderHotelEntity";
import { RefresherComponent } from "src/app/components/refresher";
import { WarrantyComponent } from "src/app/hotel/components/warranty/warranty.component";
import { InterHotelWarrantyComponent } from "../components/inter-hotel-warranty/inter-hotel-warranty.component";
import { CHINESE_REG } from "src/app/member/member.service";
import { SelectComponent } from "src/app/components/select/select.component";
import { HotelBookType } from "src/app/hotel/models/HotelBookType";
import { SearchCostcenterComponent } from "src/app/tmc/components/search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { OrderService } from "src/app/order/order.service";
import { StorageService } from "src/app/services/storage-service.service";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-inter-hotel-book-df",
  templateUrl: "./inter-hotel-book-df.page.html",
  styleUrls: ["./inter-hotel-book-df.page.scss"],
  animations: [flyInOut],
})
export class InterHotelBookDfPage implements OnInit, OnDestroy, AfterViewInit {
  private initialBookDto: InitialBookDtoModel;
  // private isManagentCredentails = false;
  HotelBookType = HotelBookType;
  private subscriptions: Subscription[] = [];
  checkInPersionCount = 1;
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
  @ViewChildren(BookTmcOutnumberComponent)
  outnumberEles: QueryList<BookTmcOutnumberComponent>;
  error: any;
  identity: IdentityEntity;
  bookInfos: PassengerBookInfo<IInterHotelInfo>[];
  tmc: TmcEntity;
  isCanSkipApproval$ = of(false);
  illegalReasons: any[];
  expenseTypes: { Name: string; Tag: string; }[];
  travelForm: TravelFormEntity;
  isCheckingPay = false;
  isSubmitDisabled = false;
  isPlaceOrderOk = false;
  isShowFee = false;
  isSelfBookType = true;
  serviceFee: number;
  checkPayCountIntervalId: any;
  checkPayCount = 3;
  checkPayCountIntervalTime = 5 * 1000;
  arrivalDateTimes: string[];
  curSelectedBookInfo: PassengerBookInfo<IInterHotelInfo>;
  @HostBinding("class.show-price-detail") isShowPriceDetail = false;
  dates: { date: string; price: string }[] = [];

  constructor(
    private navCtrl: NavController,
    private identityService: IdentityService,
    private hotelService: InternationalHotelService,
    private storage: StorageService,
    private tmcService: TmcService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    private staffService: HrService,
    private calendarService: CalendarService,
    private router: Router,
    route: ActivatedRoute,
    private payService: PayService,
    private plt: Platform,
    private langService: LangService,
    private orderService: OrderService,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
    this.subscriptions.push(
      route.queryParamMap.subscribe(() => {
        this.doRefresh(false);
        // if (this.isManagentCredentails) {
        // }
      })
    );
  }
  private initCheckingInPersonInfos() {
    this.subscriptions.push(
      this.hotelService.getSearchConditionSource().subscribe((c) => {
        this.checkInPersionCount = (c && c.adultCount) || 1;
      })
    );
  }
  onToggleShowTravelDetail(item: IPassengerHotelBookInfo) {
    item.isShowTravelDetail = !item.isShowTravelDetail;
  }
  calcNights(curSelectedBookInfo: IPassengerHotelBookInfo) {
    // this.curSelectedBookInfo = this.hotelService.getBookInfos()[0];

    if (
      curSelectedBookInfo &&
      curSelectedBookInfo.bookInfo &&
      curSelectedBookInfo.bookInfo.bookInfo &&
      curSelectedBookInfo.bookInfo.bookInfo.roomPlan &&
      curSelectedBookInfo.bookInfo.bookInfo.roomPlan.BeginDate &&
      curSelectedBookInfo.bookInfo.bookInfo.roomPlan.EndDate
    ) {
      return this.calendarService.diff(
        curSelectedBookInfo.bookInfo.bookInfo.roomPlan.EndDate,
        curSelectedBookInfo.bookInfo.bookInfo.roomPlan.BeginDate,
        "days"
      );
    }
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
  onBedChange(bedEle: IonSelect) {
    if (bedEle) {
      bedEle.open();
    }
  }
  async onChangeCredential(
    credentialSelect: IonSelect,
    item: IPassengerHotelBookInfo
  ) {
    await this.onModify(item);
    if (credentialSelect) {
      credentialSelect.open();
    }
  }
  credentialCompareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  onShowPriceDetails(evt: {
    isShow: boolean;
    bookInfo: PassengerBookInfo<IInterHotelInfo>;
  }) {
    this.curSelectedBookInfo = evt.bookInfo;
    if (evt.isShow) {
      this.dates = [];
      const n = this.calcNights(this.combindInfos && this.combindInfos[0]);
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
            price: `${this.hotelService.getAvgPrice(
              this.curSelectedBookInfo.bookInfo.roomPlan
            )}`,
          });
        }
      }
    }
    this.isShowPriceDetail = evt.isShow;
  }
  @HostListener("click", ["$event"])
  closePriceDetail(evt: CustomEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.isShowPriceDetail = false;
  }
  back() {
    this.navCtrl.pop();
  }

  async doRefresh(byUser: boolean) {
    try {
      this.staffService.isSelfBookType().then((s) => {
        this.isSelfBookType = s;
      });
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
        .filter((it) => !!it.bookInfo);
      this.initialBookDto = await this.getInitializeBookDto();
      if (!this.initialBookDto) {
        this.error = "初始化失败";
        return "";
      }
      this.tmc = this.initialBookDto.Tmc;
      await this.initializeViewModel();
      // if (!environment.production) {
      //   if (this.combindInfos && this.combindInfos.length) {
      //     window.localStorage.setItem(
      //       "this.initialInterHotelBookDto",
      //       JSON.stringify(this.combindInfos)
      //     );
      //   }
      //   const local = window.localStorage.getItem(
      //     "this.initialInterHotelBookDto"
      //   );
      //   if (local) {
      //     this.combindInfos = JSON.parse(local);
      //   }
      // }
      console.log("getInitializeBookDto", this.initialBookDto);
    } catch (e) {
      console.log(e);
      this.error = e;
    }
    this.isPlaceOrderOk = false;
  }
  ngAfterViewInit() {
    console.log("outnumberEles", this.outnumberEles.first);
  }
  get totalPrice() {
    const infos = this.hotelService.getBookInfos();
    let totalPrice = infos.reduce((arr, item) => {
      if (item && item.bookInfo && item.bookInfo.roomPlan) {
        const info = item.bookInfo;
        const roomPrice = +info.roomPlan.TotalAmount;
        arr = AppHelper.add(arr, roomPrice);
      }
      return arr;
    }, 0);
    // if (this.initialBookDto && this.initialBookDto.ServiceFees) {
    let fees = this.showServiceFees();
    // const fees = Object.keys(this.initialBookDto.ServiceFees).reduce(
    //   (acc, key) => {
    //     const fee = +this.initialBookDto.ServiceFees[key];
    //     acc = AppHelper.add(fee, acc);
    //     return acc;
    //   },
    //   0
    // );
    totalPrice = AppHelper.add(fees, totalPrice);
    // }
    return totalPrice;
  }
  onOrderTravelPayTypeSelect(pt: { value: number }) {
    this.orderTravelPayTypes = this.orderTravelPayTypes.map((it) => {
      it.checked = +it.value == pt.value;
      return it;
    });
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
    this.orderTravelPayType = this.tmc && this.tmc.InternationalHotelPayType;
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
      Tmc.InternationalHotelApprovalType == TmcApprovalType.None ||
      !Tmc.InternationalHotelApprovalType
    ) {
      return false;
    }
    if (Tmc.InternationalHotelApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.InternationalHotelApprovalType ==
      TmcApprovalType.ExceedPolicyApprover &&
      this.getRuleMessage(item.bookInfo.bookInfo.roomPlan)
    ) {
      return true;
    }
    return false;
  }
  onAddCheckInPersion(combindInfo: IPassengerHotelBookInfo) {
    if (combindInfo) {
      if (!combindInfo.checkInPersonInfos) {
        combindInfo.checkInPersonInfos = [
          {
            isMain: true,
            firstName: combindInfo.credential.Givenname,
            lastName: combindInfo.credential.Surname,
          },
        ];
        combindInfo.checkInPersonInfos.push({} as any);
      } else {
        if (combindInfo.checkInPersonInfos.length < this.checkInPersionCount) {
          combindInfo.checkInPersonInfos.push({} as any);
        } else {
          AppHelper.alert(
            "不能添加更多入住信息！",
            true,
            LanguageHelper.getConfirmTip()
          );
        }
      }
    }
  }
  onRemoveCheckInPersion(c, combindInfo: IPassengerHotelBookInfo) {
    combindInfo.checkInPersonInfos = combindInfo.checkInPersonInfos.filter(
      (it) => it != c
    );
  }
  isAllowSelectApprove(info: IPassengerHotelBookInfo) {
    const Tmc = this.initialBookDto.Tmc;
    const staff = info.credentialStaff;
    if (
      !Tmc ||
      Tmc.InternationalHotelApprovalType == TmcApprovalType.None ||
      !Tmc.InternationalHotelApprovalType
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.InternationalHotelApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.InternationalHotelApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }

    if (
      Tmc.InternationalHotelApprovalType == TmcApprovalType.ExceedPolicyFree &&
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
  private async showErrorMsg(
    msg: string,
    item: IPassengerHotelBookInfo,
    ele: HTMLElement
  ) {
    await AppHelper.alert(
      this.langService.isCn
        ? `${(item.credentialStaff && item.credentialStaff.Name) ||
        (item.credential &&
          item.credential.Surname + item.credential.Givenname)
        } 【${item.credential && item.credential.Number
        }】 ${msg} 信息不能为空`
        : `${(item.credentialStaff && item.credentialStaff.Name) ||
        (item.credential &&
          item.credential.Surname + item.credential.Givenname)
        } 【${item.credential && item.credential.Number
        }】 ${msg} Information cannot be empty`
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
  private fillCredicardInfo(item: IPassengerHotelBookInfo) {
    if (!item.creditCardInfo || !item.creditCardInfo.isShowCreditCard) {
      return true;
    }
    if (!item.creditCardInfo.creditCardType) {
      this.showErrorMsg(
        "未选择信用卡的类型必填",
        item,
        this.getEleByAttr("creditCardInfocreditCardType", item.id)
      );
      return false;
    }
    if (!item.creditCardInfo.creditCardNumber) {
      this.showErrorMsg(
        "信用卡号未必填",
        item,
        this.getEleByAttr("creditCardInfocreditCardNumber", item.id)
      );
      return false;
    }
    if (!item.creditCardInfo.creditCardCvv) {
      this.showErrorMsg(
        "信用卡CVV必填",
        item,
        this.getEleByAttr("creditCardInfocreditCardCvv", item.id)
      );
      return false;
    }
    if (!item.creditCardPersionInfo) {
      this.showErrorMsg(
        "信用卡持卡人信息必填",
        item,
        this.getEleByAttr("creditCardPersionInfo", item.id)
      );
      return false;
    }
    if (!item.creditCardPersionInfo.credentialType) {
      this.showErrorMsg(
        "持卡人证件类型必填",
        item,
        this.getEleByAttr("creditCardPersionInfocredentialType", item.id)
      );
      return false;
    }
    if (!item.creditCardPersionInfo.credentialNumber) {
      this.showErrorMsg(
        "持卡人证件号码必填",
        item,
        this.getEleByAttr("creditCardPersionInfocredentialNumber", item.id)
      );
      return false;
    }
    return true;
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    bookDto.Linkmans = [];
    for (const item of this.combindInfos) {
      if (item.addContacts && item.addContacts.length) {
        for (const man of item.addContacts) {
          const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
          if (!man.accountId) {
            this.showErrorMsg(
              "联系人账号不能为空",
              item,
              this.getEleByAttr("linkman", item.id)
            );
            return false;
          }
          if (!man.email) {
            this.showErrorMsg(
              "Email",
              item,
              this.getEleByAttr("linkman", item.id)
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
              LanguageHelper.getNotifyLanguageTip(),
              item,
              this.getEleByAttr("linkman", item.id)
            );
            return false;
          }
          if (!man.mobile) {
            this.showErrorMsg(
              "Mobile",
              item,
              this.getEleByAttr("linkman", item.id)
            );
            return false;
          }
          if (!man.name) {
            this.showErrorMsg(
              "Name",
              item,
              this.getEleByAttr("linkman", item.id)
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
    for (let i = 0; i < this.combindInfos.length; i++) {
      const combindInfo = this.combindInfos[i];
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
        if (combindInfo.creditCardInfo.cardCredentialsMobile) {
          p.OrderCard.SetVariable(
            "CardCredentialsMobile",
            combindInfo.creditCardInfo.cardCredentialsMobile
          );
        }
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
      if (combindInfo.checkInPersonInfos) {
        const cp = combindInfo.checkInPersonInfos.find((it) =>
          CHINESE_REG.test(`${it.lastName}${it.firstName}`)
        );
        if (cp) {
          this.showErrorMsg(
            `请为入住人【${cp.lastName} ${cp.firstName}】输入拼音或者英文`,
            combindInfo,
            this.getEleByAttr("checkinpersionid", combindInfo.id)
          );
          return;
        }
        p.CustomerName = combindInfo.checkInPersonInfos
          .filter(
            (it) => !it.isMain && !it.isChild && it.firstName && it.lastName
          )
          .map((it) => `${it.lastName},${it.firstName}`)
          .join("/");
        if (p.CustomerName) {
          const main = combindInfo.checkInPersonInfos
            .filter(
              (it) => it.isMain && !it.isChild && it.firstName && it.lastName
            )
            .map((it) => `${it.lastName},${it.firstName}`)
            .join("/");
          p.CustomerName = `${main}/${p.CustomerName}`;
        }
        p.ChildrenName = combindInfo.checkInPersonInfos
          .filter((it) => it.isChild && it.firstName && it.lastName)
          .map((it) => `${it.lastName},${it.firstName}`)
          .join("/");
      }
      if (
        !combindInfo.vmCredential.Type ||
        !this.checkCredentialValidate(combindInfo)
      ) {
        const tip = !combindInfo.vmCredential.Type
          ? LanguageHelper.getCredentialTypeTip()
          : "请选择合适的证件";
        this.showErrorMsg(
          tip,
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
        p.Mobile = `${p.Mobile
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
        p.Email = `${p.Email
            ? p.Email + "," + combindInfo.credentialStaffOtherEmail
            : combindInfo.credentialStaffOtherEmail
          }`;
      }
      p.ExpenseType = combindInfo.expenseType;
      p.IllegalReason =
        combindInfo.otherIllegalReason || combindInfo.illegalReason || "";
      if (
        !combindInfo.isNotWhitelist &&
        combindInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.roomPlan &&
        combindInfo.bookInfo.bookInfo.roomPlan.Rules
      ) {
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason && this.tmc.IsNeedIllegalReason) {
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
              this.showErrorMsg(
                it.label + this.langService.isCn ? "必填" : " Required ",
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
          this.getEleByAttr("orderTravelPayTypeid", "orderTravelPayTypeid")
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
      }
      if (combindInfo.bookInfo) {
        p.Policy = combindInfo.bookInfo.passenger.Policy;
        if (
          combindInfo.bookInfo.bookInfo &&
          combindInfo.bookInfo.bookInfo.roomPlan &&
          combindInfo.bookInfo.bookInfo.roomPlan.BeginDate
        ) {
          p.CheckinTime = `${combindInfo.bookInfo.bookInfo.roomPlan.BeginDate.substr(
            0,
            10
          )}T14:00:00`;
        }
      }
      p.OrderHotelType = OrderHotelType.International;
      bookDto.Passengers.push(p);
    }
    return true;
  }
  onManagementCredentials(item: IPassengerHotelBookInfo) {
    item.credentialsRequested = false;
    // this.isManagentCredentails = true;
    this.router.navigate([AppHelper.getRoutePath("member-credential-list")]);
  }
  private async initializeViewModel() {
    this.isCanSkipApproval$ = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource(),
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.TrainApprovalType &&
          tmc.TrainApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap((can) => {
        console.log("是否可以跳过审批", can);
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
    console.log("combindInfos", this.combindInfos);
  }
  private async initCombindInfos() {
    try {
      this.combindInfos = [];
      const isSelfOrisSecretary =
        (await this.staffService.isSecretaryBookType()) ||
        (await this.staffService.isSelfBookType());
      const bookInfos = this.hotelService.getBookInfos();
      for (const bookInfo of bookInfos) {
        const cs = (
          (this.initialBookDto && this.initialBookDto.Staffs) ||
          []
        ).find((it) => it.Account.Id == bookInfo.passenger.AccountId);
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
        combineInfo.isShowTravelDetail = true;
        const years = [];
        for (let j = 0; j <= 30; j++) {
          years.push(
            this.calendarService
              .getMoment()
              .clone()
              .add(j, "years")
              .format("YYYY")
          );
        }
        combineInfo.creditCardInfo = {
          years,
          expirationYear: `${new Date().getFullYear()}`,
          expirationMonth: `1`,
          creditCardExpirationDate: `${this.calendarService
            .getMoment()
            .startOf("year")
            .format("YYYY-MM-DD")}`,
        } as any;
        if (this.expenseTypes && this.expenseTypes.length) {
          combineInfo.expenseType = this.expenseTypes[0].Name;
        }
        combineInfo.credentialsRequested = false;
        combineInfo.creditCardPersionInfo = {} as any;
        combineInfo.credential = bookInfo.credential;
        combineInfo.id = bookInfo.id;
        combineInfo.bookInfo = bookInfo;
        combineInfo.vmCredential = bookInfo.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.credentials = combineInfo.credentials.filter(
          (c) => c.Type != CredentialsType.IdCard
        );
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
    this.initCheckingInPersonInfos();
    this.hotelService.setBookInfos(
      this.hotelService.getBookInfos().filter((it) => !!it.bookInfo)
    );
  }
  onShowFeesDetails() {
    this.isShowFee = !this.isShowFee;
    this.serviceFee = this.showServiceFees();
    this.initDayPrice();
  }
  private initDayPrice() {
    const bookInfos = this.hotelService.getBookInfos();
    this.curSelectedBookInfo = bookInfos[0];
    this.dates = [];
    const n = this.calcNights(this.combindInfos && this.combindInfos[0]);
    // debugger
    for (let i = 0; i < n; i++) {
      this.dates.push({
        date: moment(this.curSelectedBookInfo.bookInfo.roomPlan.BeginDate)
          .add(i, "days")
          .format("YYYY-MM-DD"),
        price: `${this.hotelService.getAvgPrice(
          this.curSelectedBookInfo.bookInfo.roomPlan
        )}`,
      });
    }
    console.log(this.dates, "ddddd");
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
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
      Object.keys(this.initialBookDto.ServiceFees).forEach((k) => {
        totalFee = AppHelper.add(+this.initialBookDto.ServiceFees[k], totalFee);
      });
    }
    return !(this.tmc && this.tmc.IsShowServiceFee) || totalFee == 0;
  }
  showServiceFees() {
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
    return fees;
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
  async searchOrganization(combindInfo: IPassengerHotelBookInfo) {
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
  async searchCostCenter(combindInfo: IPassengerHotelBookInfo) {
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
  private checkCredentialValidate(combineInfo: IPassengerHotelBookInfo) {
    return (
      combineInfo.credential &&
      (combineInfo.credential.Type == CredentialsType.HmPass ||
        combineInfo.credential.Type == CredentialsType.Passport)
    );
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
    // if (this.combindInfos) {
    //   const c = this.combindInfos.find(it => !it.arrivalHotelTime);
    //   if (c) {
    //     AppHelper.alert("请选择到店时间");
    //     const ele = document.querySelector(
    //       `app-inter-room-show-item[dataid='${c.id}']`
    //     );
    //     this.scrollEleToView(ele);
    //     return;
    //   }
    // }
    this.combindInfos = this.fillGroupConbindInfoApprovalInfo(
      this.combindInfos
    );
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = this.fillBookPassengers(bookDto);
    if (canBook && canBook2) {
      // 弹框
      const popover = await this.popoverCtrl.create({
        component: InterHotelWarrantyComponent,
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
          // AppHelper.alert(
          //   this.LangService.isCn ? "订单已保存!" : "Order saved"
          // );
          this.isSubmitDisabled = true;
          this.isPlaceOrderOk = true;
          if (!isSave) {
            let checkPayResult = false;
            if (res.IsCheckPay) {
              this.isCheckingPay = true;
              checkPayResult = await this.checkPay(res.TradeNo);
              this.isCheckingPay = false;
            }
            if (checkPayResult) {
              if (res.HasTasks) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                  true
                );
              } else {
                // await this.tmcService.payOrder(res.TradeNo);
                const isp =
                  this.orderTravelPayType == OrderTravelPayType.Person ||
                  this.orderTravelPayType == OrderTravelPayType.Credit;
                await this.orderService.payOrder(
                  res.TradeNo,
                  null,
                  false,
                  isp ? this.tmcService.getQuickexpressPayWay() : []
                );
              }
            } else {
              await AppHelper.alert(
                LanguageHelper.Order.getBookTicketWaitingTip(res.IsCheckPay),
                true
              );
            }
          } else {
            if (isSave) {
              await AppHelper.alert(
                this.langService.isCn ? "订单已保存!" : "Order saved",
                true,
                LanguageHelper.getConfirmTip()
              );
            } else {
              await AppHelper.alert(
                this.langService.isCn ? "下单成功!" : "Checkout success"
              );
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
    if (this.langService.isCn) {
      this.router.navigate(["order-list"], {
        queryParams: { tabId: tab },
      });
    } else {
      this.router.navigate(["order-list_en"], {
        queryParams: { tabId: tab },
      });
    }
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
            if (this.checkPayCount <= 0) {
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
    const result = await this.tmcService.getTravelUrls(args, 'Hotel');
    if (result) {
      this.combindInfos.forEach((item) =>
        item.tmcOutNumberInfos.forEach((info) => {
          if (info.label.toLowerCase() == "staffnumber") {
            info.value = info.staffNumber;
          }
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
  onSelectDatetime(datetime: IonSelect, item: IPassengerHotelBookInfo) {
    this.initArrivalTimes(item);
    datetime.open();
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
      const isSelf = await this.staffService.isSelfBookType();
      item.credentials = item.credentials.filter(
        (it) => !!it.Number && it.Type != CredentialsType.IdCard
      );
      item.isCanEditCrendentails =
        isSelf &&
        !item.credentials.find(
          (it) =>
            it.Type == CredentialsType.Passport ||
            it.Type == CredentialsType.HmPass
        );
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
  onOpenSelect(select: IonSelect) {
    if (select) {
      select.open();
    }
  }
  expanseCompareFn(t1: string, t2: string) {
    return t1 && t2 ? t1 === t2 : false;
  }
  getCredentialTypeName(item: IPassengerHotelBookInfo) {
    switch (
    item &&
    item.creditCardPersionInfo &&
    item.creditCardPersionInfo.credentialType
    ) {
      case `${CredentialsType.IdCard}`:
        return "身份证";
      case `${CredentialsType.Passport}`:
        return "护照";
      default:
        return "其他";
    }
  }
  getHHmm(datetime: string) {
    if (datetime) {
      return this.calendarService.getHHmm(datetime);
    }
  }
  private initArrivalTimes(item: IPassengerHotelBookInfo) {
    const bookInfo = item && item.bookInfo;
    if (
      bookInfo &&
      bookInfo.bookInfo &&
      bookInfo.bookInfo.roomPlan &&
      bookInfo.bookInfo.roomPlan.BeginDate
    ) {
      this.arrivalDateTimes = [];
      const dt = moment(bookInfo.bookInfo.roomPlan.BeginDate)
        .startOf("date")
        .add(12, "hours");
      const edt = dt.clone().add(18, "hours");
      const n = edt.diff(dt, "minutes") / 30;
      for (let i = 0; i <= n; i++) {
        this.arrivalDateTimes.push(
          dt
            .clone()
            .add(i * 30, "minutes")
            .format("YYYY-MM-DD HH:mm")
        );
      }
    }
  }
  async onSelectIllegalReason(item: IPassengerHotelBookInfo) {
    if (item.isOtherIllegalReason) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: SelectComponent,
      cssClass: "vw-70",
      componentProps: {
        label: "超标原因",
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
  getCreditCardInfoName(item: IPassengerHotelBookInfo) {
    switch (item && item.creditCardInfo && item.creditCardInfo.creditCardType) {
      case "VI":
        return "VISA";
      case "AX":
        return "美国运通卡";
      case "CA":
        return "万事达卡";
      case "JC":
        return "JCB";
      case "DC":
        return "大来卡";
      default:
        return "";
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
    return this.hotelService.getRoomRateRuleMessage(roomPlan);
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
  checkInPersonInfos: {
    lastName: string;
    firstName: string;
    isMain: boolean;
    isChild?: boolean;
  }[];
  creditCardInfo: {
    isShowCreditCard: boolean;
    creditCardType: string;
    creditCardNumber: string;
    cardCredentialsMobile: string;
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
  isShowOtherInfo: boolean;
  isShowTravelDetail: boolean;
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
  bookInfo: PassengerBookInfo<IInterHotelInfo>;
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
  expenseType: string;
}
