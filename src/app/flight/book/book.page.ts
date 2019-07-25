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
import { MemberCredential } from "./../../member/member.service";
import {
  StaffService,
  StaffEntity,
  StaffBookType,
  CostCenterEntity,
  OrganizationEntity,
  StaffApprover
} from "./../../hr/staff.service";
import {
  PassengerFlightSegments,
  PassengerFlightSelectedInfo,
  TripType
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
import { DayModel } from "../models/DayModel";
import { LanguageHelper } from "src/app/languageHelper";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { InsuranceResultEntity } from "../models/Insurance/InsuranceResultEntity";
import { Observable, of, Subject, BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";
import { TaskType } from "../models/TaskType";
import { SelectTravelNumberPopoverComponent } from "../components/select-travel-number-popover/select-travel-number-popover.component";
import {
  OrderTravelType,
  OrderTravelPayType
} from "../models/OrderTravelEntity";
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
interface CombineedSelectedInfo {
  vmModal: PassengerFlightSegments;
  modal: PassengerFlightSegments;
  openrules: boolean; // 打开退改签规则
  vmCredential: MemberCredential;
  credentials: MemberCredential[];
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
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
  travelType: string; // 因公、因私
  orderTravelPayType: string; // OrderTravelPayType
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
  orderTravelPayType = OrderTravelPayType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  totalPriceSource: Subject<number>;
  insuranceResult: InsuranceResultEntity;
  passengerSegments: CombineedSelectedInfo[] = [];
  bookTypeSelfCredentials: MemberCredential[] = [];
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
  passengerCredentials: { [accountId: string]: MemberCredential[] } = [] as any;
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
  private initOrderTravelPayTypes() {
    this.orderTravelPayTypes = [];
    const langs = {
      [OrderTravelPayType.Company]: "公付",
      [OrderTravelPayType.Person]: "个付",
      [OrderTravelPayType.Credit]: "信用付",
      [OrderTravelPayType.Balance]: "余额付"
    };
    Object.keys(OrderTravelPayType).map(k => {
      if (typeof k === "number") {
        this.orderTravelPayTypes.push({
          label: langs[k],
          value: k
        });
      }
    });
    console.log("orderTravelPayTypes", this.orderTravelPayTypes);
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
      this.initOrderTravelPayTypes();
      this.errors = "";
      await this.getTmc();
      this.travelForm = await this.tmcService.getTravelFrom().catch(_ => null);
      this.insuranceResult = await this.tmcService.getFlightInsurance();
      this.illegalReasons = await this.tmcService.getIllegalReasons();
      await this.initSelfBookTypeCredentials(); // 如果是个人，获取个人是证件信息
      this.credentialStaffs = await this.getCredentialsStaffs().catch(_ => []);
      this.passengerCredentials = await this.getPassengerCredentials().catch(
        _ => ({})
      ); // 乘客证件列表
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
      await this.initPassengerSegments();
      await this.initTmcOutNumberInfos();
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
    return !!Tmc.FlightOrderPayType.split(",").find(
      it => it == OrderTravelPayType[payType]
    );
  }
  private async initTmcOutNumberInfos() {
    const args: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[] = [];
    this.passengerSegments.forEach(item => {
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
      this.passengerSegments.forEach(item =>
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
  onShowFriendlyReminder(item: CombineedSelectedInfo) {
    item.showFriendlyReminder = !item.showFriendlyReminder;
  }
  async onSelectTravelNumber(
    arg: TmcOutNumberInfo,
    item: CombineedSelectedInfo
  ) {
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
  openrules(item: CombineedSelectedInfo) {
    console.log("CombineedSelectedInfo", item);
    item.openrules = !item.openrules;
  }
  /**
   * 获取所选乘客的员工信息
   */
  private async getCredentialsStaffs() {
    const accountIds = this.flightService
      .getPassengerFlightSegments()
      // 非白名单
      .filter(item => item.passenger.AccountId != "0")
      .map(item => item.passenger.AccountId);
    this.credentialStaffs = await this.flightService.getCredentialStaffs(
      accountIds
    );
    return this.credentialStaffs;
  }
  private async getTmc() {
    this.tmc = await this.tmcService.getTmc();
    console.log("tmc", this.tmc);
  }
  async searchCostCenter(item: CombineedSelectedInfo) {
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
  async searchOrganization(item: CombineedSelectedInfo) {
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
    if (this.passengerSegments) {
      const totalPrice = this.passengerSegments.reduce((arr, item) => {
        arr += item.modal.selectedInfo.reduce((sum, info) => {
          if (info && info.flightPolicy && info.flightPolicy.Cabin) {
            sum +=
              +info.flightPolicy.Cabin.SalesPrice +
              +info.flightPolicy.Cabin.Tax;
          }
          return sum;
        }, 0);
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
    const day = this.flydayService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTip(info: PassengerFlightSelectedInfo) {
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
    }]`;
  }
  back() {
    this.natCtrl.back();
  }
  private async getCredentialStaffsSettingAppoval(
    credentialStaffIds: string[]
  ) {
    return this.tmcService.getSettingAppovalStaffs(credentialStaffIds);
  }
  async openApproverModal(item: CombineedSelectedInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      const [name, emmail, mobile] = res.Text.split("|");
      item.appovalStaff.AccountId = item.appovalStaff.Account.Id = res.Value;
      item.appovalStaff.Email = item.appovalStaff.Account.Email = emmail;
      item.appovalStaff.Mobile = item.appovalStaff.Account.Mobile = mobile;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
    }
  }
  bookTypeNotSelf() {
    return this.selfStaff && this.selfStaff.BookType != StaffBookType.Self;
  }
  compareFn(t1: MemberCredential, t2: MemberCredential) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  private async initSelfBookTypeCredentials() {
    if (await this.staffService.isStaffTypeSelf()) {
      const identity = await this.identityService.getIdentityAsync();
      this.bookTypeSelfCredentials = await this.staffService.getStaffCredentials(
        identity && identity.Id
      );
      let credential: MemberCredential;
      if (this.bookTypeSelfCredentials.length) {
        credential = this.bookTypeSelfCredentials[0];
      }
      this.passengerSegments = this.passengerSegments.map(item => {
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
  private async initPassengerSegments() {
    try {
      const pfs = this.flightService.getPassengerFlightSegments();
      for (let i = 0; i < pfs.length; i++) {
        const item = pfs[i];
        const cstaff = this.credentialStaffs.find(
          it => it.Account.Id == item.passenger.AccountId
        );

        const credentials = this.passengerCredentials[item.passenger.AccountId];
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
          (!credentials ||
            !credentials.find(
              it =>
                it.Number == item.credential.Number &&
                it.Type == item.credential.Type
            ))
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
        const combineInfo: CombineedSelectedInfo = {
          vmCredential: item.credential,
          credentials: credentials || [],
          openrules: false,
          credentialStaff: cstaff,
          isOtherIllegalReason: false,
          showFriendlyReminder: false,
          isOtherOrganization: false,
          insuranceResultProducts: insuranceResultProducts.slice(0, 1),
          credentialStaffMobiles:
            cstaff && cstaff.Account && cstaff.Account.Mobile
              ? cstaff.Account.Mobile.split(",").map((mobile, i) => {
                  return {
                    checked: i == 0,
                    mobile
                  };
                })
              : [],
          credentialStaffEmails:
            cstaff && cstaff.Account && cstaff.Account.Email
              ? cstaff.Account.Email.split(",").map((email, i) => {
                  return {
                    checked: i == 0,
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
        } as CombineedSelectedInfo;
        combineInfo.addContacts = [];
        this.passengerSegments.push(combineInfo);
      }
      if (!this.passengerSegments || this.passengerSegments.length == 0) {
        this.passengerSegments = await this.storage.get(
          "Flight-Book-Page-Mock-Data"
        );
      } else {
        await this.storage.set(
          "Flight-Book-Page-Mock-Data",
          this.passengerSegments
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
  async onAddContacts(item: CombineedSelectedInfo) {
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
            man.name=data.Text;
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
        .getPassengerFlightSegments()
        .map(item => item.passenger.AccountId)
        .filter(id => id != "0")
    );
  }
  isShowApprove(item: CombineedSelectedInfo) {
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
      item.modal.selectedInfo.some(it => it.flightPolicy.Rules.length > 0)
    ) {
      return true;
    }
    return false;
  }
  isAllowSelectApprove(info: CombineedSelectedInfo) {
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
      info.modal.selectedInfo.some(
        item =>
          item.flightPolicy &&
          item.flightPolicy.Rules &&
          item.flightPolicy.Rules.length > 0
      )
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.modal.selectedInfo.some(
        item =>
          item.flightPolicy &&
          item.flightPolicy.Rules &&
          item.flightPolicy.Rules.length > 0
      )
    ) {
      return true;
    }
    return false;
  }
}
