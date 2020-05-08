import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from "@angular/core";
import { ModalController, IonContent, Platform } from "@ionic/angular";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { OrganizationEntity, CostCenterEntity } from "src/app/hr/staff.service";
import { Subscription, fromEvent } from "rxjs";
import {
  TravelFormEntity,
  TmcService,
  TmcEntity,
} from "src/app/tmc/tmc.service";
import {
  SearchModel,
  TravelService,
  TravelFormTripEntity,
  TmcTravelApprovalType,
} from "../travel.service";
import { SelectCostcenter } from "../components/select-costcenter/select-costcenter";
import { AppHelper } from "src/app/appHelper";
import { Router, ActivatedRoute } from "@angular/router";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import {
  ValidatorService,
  ValidateInfo,
} from "src/app/services/validator/validator.service";
import { log } from "util";

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
  TravelApprovalType = TmcTravelApprovalType;
  @ViewChild(IonContent, { static: true }) contnt: IonContent;
  private subscription = Subscription.EMPTY;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  appovalStaff: string;
  outNumbers: {
    [key: string]: any;
  };
  tmc: TmcEntity;
  constructor(
    private travelService: TravelService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private service: TravelService,
    private router: Router,
    private plt: Platform,
    private tmcService: TmcService,
    private validatorService: ValidatorService
  ) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  private initValidateRule() {
    const Rules = [
      {
        IsRange: false,
        Message: "",
        Options: "",
        Pattern: "^([sS]{1,20})$",
      },
    ];
    const info: ValidateInfo = {
      name: "travelapplication",
      saveType: "add",
      rule: [
        {
          Message: "请输入出差事由",
          Name: "Subject",
          Rules,
        },
      ],
    };
    this.validatorService.add(info);
  }
  ngAfterViewInit() {
    setTimeout(async () => {
      const inputs = this.contnt["el"].querySelectorAll(`[validatename]`);
      for (let i = 0; i < inputs.length; i++) {
        const el: HTMLElement = inputs.item(i) as any;
        const input = el.querySelector("input");
        if (input) {
          input.setAttribute("ValidateName", el.getAttribute("ValidateName"));
          await this.validatorService.initialize(
            "travelapplication",
            "add",
            el
          );
        }
      }
    }, 200);
  }
  ngOnInit() {
    this.outNumbers = {};
    this.travelService.getStaff().then((s) => {
      console.log(this.searchModel.TravelForm, "eeeee");
      if (this.searchModel && this.searchModel.TravelForm) {
        this.searchModel.TravelForm.CostCenterName =
          this.searchModel.TravelForm.CostCenterName || s.CostCenter.Name;
        this.searchModel.TravelForm.CostCenterCode =
          this.searchModel.TravelForm.CostCenterCode || s.CostCenter.Code;
        if (!this.searchModel.TravelForm.Organization) {
          this.searchModel.TravelForm.Organization = {} as any;
        }
        this.searchModel.TravelForm.Organization.Code =
          this.searchModel.TravelForm.Organization.Code || s.Organization.Code;
        this.searchModel.TravelForm.Organization.Name =
          this.searchModel.TravelForm.Organization.Name || s.Organization.Name;
        this.searchModel.TravelForm.Organization.Id =
          this.searchModel.TravelForm.Organization.Id || s.Organization.Id;
      }
    });
    if (this.searchModel) {
    }
    this.tmcService.getTmc().then((tmc) => {
      this.tmc = tmc;
      if (this.tmc.OutNumberNameArray) {
        for (const n of this.tmc.OutNumberNameArray) {
          // debugger
          this.outNumbers[n] = "";
        }
      }
    });
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
        if (
          this.searchModel &&
          this.searchModel.TravelForm &&
          this.searchModel.TravelForm.Account
        ) {
          this.searchModel.AccountId = this.searchModel.TravelForm.Account.Id;
          this.appovalStaff = this.searchModel.TravelForm.Account.RealName;
        }
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
  private processOutNumbers() {
    if (this.searchModel) {
      if (this.outNumbers && Object.keys(this.outNumbers)) {
        if (this.searchModel.TravelForm) {
          const n = { NumberList: [] };
          Object.keys(this.outNumbers).forEach((k) => {
            n.NumberList.push({
              Name: k,
              Code: this.outNumbers[k],
            });
          });
          this.searchModel.OutNumbers = n.NumberList;
          this.searchModel.TravelForm.Variables = JSON.stringify(n);
          this.searchModel.TravelForm.Numbers = this.searchModel.OutNumbers;
        }
      }
    }
  }
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
        reqMethod: `TmcApiTravelUrl-Home-GetStaffs`,
      },
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      this.appovalStaff = result.data.Text;
      this.searchModel.AccountId = result.data.Value;
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
  private getEleByAttr(attrName: string, value: string) {
    return (
      this.contnt["el"] &&
      (this.contnt["el"].querySelector(
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
      if (this.contnt) {
        this.contnt.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
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
  async onSubmit() {
    if (this.searchModel.TravelForm) {
      if (!this.searchModel.TravelForm.Organization) {
        const el = this.getEleByAttr("organization", "organization");
        this.moveRequiredEleToViewPort(el);
        AppHelper.toast("请选择所属部门");
        return;
      }
      if (!this.searchModel.TravelForm.Subject) {
        const el = this.getEleByAttr("Subject", "Subject");
        this.moveRequiredEleToViewPort(el);
        AppHelper.toast("请输入出差事由");
        return;
      }

      if (!this.searchModel.TravelForm.TripType) {
        const el = this.getEleByAttr("tripType", "tripType");
        this.moveRequiredEleToViewPort(el);
        AppHelper.toast("请选择出差类别");
        return;
      }
      if (this.searchModel.TravelForm.Trips) {
        for (
          let index = 0;
          index < this.searchModel.TravelForm.Trips.length;
          index++
        ) {
          if (
            !this.searchModel.TravelForm.Trips[index].TravelTool ||
            !this.searchModel.TravelForm.Trips[index].FromCityName ||
            !this.searchModel.TravelForm.Trips[index].ToCityName ||
            !this.searchModel.TravelForm.Trips[index].StartDate ||
            !this.searchModel.TravelForm.Trips[index].EndDate
          ) {
            const el = this.getEleByAttr("addStroke", `${index}`);
            this.moveRequiredEleToViewPort(el);
            AppHelper.toast("请输入行程");
            return;
          }
        }
      }
    }
    if (
      this.tmc &&
      this.TravelApprovalType &&
      this.tmc.TravelApprovalType == this.TravelApprovalType.Free
    ) {
      if (!this.appovalStaff) {
        const el = this.getEleByAttr("accountId", "accountId");
        this.moveRequiredEleToViewPort(el);
        AppHelper.toast("请选择审批人");
        return;
      }
    }
    try {
      if (this.searchModel.TravelForm) {
        this.searchModel.Trips = this.searchModel.TravelForm.Trips;
        this.searchModel.OrganizationId =
          this.searchModel.TravelForm.Organization &&
          this.searchModel.TravelForm.Organization.Id;
      }
      this.processOutNumbers();
      const r = await this.service.travelSubmit(this.searchModel);
      this.router.navigate([AppHelper.getRoutePath("business-list")], {
        queryParams: { doRefresh: true },
      });
    } catch (e) {
      AppHelper.alert(e);
    }
  }

  async onSave() {
    try {
      if (this.searchModel.TravelForm) {
        this.searchModel.Trips = this.searchModel.TravelForm.Trips;
        this.searchModel.OrganizationId =
          this.searchModel.TravelForm.Organization &&
          this.searchModel.TravelForm.Organization.Id;
      }
      this.processOutNumbers();
      const r = await this.service.getTravelSave(this.searchModel);
      this.router.navigate([AppHelper.getRoutePath("business-list")], {
        queryParams: { doRefresh: true },
      });
    } catch (e) {
      AppHelper.alert(e);
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
    let days: number = 0;
    this.searchModel &&
      this.searchModel.TravelForm &&
      this.searchModel.TravelForm.Trips &&
      this.searchModel.TravelForm.Trips.forEach((it) => {
        if (!it.StartDate || !it.EndDate) {
          return;
        }
        AppHelper.getDate(it.StartDate);
        AppHelper.getDate(it.EndDate);
        var a1 = AppHelper.getDate(it.StartDate.substr(0, 10)).getTime();
        var a2 = AppHelper.getDate(it.EndDate.substr(0, 10)).getTime();
        var day = (a2 - a1) / (1000 * 60 * 60 * 24); //核心：时间戳相减，然后除以天数
        days += day;
        return days;
      });
    days + 1;
    if (this.searchModel.TravelForm) {
      this.searchModel.TravelForm.DayCount = days;
    }
    return days;
  }
}
