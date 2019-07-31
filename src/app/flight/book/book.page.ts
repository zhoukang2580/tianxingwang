import { AccountEntity } from "./../../tmc/models/AccountEntity";
import { OrderBookDto } from "./../../order/models/OrderBookDto";
import { AddcontactsModalComponent } from "./../components/addcontacts-modal/addcontacts-modal.component";
import { ActivatedRoute } from "@angular/router";
import { InsuranceProductEntity } from "./../../insurance/models/InsuranceProductEntity";
import { OrganizationComponent } from "./../components/organization/organization.component";
import { SearchCostcenterComponent } from "./../components/search-costcenter/search-costcenter.component";
import { FlydayService } from "./../flyday.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import {
  NavController,
  ModalController,
  IonCheckbox,
  PopoverController
} from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelFormEntity,
  TravelUrlInfo
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
import {
  PassengerBookInfo,
  PassengerFlightSegmentInfo
} from "./../flight.service";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit
} from "@angular/core";
import { Storage } from "@ionic/storage";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchApprovalComponent } from "../components/search-approval/search-approval.component";
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
import { SelectTravelNumberPopoverComponent } from "../components/select-travel-number-popover/select-travel-number-popover.component";
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
import { TaskType } from 'src/app/workflow/models/TaskType';
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
class AddContact {
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
  insuranceResultProducts: {
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
    trigger("openclose", [
      state("true", style({ height: "*" })),
      state("false", style({ height: "0px" })),
      transition("false <=> true", animate(200))
    ])
  ]
})
export class BookPage implements OnInit, AfterViewInit {
  errors: any;
  orderTravelType = OrderTravelType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  totalPriceSource: Subject<number>;
  insuranceResult: InsuranceResultEntity;
  vmCombindInfos: ICombindInfo[] = [];
  tmc: TmcEntity;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[] = [];
  tmcApprovalTypeNone = TmcApprovalType.None;
  selfStaff: StaffEntity;
  identity: IdentityEntity;
  credentialStaffs: StaffEntity[] = [];
  private settingApprovalStaffs: StaffEntity[];
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  appoval: {
    Value: string;
    Text: string;
  };
  passengerCredentials: {
    [accountId: string]: CredentialsEntity[];
  } = [] as any;
  constructor(
    private storage: Storage,
    private flightService: FlightService,
    private staffService: StaffService,
    private identityService: IdentityService,
    private tmcService: TmcService,
    private natCtrl: NavController,
    private modalCtrl: ModalController,
    private flydayService: FlydayService,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.refresh();
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
      await this.getTmc();
      this.travelForm = await this.tmcService.getTravelFrom().catch(_ => null);
      this.insuranceResult = await this.tmcService.getFlightInsurance();
      this.illegalReasons = await this.tmcService.getIllegalReasons();
      await this.initSelfBookTypeCredentials(); // 如果是个人，获取个人是证件信息
      this.credentialStaffs = await this.getCredentialsStaffs().catch(_ => []);
      this.passengerCredentials = await this.getPassengerCredentials().catch(
        // 乘客证件列表
        _ => ({})
      );
      const notWhitelistCredentials = this.flightService
        .getPassengerBookInfos()
        .filter(it => it.isNotWhitelist);
      if (notWhitelistCredentials.length) {
        // 处理非白名单的人员证件信息
        console.log("notWhitelistCredentials", notWhitelistCredentials);
      }
      const credentialStaffAppoverIds = this.credentialStaffs.map(item => {
        if (item.Setting) {
          const json = JSON.parse(item.Setting);
          item.ApproveId = json.ApproveId;
        }
        return item.ApproveId;
      });
      this.settingApprovalStaffs = await this.getCredentialStaffsSettingAppoval(
        credentialStaffAppoverIds
      );
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
  onShowFriendlyReminder(item: ICombindInfo) {
    item.showFriendlyReminder = !item.showFriendlyReminder;
  }
  async onSelectTravelNumber(arg: TmcOutNumberInfo, item: ICombindInfo) {
    if (!arg.canSelect) {
      return;
    }
    console.log("on select travel number", arg);
    const p = await this.popoverCtrl.create({
      component: SelectTravelNumberPopoverComponent,
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
  /**
   * 获取所选乘客的员工信息
   */
  private async getCredentialsStaffs() {
    const accountIds = this.flightService
      .getPassengerBookInfos()
      // 白名单
      .filter(item => !item.passenger.isNotWhiteList)
      .map(item => item.passenger.AccountId);
    this.credentialStaffs = await this.flightService.getCredentialStaffs(
      accountIds
    );
    return this.credentialStaffs;
  }
  private async getTmc() {
    this.tmc = await this.tmcService.getTmc();
    console.log("tmc", this.tmc);
    return this.tmc;
  }
  async searchCostCenter(item: ICombindInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchCostcenterComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      item.costCenter = {
        code: res.Value,
        name: res.Text && res.Text.substring(res.Text.lastIndexOf("-") + 1)
      };
    }
  }
  async searchOrganization(item: ICombindInfo) {
    const modal = await this.modalCtrl.create({
      component: OrganizationComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    console.log("organization", result.data);
    if (result && result.data) {
      const res = result.data as OrganizationEntity;
      item.organization = {
        ...item.organization,
        Code: res.Code,
        Name: res.Name
      };
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
        if (item.insuranceResultProducts) {
          arr += item.insuranceResultProducts
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
      this.tmcService
        .bookFlight(bookDto)
        .then(res => {
          console.log("下单成功：", res);
        })
        .catch(e => {
          AppHelper.alert(e);
          return e;
        });
    }
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

      if (!combindInfo.vmCredential.Type) {
        showErrorMsg(LanguageHelper.getCredentialTypeTip(), combindInfo);
        return false;
      }
      p.Credentials.Type = combindInfo.vmCredential.Type;
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
      if (combindInfo.insuranceResultProducts) {
        p.InsuranceProducts = [];
        for (let j = 0; j < combindInfo.insuranceResultProducts.length; j++) {
          const it = combindInfo.insuranceResultProducts[j];
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
          p.OutNumbers[it.key] = it.value;
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
  private async getCredentialStaffsSettingAppoval(
    credentialStaffIds: string[]
  ) {
    return this.tmcService.getSettingAppovalStaffs(credentialStaffIds);
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
  bookTypeNotSelf() {
    return this.selfStaff && this.selfStaff.BookType != StaffBookType.Self;
  }
  compareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  private async initSelfBookTypeCredentials() {
    if (await this.staffService.checkStaffTypeSelf()) {
      const identity = await this.identityService.getIdentityAsync();
      const bookTypeSelfCredentials = await this.staffService.getStaffCredentials(
        identity && identity.Id
      );
      let credential: CredentialsEntity;
      if (bookTypeSelfCredentials.length) {
        credential = (bookTypeSelfCredentials[0] as any) as CredentialsEntity;
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
  getServiceFee() {
    return 100;
  }
  private async initCombindInfos() {
    try {
      const pfs = this.flightService.getPassengerBookInfos();
      for (let i = 0; i < pfs.length; i++) {
        const item = pfs[i];

        const cstaff = this.credentialStaffs.find(
          it => it.Account.Id == item.passenger.AccountId
        );
        const credentials =
          this.passengerCredentials[item.passenger.AccountId] || [];
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
        if (!item.credential || !item.credential.Number) {
          if (credentials && credentials.length) {
            item.credential = credentials[0];
          }
        }
        const insuranceResultProducts =
          this.insuranceResult &&
          this.insuranceResult.Products &&
          this.insuranceResult.Products.filter(
            product =>
              !cstaff ||
              !cstaff.Policy ||
              (+product.Price > 0 &&
                +product.Price < cstaff.Policy.FlightInsuranceAmount)
          ).map((insurance, i) => {
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
          insuranceResultProducts: insuranceResultProducts.slice(0, 1),
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
          appovalStaff: this.settingApprovalStaffs.find(
            s => s.Account.Id == (cstaff && cstaff.ApproveId)
          ),
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
  async onAddContacts(item: ICombindInfo) {
    if (!item.addContacts) {
      item.addContacts = [];
    }
    const m = await this.modalCtrl.create({
      component: AddcontactsModalComponent
    });
    if (m) {
      m.backdropDismiss = false;
      m.present();
      const result = await m.onDidDismiss();
      if (result && result.data) {
        const data = result.data as { Text: string; Value: string };
        if (data && data.Value) {
          if (data.Value.includes("|")) {
            const [email, mobile, accountId] = data.Value.split("|");
            const man = new AddContact();
            man.notifyLanguage = "cn";
            man.name = data.Text;
            man.email = email;
            man.mobile = mobile;
            man.accountId = accountId;
            item.addContacts.push(man);
          }
        }
      }
    }
  }
  /**
   *  获取员工的证件列表
   */
  private async getPassengerCredentials() {
    return this.flightService.getPassengerCredentials(
      this.flightService
        .getPassengerBookInfos()
        .filter(item => !item.isNotWhitelist)
        .map(item => item.passenger.AccountId)
    );
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
