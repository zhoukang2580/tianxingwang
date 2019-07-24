import { InsuranceProductEntity } from "./../../insurance/models/InsuranceProductEntity";
import { OrganizationComponent } from "./../components/organization/organization.component";
import { SearchCostcenterComponent } from "./../components/search-costcenter/search-costcenter.component";
import { FlydayService } from "./../flyday.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import { NavController, ModalController, IonCheckbox } from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType,
  IllegalReasonEntity
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

interface CombineedSelectedInfo {
  vmModal: PassengerFlightSegments;
  modal: PassengerFlightSegments;
  openrules: boolean; // 打开退改签规则
  vmCredential: MemberCredential;
  credentials: MemberCredential[];
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
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
  totalPriceSource: Subject<number>;
  insuranceResult: InsuranceResultEntity;
  passengerSegments: CombineedSelectedInfo[] = [];
  bookTypeSelfCredentials: MemberCredential[] = [];
  tmc: TmcEntity;
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
    private flydayService: FlydayService
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }

  ngOnInit() {
    this.refresh();
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
  async refresh() {
    try {
      this.errors = "";
      this.getTmc();
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
    } catch (err) {
      // this.errors = err || "please retry";
    }
  }
  onShowFriendlyReminder(item: CombineedSelectedInfo) {
    item.showFriendlyReminder = !item.showFriendlyReminder;
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
      this.passengerSegments = this.flightService
        .getPassengerFlightSegments()
        .map(item => {
          const cstaff = this.credentialStaffs.find(
            it => it.Account.Id == item.passenger.AccountId
          );
          const credentials = this.passengerCredentials[
            item.passenger.AccountId
          ];
          const arr = cstaff && cstaff.Approvers && cstaff.Approvers;
          arr.sort((a, b) => a.Tag && b.Tag && +a.Tag - +b.Tag);
          const tempObj = arr.reduce(
            (obj, it) => {
              if (obj[it.Tag]) {
                obj.approvers.push(it);
              } else {
                obj.Tag = it.Tag;
                obj.Type = it.Type;
                obj.approvers = [it];
              }
              return obj;
            },
            {} as { Tag: string; Type: TaskType; approvers: StaffApprover[] }
          );
          const credentialStaffApprovers = Object.keys(tempObj).map(key => {
            return {
              Tag: tempObj.Tag,
              Type: tempObj.Type,
              approvers: tempObj.approvers
            };
          });
          // console.log("credentials", credentials, cstaff);
          console.log("credentialStaffApprovers", credentialStaffApprovers);
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

          return {
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
            )
          } as CombineedSelectedInfo;
        });
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
