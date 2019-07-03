import { IdentityService } from "src/app/services/identity/identity.service";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { ApiService } from "./../../services/api/api.service";
import { ActivatedRoute } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { SelectedPassengersComponent } from "./../components/selected-passengers/selected-passengers.component";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  PopoverController,
  IonInfiniteScroll,
  IonRefresher
} from "@ionic/angular";
import { RequestEntity } from "src/app/services/api/Request.entity";
export interface Staff {
  Id: string; // Long Id
  TmcId: string; // Long 客户 id
  AccountId: string; // Long 帐号 id
  OrganizationId: string; // Long 所属部门 Id
  OrganizationCode: string; // String 所属部门
  OrganizationName: string; // String 所属部门
  Number: string; // String 工号
  Name: string; // String 姓名
  Nickname: string; // String 昵称
  Email: string; //String 邮箱
  Mobile: string; // String 手机号码
  ExtensionNumber: string; // String 分机号
  CcQueue: string; // Datetime 队列
  Penalty: string; // Int 优先级
  OutNumber: string; // String 外部编号
  IsVip: boolean; // 是否 Vip
  IsConfirmInfo: boolean; // 是否确认信息
  IsModifyPassword: boolean; // 是否修改密码
  CostCenterId: string; // Long 成本中心 Id
  CostCenterCode: string; // String 成本中心代码
  CostCenterName: string; // String 成本中心名称
  CredentialsInfo: string; // String 证件信息
  IsUsed: boolean; // 是否启用
  BookType: StaffBookType; // int 预订类型
  BookCodes: string; // String 预订代码
}
@Component({
  selector: "app-select-passenger",
  templateUrl: "./select-passenger.page.html",
  styleUrls: ["./select-passenger.page.scss"]
})
export class SelectPassengerPage implements OnInit {
  passengers: any[];
  keyword: string;
  staffs: Staff[];
  currentPage = 1;
  pageSize = 10;
  vmStaffs: Staff[];
  loading = false;
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  constructor(
    public popoverController: PopoverController,
    private flightService: FlightService,
    route: ActivatedRoute,
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    route.queryParamMap.subscribe(p => {
      this.passengers = this.flightService.getSelectedPassengers();
    });
  }

  ngOnInit() {}
  async onShow() {
    const popover = await this.popoverController.create({
      component: SelectedPassengersComponent,
      translucent: true,
      showBackdrop: true,
      componentProps: { passengers: this.flightService.getSelectedPassengers() }
    });
    popover.present();
  }
  doRefresh(keyword) {
    this.currentPage = 1;
    this.vmStaffs = [];
    this.keyword = keyword || "";
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.loadMore();
  }
  onSearch() {
    this.loading = true;
    this.doRefresh(this.keyword.trim());
  }
  private async loadStaffs() {
    this.loading = true;
    const identity = await this.identityService.getIdentityPromise();
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Home-Staff";
    req.Data = {
      LastUpdateTime: 0,
      TmcId: identity.Numbers.TmcId
    };
    this.staffs = await this.apiService
      .getPromiseResponse<Staff[]>(req)
      .catch(_ => []);
    this.loading = false;
    return this.staffs;
  }
  onSelect(s: Staff) {
    const p = this.flightService.getSelectedPassengers();
    p.push(s);
    this.flightService.setSelectedCutomers(p);
  }
  async loadMore() {
    if (!this.staffs||this.staffs.length===0) {
      await this.loadStaffs();
    }
    let filteredStaffs = this.staffs;
    if (this.keyword && this.keyword.trim()) {
      this.keyword = this.keyword.trim();
      filteredStaffs = this.staffs.filter(
        s =>
          s.Name.includes(this.keyword) ||
          s.Nickname.includes(this.keyword) ||
          s.Number.includes(this.keyword) ||
          s.Email.includes(this.keyword)
      );
    }
    const slice = filteredStaffs.slice(
      (this.currentPage - 1) * this.pageSize,
      this.currentPage * this.pageSize
    );
    this.vmStaffs = [...this.vmStaffs, ...slice];

    if (slice.length) {
      this.currentPage++;
    }
    if (this.ionrefresher) {
      this.ionrefresher.complete();
    }
    if (this.scroller) {
      this.scroller.disabled = slice.length === 0;
      this.scroller.complete();
    }
    this.loading = false;
  }
}
