import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild } from "@angular/core";
import { ModalController, IonContent } from "@ionic/angular";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { OrganizationEntity, CostCenterEntity } from "src/app/hr/staff.service";
import { Subscription } from "rxjs";
import { TravelFormEntity } from "src/app/tmc/tmc.service";
import {
  SearchModel,
  TravelService,
  TravelFormTripEntity,
} from "../travel.service";
import { SelectCostcenter } from "../components/select-costcenter/select-costcenter";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { SearchApprovalComponent } from 'src/app/tmc/components/search-approval/search-approval.component';
import { AccountEntity } from 'src/app/account/models/AccountEntity';
import { ValidatorService, ValidateInfo } from 'src/app/services/validator/validator.service';

@Component({
  selector: "app-add-apply",
  templateUrl: "./add-apply.page.html",
  styleUrls: ["./add-apply.page.scss"],
})
export class AddApplyPage implements OnInit, OnDestroy, AfterViewInit {
  // organization: string;
  // organizationId: string;
  // costCenterName: string;
  // costCenterCode: string;
  // organizationCode: string;
  // customerName: string;
  @ViewChild(IonContent, { static: true }) contnt: IonContent;
  private subscription = Subscription.EMPTY;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  appovalStaff: string;
  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private service: TravelService,
    private router: Router,
    private validatorService: ValidatorService
  ) { }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private initValidateRule() {
    const Rules = [{
      IsRange: false,
      Message: "",
      Options: "",
      Pattern: "^([\s\S]{1,20})$"
    }]
    const info: ValidateInfo = {
      name: "travelapplication", saveType: 'add', rule: [
        {
          Message: "请输入出差事由",
          Name: "Subject",
          Rules
        }
      ]
    }
    this.validatorService.add(info)
  }
  ngAfterViewInit() {
    setTimeout(async () => {
      const inputs = this.contnt['el'].querySelectorAll(`[validatename]`);
      for (let i = 0; i < inputs.length; i++) {
        const el: HTMLElement = inputs.item(i) as any;
        const input = el.querySelector("input");
        if (input) {
          input.setAttribute("ValidateName", el.getAttribute("ValidateName"));
          await this.validatorService.initialize('travelapplication', 'add', el);
        }
      }
    }, 200);
  }
  ngOnInit() {
    this.initValidateRule();
    this.searchModel = {} as any;
    this.searchModel.TravelForm = {} as any;
    this.searchModel.TravelForm.Trips = [];
    this.searchModel.PageIndex = 0;
    this.searchModel.PageSize = 20;
    const item: TravelFormTripEntity = {} as any;
    // item.StartDate
    this.route.queryParamMap.subscribe((q) => {
      if (q.get("data")) {
        this.searchModel = JSON.parse(q.get("data"));
      }
    });
    setTimeout(() => {
      if (
        this.searchModel.TravelForm.Trips &&
        !this.searchModel.TravelForm.Trips.length
      ) {
        this.searchModel.TravelForm.Trips.push(item);
      }
    }, 0);
  }
  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  async onSelectOrg() {
    const m = await this.modalCtrl.create({ component: OrganizationComponent });
    m.present();
    const data = await m.onDidDismiss();
    const org = data && (data.data as OrganizationEntity);
    if (org) {
      this.searchModel.OrganizationId = org.Id;
      this.searchModel.TravelForm = {
        ...this.searchModel.TravelForm,
        Organization: {
          Code: org.Code,
          Id: org.Id,
          Name: org.Name,
        } as OrganizationEntity,
      } as any;
    }
  }
  async openApproverModal() {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent,
      componentProps: {
        reqMethod: `TmcApiTravelUrl-Home-GetStaffs`
      }
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      this.appovalStaff = result.data.Text;

    }
  }
  async onSelectCostCenter() {
    const m = await this.modalCtrl.create({ component: SelectCostcenter });
    m.present();
    const data = await m.onDidDismiss();
    const org = data && (data.data as CostCenterEntity);
    if (org) {
      // this.costCenterName = org.Name;
      // this.costCenterCode = org.Code;

      this.searchModel.TravelForm = {
        ...this.searchModel.TravelForm,
        Id: org.Id,
        CostCenterName: org.Name,
        CostCenterCode: org.Code,
      } as any;
    }
  }
  async onSubmit() {
    if (this.appovalStaff) {
      try {
        if (this.searchModel.TravelForm) {
          this.searchModel.Trips = this.searchModel.TravelForm.Trips;
          this.searchModel.OrganizationId =
            this.searchModel.TravelForm.Organization &&
            this.searchModel.TravelForm.Organization.Id;
          if (!this.searchModel.TravelForm.Organization.Name) {
            AppHelper.toast("请选择审批人")
          } else if (!this.searchModel.TravelForm.Subject) {
            AppHelper.toast("请选择出差事由")
          }
        }
        const r = await this.service.travelSubmit(this.searchModel);
        this.router.navigate([AppHelper.getRoutePath("business-list")], {
          queryParams: { doRefresh: true },
        });
      } catch (e) {
        AppHelper.alert(e);
      }
    } else {
      AppHelper.toast("请选择审批人")
    }
  }

  onRemoveTrip(item: TravelFormTripEntity) {
    if (item && this.searchModel.TravelForm.Trips) {
      this.searchModel.TravelForm.Trips = this.searchModel.TravelForm.Trips.filter(
        (it) => it !== item
      );
    }
  }
  onAddTrip() {
    const item: TravelFormTripEntity = {} as any;
    // item.StartDate
    this.searchModel.TravelForm.Trips.push(item);

  }
  getAllTravelDays() {
    let days:number=0;
    this.searchModel&&
    this.searchModel.TravelForm&&
    this.searchModel.TravelForm.Trips&&
    this.searchModel.TravelForm.Trips.forEach(
      it => {
        if (!it.StartDate || !it.EndDate) {
          return
        }
        AppHelper.getDate(it.StartDate);
        AppHelper.getDate(it.EndDate);
        var a1 = AppHelper.getDate(it.StartDate.substr(0,10)).getTime();
        var a2 = AppHelper.getDate(it.EndDate.substr(0,10)).getTime();
        var day = (a2 - a1) / (1000 * 60 * 60 * 24);//核心：时间戳相减，然后除以天数
        days+=day;
        return days
      })
      if(this.searchModel.TravelForm.DayCount){
        this.searchModel.TravelForm.DayCount=days
      }
      return days
    }
}
