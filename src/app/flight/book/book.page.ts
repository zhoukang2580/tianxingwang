import { AccountEntity } from "./../../tmc/models/AccountEntity";
import { OrderBookDto } from "./../../order/models/OrderBookDto";
import { AddcontactsModalComponent } from "../../tmc/components/addcontacts-modal/addcontacts-modal.component";
import { ActivatedRoute, Router } from "@angular/router";
import { InsuranceProductEntity } from "./../../insurance/models/InsuranceProductEntity";
import { OrganizationComponent } from "../../tmc/components/organization/organization.component";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import {
  NavController,
  ModalController,
  IonCheckbox,
  PopoverController,
  IonContent,
  Platform
} from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelFormEntity,
  TravelUrlInfo,
  PassengerBookInfo,
  InitialBookDtoModel
} from "./../../tmc/tmc.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import {
  StaffService,
  StaffEntity,
  StaffBookType,
  CostCenterEntity,
  OrganizationEntity,
  StaffApprover
} from "./../../hr/staff.service";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Storage } from "@ionic/storage";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import * as moment from "moment";
import { DayModel } from "../../tmc/models/DayModel";
import { LanguageHelper } from "src/app/languageHelper";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { InsuranceResultEntity } from "../../tmc/models/Insurance/InsuranceResultEntity";
import { Observable, of, Subject, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import {
  OrderTravelType,
  OrderTravelPayType
} from "../../order/models/OrderTravelEntity";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { environment } from "src/environments/environment";
import { TaskType } from "src/app/workflow/models/TaskType";
import { SearchCostcenterComponent } from "src/app/tmc/components/search-costcenter/search-costcenter.component";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { PassengerFlightSegmentInfo } from "../models/PassengerFlightInfo";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
interface TmcOutNumberInfo {
  key: string;
  label: string;
  required: boolean;
  value: string;
  staffOutNumber: string;
  isTravelNumber: boolean;
  isLoadNumber: boolean;
  staffNumber: string;
  canSelect: boolean;
  isDisabled: boolean;
  travelUrlInfos: TravelUrlInfo[];
}
export class AddContact {
  notifyLanguage: string;
  name: string;
  mobile: string;
  email: string;
  accountId: string;
}
interface ICombindInfo {
  vmModal: PassengerBookInfo;
  modal: PassengerBookInfo;
  openrules: boolean; // 打开退改签规则
  vmCredential: CredentialsEntity;
  credentials: CredentialsEntity[];
  credentialsRequested: boolean;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  isSkipApprove: boolean;
  notifyLanguage: string;
  addContacts: AddContact[];
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
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    checked: boolean;
  }[];
  tmcOutNumberInfos: TmcOutNumberInfo[];
  travelType: OrderTravelType; // 因公、因私
  orderTravelPayType: OrderTravelPayType; //
}
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
export class BookPage implements OnInit, AfterViewInit {
  initialBookDtoModel: InitialBookDtoModel;
  errors: any;
  orderTravelType = OrderTravelType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  checkPayCount = 5;
  checkPayCountIntervalTime = 3 * 1000;
  checkPayCountIntervalId: any;
  totalPriceSource: Subject<number>;
  vmCombindInfos: ICombindInfo[] = [];
  tmc: TmcEntity;
  bookDto: OrderBookDto;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[] = [];
  tmcApprovalTypeNone = TmcApprovalType.None;
  selfStaff: StaffEntity;
  identity: IdentityEntity;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChildren("illegalReasonsEle", { read: ElementRef })
  illegalReasonsEles: QueryList<ElementRef<HTMLElement>>;
  @ViewChild(IonContent) private cnt: IonContent;
  appoval: {
    Value: string;
    Text: string;
  };
  constructor(
    private storage: Storage,
    private flightService: FlightService,
    private staffService: StaffService,
    private identityService: IdentityService,
    private tmcService: TmcService,
    private natCtrl: NavController,
    private modalCtrl: ModalController,
    private flydayService: CalendarService,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private plt: Platform,
    private router: Router
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      setTimeout(() => {
        this.refresh();
      }, 200);
    });
  }
  private async initOrderTravelPayTypes() {
    this.tmc = this.tmc || (await this.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch(_ => ({} as any));
    this.orderTravelPayTypes = [
      {
        label: LanguageHelper.Flight.getCompanyPayTip(),
        value: OrderTravelPayType.Company
      },
      {
        label: LanguageHelper.Flight.getPersonPayTip(),
        value: OrderTravelPayType.Person
      },
      {
        label: LanguageHelper.Flight.getCreditPayTip(),
        value: OrderTravelPayType.Credit
      },
      {
        label: LanguageHelper.Flight.getBalancePayTip(),
        value: OrderTravelPayType.Balance
      }
    ].filter(t => this.checkOrderTravelPayType(t.value));
  }
  private async initializeBookDto() {
    this.bookDto = new OrderBookDto();
    this.bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"];
    const infos = this.flightService.getPassengerBookInfos();
    this.bookDto.Passengers = [];
    infos.forEach(item => {
      if (item.passenger) {
        const p = new PassengerDto();
        p.ClientId = item.credential.Number;
        p.FlightSegment = item.flightSegmentInfo.flightSegment;
        p.FlightCabin = item.flightSegmentInfo.flightPolicy.Cabin;
        p.Credentials = item.credential;
        const account = new AccountEntity();
        account.Id = item.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        this.bookDto.Passengers.push(p);
      }
    });
    this.initialBookDtoModel = await this.flightService.getInitializeBookDto(
      this.bookDto
    );
    return this.initialBookDtoModel;
  }
  ngAfterViewInit() {
    if (this.checkboxes) {
      this.checkboxes.changes.subscribe(cbx => {
        setTimeout(() => {
          this.calcTotalPrice();
        }, 0);
        this.checkboxes.forEach(c => {
          c.ionChange.subscribe(_ => {
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
    const one = this.travelForm.Numbers.find(n => n.Name == name);
    if (one) {
      return one.Code;
    }
    return "";
  }
  async refresh() {
    try {
      this.errors = "";
      this.initialBookDtoModel = await this.initializeBookDto();
      if (!this.initialBookDtoModel) {
        this.errors = "网络错误";
      }
      this.tmc = this.initialBookDtoModel.Tmc;
      this.travelForm = this.initialBookDtoModel.TravelFrom;
      this.illegalReasons = (this.initialBookDtoModel.IllegalReasons || []).map(
        it => {
          const item = new IllegalReasonEntity();
          item.Name = it;
          return item;
        }
      );
      await this.initSelfBookTypeCredentials(); // 如果是个人，获取个人是证件信息
      const notWhitelistCredentials = this.flightService
        .getPassengerBookInfos()
        .filter(it => it.isNotWhitelist);
      if (notWhitelistCredentials.length) {
        // 处理非白名单的人员证件信息
        console.log("notWhitelistCredentials", notWhitelistCredentials);
      }
      await this.initCombindInfos();
      await this.initTmcOutNumberInfos();
      this.initOrderTravelPayTypes();
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
      it => it == OrderTravelType[type]
    );
  }
  checkOrderTravelPayType(payType: OrderTravelPayType) {
    const Tmc = this.tmc;
    if (!Tmc || !Tmc.FlightOrderPayType) {
      return false;
    }
    return (
      !!Tmc.FlightOrderPayType.split(",").find(
        it => it == OrderTravelPayType[payType]
      ) ||
      (payType == OrderTravelPayType.Credit &&
        this.identity &&
        this.identity.Numbers &&
        !!this.identity.Numbers.AgentId)
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
    this.vmCombindInfos.forEach(item => {
      item.tmcOutNumberInfos.forEach(it => {
        if (true || it.isLoadNumber) {
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
      this.vmCombindInfos.forEach(item =>
        item.tmcOutNumberInfos.forEach(info => {
          info.travelUrlInfos = result[info.staffNumber];
          if (
            !info.value &&
            info.travelUrlInfos &&
            info.travelUrlInfos.length
          ) {
            info.value = info.travelUrlInfos[0].TravelNumber;
          }
          info.canSelect = !!(
            info.travelUrlInfos && info.travelUrlInfos.length
          ); // && info.canSelect;
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
    info: ICombindInfo
  ) {
    info.isOtherIllegalReason = reason.isOtherIllegalReason;
    info.illegalReason = reason.illegalReason;
    info.otherIllegalReason = reason.otherIllegalReason;
  }
  onShowFriendlyReminder(item: ICombindInfo) {
    item.showFriendlyReminder = !item.showFriendlyReminder;
  }
  async onSelectTravelNumber(arg: TmcOutNumberInfo, item: ICombindInfo) {
    if (
      !arg.canSelect ||
      !arg.travelUrlInfos ||
      arg.travelUrlInfos.length == 0
    ) {
      return;
    }
    console.log("on select travel number", arg);
    const p = await this.popoverCtrl.create({
      component: SelectTravelNumberComponent,
      componentProps: {
        travelInfos: arg.travelUrlInfos || []
      },
      translucent: true,
      showBackdrop: true
    });
    await p.present();
    const result = await p.onDidDismiss();
    if (result && result.data) {
      const data = result.data as TravelUrlInfo;
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
          arg.value = data.TravelNumber;
        }
      }
    }
  }
  openrules(item: ICombindInfo) {
    console.log("CombineedSelectedInfo", item);
    item.openrules = !item.openrules;
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
    // console.time("总计");
    if (this.vmCombindInfos) {
      const totalPrice = this.vmCombindInfos.reduce((arr, item) => {
        if (
          item.modal.flightSegmentInfo &&
          item.modal.flightSegmentInfo.flightPolicy
        ) {
          const info = item.modal.flightSegmentInfo;
          arr +=
            +info.flightPolicy.Cabin.SalesPrice + +info.flightPolicy.Cabin.Tax;
        }
        if (item.insuranceProducts) {
          arr += item.insuranceProducts
            .filter(it => it.checked)
            .reduce((sum, it) => {
              sum += +it.insuranceResult.Price;
              return sum;
            }, 0);
        }
        return arr;
      }, 0);
      // console.log("totalPrice ", totalPrice);
      this.totalPriceSource.next(totalPrice);
    }
    // console.timeEnd("总计");
  }
  getMothDay(flightSegment: FlightSegmentEntity) {
    const t = flightSegment && moment(flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.flydayService.generateDayModel(t);
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  getDate(s: FlightSegmentEntity) {
    if (!s) {
      return "";
    }
    const day = this.flydayService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTip(info: PassengerFlightSegmentInfo) {
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
  async bookFlight() {
    const bookDto: OrderBookDto = new OrderBookDto();
    let canBook = false;
    canBook = this.fillBookLinkmans(bookDto);
    canBook = this.fillBookPassengers(bookDto);
    if (canBook) {
      const res = await this.flightService.bookFlight(bookDto).catch(e => {
        AppHelper.alert(e);
      });
      if (res) {
        if (res.TradeNo) {
          await this.checkPay(res.TradeNo, bookDto);
        }
      }
    }
  }
  private async checkPay(tradeNo: string, bookDto: OrderBookDto) {
    let loading = false;
    this.checkPayCountIntervalId = setInterval(async () => {
      if (!loading) {
        loading = true;
        const result = await this.tmcService.checkPay(tradeNo);
        loading = false;
        this.checkPayCount--;
        if (!result) {
          if (this.checkPayCount < 0) {
            clearInterval(this.checkPayCountIntervalId);
            await AppHelper.alert(
              LanguageHelper.Order.getBookTicketWaitingTip(),
              true,
              LanguageHelper.getConfirmTip()
            );
            this.goToMyOrders(ProductItemType.plane);
          }
        } else {
          if (
            this.staffService.isSelfBookType &&
            bookDto.Passengers[0].TravelPayType == OrderTravelPayType.Person
          ) {
            const res = await this.initialPersonalPay();
            this.goToMyOrders(ProductItemType.plane);
          }
        }
      }
    }, this.checkPayCountIntervalTime);
  }
  private goToMyOrders(tab: ProductItemType) {
    this.router.navigate(["product-tabs"], {
      queryParams: { tabId: tab }
    });
  }
  private async initialPersonalPay() {
    return true;
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    bookDto.Linkmans = [];
    const showErrorMsg = (msg: string, item: ICombindInfo) => {
      AppHelper.alert(
        `联系人${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.modal.credential &&
            item.modal.credential.Number)}信息${msg}不能为空`
      );
    };
    for (let i = 0; i < this.vmCombindInfos.length; i++) {
      const item = this.vmCombindInfos[i];
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
  async onModify(item: ICombindInfo) {
    if (item.modal.isNotWhitelist) {
      return;
    }
    if (!item.credentialsRequested) {
      const res = await this.tmcService.getPassengerCredentials([
        item.modal.passenger.AccountId
      ]);
      const exist = item.credentials[0];
      const credentials = res && res[item.modal.passenger.AccountId];
      item.credentialsRequested = credentials && credentials.length > 0;
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
    }
  }
  private fillBookPassengers(bookDto: OrderBookDto) {
    const showErrorMsg = (msg: string, item: ICombindInfo) => {
      AppHelper.alert(
        `${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.modal.credential &&
            item.modal.credential.CheckFirstName +
              item.modal.credential.CheckLastName)} 【${item.modal.credential &&
          item.modal.credential.Number}】 ${msg} 信息不能为空`
      );
    };
    bookDto.Passengers = [];
    for (let i = 0; i < this.vmCombindInfos.length; i++) {
      const combindInfo = this.vmCombindInfos[i];
      if (this.isAllowSelectApprove(combindInfo) && !combindInfo.appovalStaff) {
        showErrorMsg(LanguageHelper.Flight.getApproverTip(), combindInfo);
        return;
      }
      const info = combindInfo.modal.flightSegmentInfo;
      const p = new PassengerDto();
      p.ApprovalId =
        (combindInfo.appovalStaff &&
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
        (info.flightPolicy &&
          info.flightPolicy.Rules &&
          info.flightPolicy.Rules.join(",")) ||
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
      if (combindInfo.insuranceProducts) {
        p.InsuranceProducts = [];
        for (let j = 0; j < combindInfo.insuranceProducts.length; j++) {
          const it = combindInfo.insuranceProducts[j];
          if (it.checked) {
            if (it.insuranceResult) {
              p.InsuranceProducts.push(it.insuranceResult);
            }
          }
        }
      }
      p.IllegalReason =
        (this.tmc &&
          this.tmc.IsAllowCustomReason &&
          combindInfo.otherIllegalReason) ||
        combindInfo.illegalReason ||
        "";
      if (!combindInfo.modal.isNotWhitelist) {
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason) {
          showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo
          );
          this.moveRequiredEleToViewPort(this.illegalReasonsEles.first);
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
      if (!combindInfo.orderTravelPayType) {
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo
        );
        return false;
      }
      p.Credentials.Account =
        combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
      p.Credentials.Account =
        p.Credentials.Account || combindInfo.modal.credential.Account;
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = combindInfo.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      p.FlightSegment = combindInfo.modal.flightSegmentInfo.flightSegment;
      p.FlightCabin = combindInfo.modal.flightSegmentInfo.flightPolicy.Cabin;
      bookDto.Passengers.push(p);
    }
    return true;
  }
  private moveRequiredEleToViewPort(ele: any) {
    const el: HTMLElement = ele.nativeElement || ele;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect) {
      if (this.cnt) {
        this.cnt.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
      }
    }
  }
  async openApproverModal(item: ICombindInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      const [name, emmail, mobile] = res.Text.split("|");
      item.appovalStaff =
        item.appovalStaff ||
        ({
          Account: new AccountEntity()
        } as any);
      item.appovalStaff.AccountId = item.appovalStaff.Account.Id = res.Value;
      item.appovalStaff.Email = item.appovalStaff.Account.Email = emmail;
      item.appovalStaff.Mobile = item.appovalStaff.Account.Mobile = mobile;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
    }
  }

  private async initSelfBookTypeCredentials(): Promise<CredentialsEntity[]> {
    if (await this.staffService.checkStaffTypeSelf()) {
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
      this.vmCombindInfos = this.vmCombindInfos.map(item => {
        if (!item.modal.credential || !item.modal.credential.Number) {
          item.modal.credential = credential;
        }
        item.vmModal = { ...item.modal };
        return item;
      });
    }
  }
  getServiceFee(c: CredentialsEntity) {
    return (
      this.initialBookDtoModel &&
      this.initialBookDtoModel.ServiceFees &&
      this.initialBookDtoModel.ServiceFees[c.Number]
    );
  }
  private async initCombindInfos() {
    try {
      const pfs = this.flightService.getPassengerBookInfos();
      for (let i = 0; i < pfs.length; i++) {
        const item = pfs[i];
        const cs = this.initialBookDtoModel.Staffs.find(
          it => it.Account.Id == item.passenger.AccountId
        );
        const cstaff = cs && cs.CredentialStaff;
        const credentials = [];
        const arr = cstaff && cstaff.Approvers && cstaff.Approvers;
        let credentialStaffApprovers: {
          Tag: string;
          Type: TaskType;
          approvers: StaffApprover[];
        }[];
        if (arr) {
          arr.sort((a, b) => a.Tag && b.Tag && +a.Tag - +b.Tag);
          const tempObj = arr.reduce(
            (obj, it) => {
              if (obj[it.Tag]) {
                obj[it.Tag].push(it);
              } else {
                obj[it.Tag] = [it];
              }
              return obj;
            },
            {} as { [Tag: string]: StaffApprover[] }
          );
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
          item.credential &&
          !credentials.find(
            it =>
              it.Number == item.credential.Number &&
              it.Type == item.credential.Type
          )
        ) {
          credentials.push(item.credential);
        }
        const insurances = this.initialBookDtoModel.Insurances.filter(
          product =>
            !cstaff ||
            !cstaff.Policy ||
            (+product.Price > 0 &&
              +product.Price < cstaff.Policy.FlightInsuranceAmount)
        ).map(insurance => {
          return {
            insuranceResult: insurance,
            checked: true
          };
        });
        const combineInfo: ICombindInfo = {
          vmCredential: item.credential,
          isSkipApprove: true,
          credentials: credentials || [],
          openrules: false,
          credentialStaff: cstaff,
          isOtherIllegalReason: false,
          showFriendlyReminder: false,
          isOtherOrganization: false,
          notifyLanguage: "cn",
          travelType: OrderTravelType.Person,
          orderTravelPayType: this.tmc && this.tmc.FlightPayType,
          insuranceProducts: insurances.slice(0, 1),
          credentialStaffMobiles:
            cstaff && cstaff.Account && cstaff.Account.Mobile
              ? cstaff.Account.Mobile.split(",").map((mobile, idx) => {
                  return {
                    checked: idx == 0,
                    mobile
                  };
                })
              : [],
          credentialStaffEmails:
            cstaff && cstaff.Account && cstaff.Account.Email
              ? cstaff.Account.Email.split(",").map((email, idx) => {
                  return {
                    checked: idx == 0,
                    email
                  };
                })
              : [],
          credentialStaffApprovers,
          organization: {
            Code: cstaff && cstaff.Organization && cstaff.Organization.Code,
            Name: cstaff && cstaff.Organization && cstaff.Organization.Name
          },
          costCenter: {
            code: cstaff && cstaff.CostCenter && cstaff.CostCenter.Code,
            name: cstaff && cstaff.CostCenter && cstaff.CostCenter.Name
          },
          modal: item,
          vmModal: { ...item },
          appovalStaff: cs && cs.DefaultApprover,
          tmcOutNumberInfos:
            this.tmc &&
            this.tmc.OutNumberNameArray.map(n => {
              return {
                label: n,
                key: n,
                isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
                required:
                  this.tmc &&
                  this.tmc.OutNumberRequiryNameArray.some(name => name == n),
                value: this.getTravelFormNumber(n),
                staffNumber: cstaff && cstaff.Number,
                staffOutNumber: cstaff && cstaff.OutNumber,
                isTravelNumber: n == "TravelNumber",
                canSelect: n == "TravelNumber",
                isDisabled: !!(this.travelForm && n == "TravelNumber")
              } as TmcOutNumberInfo;
            })
        } as ICombindInfo;
        combineInfo.addContacts = [];
        this.vmCombindInfos.push(combineInfo);
      }
      if (!environment.production) {
        if (!this.vmCombindInfos || this.vmCombindInfos.length == 0) {
          this.vmCombindInfos = await this.storage.get(
            "Flight-Book-Page-Mock-Data"
          );
        } else {
          await this.storage.set(
            "Flight-Book-Page-Mock-Data",
            this.vmCombindInfos
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
  bookTypeNotSelf() {
    return !this.staffService.isSelfBookType;
  }
  onSavecredential(credential: CredentialsEntity, info: ICombindInfo) {
    if (info && credential) {
      info.vmCredential = credential;
    }
  }
  onContactsChange(contacts: AddContact[], info: ICombindInfo) {
    if (info && contacts) {
      info.addContacts = contacts;
    }
  }

  isShowApprove(item: ICombindInfo) {
    const Tmc = this.tmc;
    if (
      !Tmc ||
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      Tmc.FlightApprovalType == 0
    ) {
      return false;
    }
    if (Tmc.FlightApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      item.modal.flightSegmentInfo.flightPolicy.Rules.length > 0
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
      Tmc.FlightApprovalType == 0
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
      info.modal.flightSegmentInfo &&
      info.modal.flightSegmentInfo.flightPolicy &&
      info.modal.flightSegmentInfo.flightPolicy.Rules &&
      info.modal.flightSegmentInfo.flightPolicy.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.modal.flightSegmentInfo &&
      info.modal.flightSegmentInfo.flightPolicy &&
      info.modal.flightSegmentInfo.flightPolicy.Rules &&
      info.modal.flightSegmentInfo.flightPolicy.Rules.length
    ) {
      return true;
    }
    return false;
  }
}
