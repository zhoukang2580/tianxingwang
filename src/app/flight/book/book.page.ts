import { NavController, ModalController } from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType
} from "./../../tmc/tmc.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { MemberCredential } from "./../../member/member.service";
import { StaffService, StaffEntity } from "./../../hr/staff.service";
import { PassengerFlightSegments } from "./../flight.service";
import { FlightService } from "src/app/flight/flight.service";
import { Component, OnInit } from "@angular/core";
import { Storage } from "@ionic/storage";
import { StaffBookType } from "src/app/tmc/models/StaffBookType";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchApprovalComponent } from "../components/search-approval/search-approval.component";
interface CombineedSelectedInfo extends PassengerFlightSegments {
  appovalStaff: StaffEntity;
}
@Component({
  selector: "app-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"]
})
export class BookPage implements OnInit {
  passengerSegments: CombineedSelectedInfo[] = [];
  bookTypeSelfCredentials: MemberCredential[] = [];
  tmc: TmcEntity;
  tmcApprovalTypeNone = TmcApprovalType.None;
  selfStaff: StaffEntity;
  identity: IdentityEntity;
  credentialStaffs: StaffEntity[] = [];
  private settingApprovalStaffs: StaffEntity[];
  appoval: {
    Value: string;
    Text: string;
  };
  passengerCredentials: { [accountId: string]: MemberCredential[] }[] = [];
  constructor(
    private storage: Storage,
    private flightService: FlightService,
    private staffService: StaffService,
    private identityService: IdentityService,
    private tmcService: TmcService,
    private natCtrl: NavController,
    private modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.getTmc();
    await this.initSelfBookTypeCredentials(); // 如果是个人，获取个人是证件信息
    this.credentialStaffs = await this.getCredentialsStaffs();
    this.passengerCredentials = await this.getPassengerCredentials();
    const credentialStaffIds = this.credentialStaffs.map(item => {
      if (item.Setting) {
        const json = JSON.parse(item.Setting);
        item.ApproveId = json.ApproveId;
      }
      return item.ApproveId;
    });
    this.settingApprovalStaffs = await this.getCredentialStaffsSettingAppoval(
      credentialStaffIds
    );
    await this.initPassengerSegments();
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
  back() {
    this.natCtrl.back();
  }
  private async getCredentialStaffsSettingAppoval(
    credentialStaffIds: string[]
  ) {
    return this.tmcService.getSettingAppovalStaffs(credentialStaffIds);
  }
  async openApproverModal(accountId: string) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      this.appoval = result.data;
    }
  }
  bookTypeNotSelf() {
    return this.selfStaff && this.selfStaff.BookType != StaffBookType.Self;
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
        if (!item.credential || !item.credential.Number) {
          item.credential = credential;
        }
        return item;
      });
    }
  }
  getServiceFee() {
    return 100;
  }
  private async initPassengerSegments() {
    this.passengerSegments = this.flightService
      .getPassengerFlightSegments()
      .map(item => {
        return {
          ...item,
          appovalStaff: this.settingApprovalStaffs.find(
            s => s.AccountId == item.passenger.AccountId
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
  }
  /**
   *  获取所选员工的证件列表
   */
  private async getPassengerCredentials() {
    return (this.passengerCredentials = await this.flightService.getPassengerCredentials(
      this.flightService
        .getPassengerFlightSegments()
        .map(item => item.passenger.AccountId)
        .filter(id => id != "0")
    ));
  }
  isAllowSelectApprove(accountId: string, info: PassengerFlightSegments) {
    const Tmc = this.tmc;
    const staff = this.credentialStaffs.find(
      item => item.AccountId == accountId
    );
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
      info &&
      info.selectedInfo &&
      info.selectedInfo.some(
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
      info.selectedInfo &&
      info.selectedInfo.some(
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
