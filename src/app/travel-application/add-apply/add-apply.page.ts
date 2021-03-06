import { SearchModel } from "./../travel.service";
import { TrafficlineEntity } from "./../../tmc/models/TrafficlineEntity";
import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  DoCheck,
} from "@angular/core";
import { ModalController, IonContent, Platform } from "@ionic/angular";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { OrganizationEntity, CostCenterEntity } from "src/app/hr/hr.service";
import {
  Subscription,
  fromEvent,
  of,
  Subject,
  BehaviorSubject,
  Observable,
} from "rxjs";
import {
  TravelFormEntity,
  TmcService,
  TmcEntity,
} from "src/app/tmc/tmc.service";
import * as moment from "moment";
import {
  TravelService,
  TravelFormTripEntity,
  TmcTravelApprovalType,
  ApprovalStatusType,
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
import { delay } from "rxjs/operators";
import { CalendarService } from "src/app/tmc/calendar.service";
import { TreeDataComponent } from "src/app/pages/components/tree-data/tree-data.component";
import { toLower } from "ionicons/dist/types/components/icon/utils";

@Component({
  selector: "app-add-apply",
  templateUrl: "./add-apply.page.html",
  styleUrls: ["./add-apply.page.scss"],
})
export class AddApplyPage implements OnInit, OnDestroy, AfterViewInit, DoCheck {
  // organization: string;
  // organizationId: string;
  // costCenterName: string;
  // costCenterCode: string;
  // organizationCode: string;
  // customerName: string;
  TravelApprovalType = TmcTravelApprovalType;
  @ViewChild(IonContent, { static: true }) contnt: IonContent;
  private subscription = Subscription.EMPTY;
  private regionTypes: { value: string; label: string }[] = [];
  items: TravelFormEntity[];
  searchModel: SearchModel;
  enable = true;
  waiting = false;
  domestic = false;
  international = false;
  pass = false;
  isVaild = true;
  // appovalStaff: string;
  addstatus: boolean;
  detail: SearchModel;
  outNumbers: {
    [key: string]: any;
  };
  vmRegionTypes: { value: string; label: string }[];
  vmTravelApprovalContent: string;
  outNumberNameArray: string[];
  tmc: TmcEntity;
  totalDays$: Observable<number>;
  constructor(
    private travelService: TravelService,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private service: TravelService,
    private router: Router,
    private plt: Platform,
    private tmcService: TmcService,
    private validatorService: ValidatorService
  ) {
    this.totalDays$ = of(0);
  }

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
          Message: "?????????????????????",
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
  getApprovalStaff() {
    this.travelService.getInitInfo().then((s) => {
      if (s) {
        if (this.searchModel && this.searchModel.TravelForm) {
          this.searchModel.Staff = s && s.Staff;
          this.searchModel.TravelForm.CostCenterName =
            this.searchModel.TravelForm.CostCenterName ||
            (s.Staff && s.Staff.CostCenter.Name);
          this.searchModel.TravelForm.CostCenterCode =
            this.searchModel.TravelForm.CostCenterCode ||
            (s.Staff && s.Staff.CostCenter.Code);
          if (s.ApprovalId && s.ApprovalName) {
            this.searchModel.ApprovalName = s.ApprovalName;
            this.searchModel.ApprovalId = s.ApprovalId;
          }
          if (!this.searchModel.TravelForm.Organization) {
            this.searchModel.TravelForm.Organization = {} as any;
          }
          this.searchModel.TravelForm.Organization.Code =
            this.searchModel.TravelForm.Organization.Code ||
            (s.Staff && s.Staff.Organization && s.Staff.Organization.Code);
          this.searchModel.TravelForm.Organization.Name =
            this.searchModel.TravelForm.Organization.Name ||
            (s.Staff && s.Staff.Organization && s.Staff.Organization.Name);
          this.searchModel.TravelForm.Organization.Id =
            this.searchModel.TravelForm.Organization.Id ||
            (s.Staff && s.Staff.Organization && s.Staff.Organization.Id);
        }
      }
    });
  }
  private initOutNumbers() {
    if (
      this.searchModel &&
      this.searchModel.TravelForm &&
      this.searchModel.TravelForm.Numbers
    ) {
      this.outNumbers = {};
      this.searchModel.TravelForm.Numbers.forEach((n) => {
        this.outNumbers[n.Name] = n.Code;
      });
      this.outNumberNameArray = Object.keys(this.outNumbers);
    }
  }
  private async getDetail(id: string) {
    this.addstatus = false;
    this.waiting = true;
    this.searchModel = await this.service.getTravelDetail(id).catch(() => null);
    this.initOutNumbers();
    if (this.searchModel) {
      if (this.searchModel.StatusType != ApprovalStatusType.WaiteSubmit) {
        this.enable = false;
      }
      if (this.searchModel.StatusType == ApprovalStatusType.WaiteSubmit) {
        this.waiting = true;
      }
      if (this.searchModel.StatusType == ApprovalStatusType.Pass) {
        this.pass = true;
      }
      if (this.searchModel.TravelForm) {
        if (this.searchModel.TravelForm.Variables) {
          this.searchModel.TravelForm.VariablesJsonObj = JSON.parse(
            this.searchModel.TravelForm.Variables
          );
        } else {
          this.searchModel.TravelForm.VariablesJsonObj = {};
        }
        this.searchModel.ApprovalName =
          this.searchModel.TravelForm.VariablesJsonObj.ApprovalName ||
          this.searchModel.TravelForm.ApprovalName;
        this.searchModel.ApprovalId =
          this.searchModel.TravelForm.VariablesJsonObj.ApprovalId ||
          this.searchModel.TravelForm.ApprovalId;
      }
      if (this.searchModel.TravelForm && this.searchModel.TravelForm.Trips) {
        this.searchModel.TravelForm.Trips = this.searchModel.TravelForm.Trips.map(
          (t) => {
            if (t.TravelTool) {
              t.travelTools = t.TravelTool.split(",");
            }
            t.ToCities = [];
            t.ToCityArrive = [];
            if (t.IsBackway) {
              t.ToCities.push({
                IsShow: t.IsBackway,
              } as TrafficlineEntity);
            }

            if (t.ToCityCode && t.ToCityName) {
              const codes = t.ToCityCode.split(",");
              const names = t.ToCityName.split(",");
              for (let i = 0; i < codes.length; i++) {
                t.ToCities.push({
                  Code: codes[i],
                  Name: names[i],
                } as TrafficlineEntity);
              }
              t.toCityNames =
                t.ToCities &&
                t.ToCities.map((it) => it.Name)
                  .filter((it) => it && it.length > 0)
                  .join(" ?? ");
            }
            if (t.CheckInCityCode && t.CheckInCityName) {
              const code = t.CheckInCityCode.split(",");
              const name = t.CheckInCityName.split(",");
              for (let i = 0; i < code.length; i++) {
                t.ToCityArrive.push({
                  Code: code[i],
                  Name: name[i],
                } as TrafficlineEntity);
              }
              t.toCityInName =
                t.ToCityArrive &&
                t.ToCityArrive.map((it) => it.Name)
                  .filter((it) => it && it.length > 0)
                  .join(" ?? ");
            }
            return t;
          }
        );
      }
    }
  }

  ngOnInit() {
    console.log();
    this.addstatus = true;
    this.outNumbers = {};
    if (this.searchModel) {
    }
    this.tmcService.getTmc().then((tmc) => {
      this.tmc = tmc;
      const obj =
        this.searchModel.OutNumbers &&
        this.searchModel.OutNumbers.reduce(
          (acc, it) => ({ ...acc, [it.Name]: it.Code }),
          {}
        );
      if (this.tmc.OutNumberNameArray) {
        for (const n of this.tmc.OutNumberNameArray) {
          this.outNumbers[n] = (this.searchModel.OutNumbers && obj[n]) || "";
          console.log(this.outNumbers[n], "this.outNumbers[n]");
        }
      }
      if (this.tmc && this.tmc.RegionTypeValue) {
        this.regionTypes = [];
        const names =
          (this.tmc.RegionTypeName && this.tmc.RegionTypeName.split(",")) || [];
        this.tmc.RegionTypeValue.split(",").forEach((v, idx) => {
          this.regionTypes.push({ value: v, label: names[idx] });
        });
        this.regionTypes = this.regionTypes.filter((t) =>
          this.tmc.RegionTypeValue.match(new RegExp(t.value, "i"))
        );
        this.vmRegionTypes = this.regionTypes.slice(0);
        let t = this.tmc.TravelApprovalContent || "";
        if (t) {
          if (t.toLowerCase().includes("international")) {
            this.international = true;
          }
          if (
            t.toLowerCase().includes("flight") ||
            t.toLowerCase().includes("hotel") ||
            t.toLowerCase().includes("train") ||
            t.toLowerCase().includes("car")
          ) {
            this.domestic = true;
          }
        }
        this.vmTravelApprovalContent = this.tmc.TravelApprovalContent;
      }
    });
    this.initValidateRule();
    this.searchModel = {} as any;
    this.searchModel.TravelForm = {} as any;
    this.searchModel.TravelForm.Trips = [];
    this.searchModel.PageIndex = 0;
    this.searchModel.PageSize = 20;
    const item: TravelFormTripEntity = {} as any;
    this.route.queryParamMap.subscribe(async (q) => {
      if (q.get("id")) {
        this.getDetail(q.get("id"));
      } else {
        if (!this.tmc) {
          this.tmc = await this.tmcService.getTmc();
          if (this.tmc) {
            this.outNumberNameArray = this.tmc.OutNumberNameArray;
          }
        }
        this.onAddTrip();
        this.waiting = true;
        this.getApprovalStaff();
      }
    });
  }

  compareWithFn = (o1, o2) => {
    return o1 == o2;
  };
  private processOutNumbers() {
    // debugger
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
    if (!this.enable) {
      return;
    }
    const m = await this.modalCtrl.create({
      component: TreeDataComponent,
      componentProps: {
        rootDeptName: "??????",
        reqMethod: "TmcApiTravelUrl-Home-GetOrganizations",
      },
    });
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
    if (!this.enable) {
      return;
    }
    if (this.tmc) {
      // ???????????????
      if (this.tmc.TravelApprovalType == TmcTravelApprovalType.Approver) {
        return;
      }
    }
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
      this.searchModel.ApprovalName = result.data.Text;
      this.searchModel.ApprovalId = result.data.Value;
    }
  }
  async onSelectCostCenter() {
    if (!this.enable) {
      return;
    }
    const m = await this.modalCtrl.create({ component: SelectCostcenter });
    m.present();
    const data = await m.onDidDismiss();
    const org = data && (data.data as CostCenterEntity);
    if (org) {
      // this.costCenterName = org.Name;
      // this.costCenterCode = org.Code;
      this.searchModel.TravelForm = {
        ...this.searchModel.TravelForm,
        // Id: org.Id,
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
    try {
      if (this.searchModel.TravelForm) {
        if (!this.searchModel.TravelForm.Organization) {
          const el = this.getEleByAttr("organization", "organization");
          this.moveRequiredEleToViewPort(el);
          AppHelper.alert("?????????????????????");
          return;
        }
        if (!this.searchModel.TravelForm.CustomerName) {
          const el = this.getEleByAttr("CustomerName", "CustomerName");
          this.moveRequiredEleToViewPort(el);
          AppHelper.alert("????????????????????????");
          return;
        }
        if (!this.searchModel.TravelForm.Subject) {
          const el = this.getEleByAttr("Subject", "Subject");
          this.moveRequiredEleToViewPort(el);
          AppHelper.alert("?????????????????????");
          return;
        }
        if (this.searchModel.TravelForm.Trips) {
          for (
            let index = 0;
            index < this.searchModel.TravelForm.Trips.length;
            index++
          ) {
            const trip = this.searchModel.TravelForm.Trips[index];
            if (trip && trip.travelTools) {
              trip.TravelTool = trip.travelTools.join(",");
            } else if (!trip.TripType) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("?????????????????????");
              return;
            } else if (!trip.FromCityName) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("?????????????????????");
              return;
            } else if (!trip.ToCityName) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("?????????????????????");
              return;
            } else if (!trip.CheckInCityName) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("?????????????????????");
              return;
            } else if (!trip.StartDate) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("?????????????????????");
              return;
            } else if (!trip.EndDate) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("?????????????????????");
              return;
            }
            if (this.searchModel.TravelForm.Trips[index].Day <= 0) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("????????????????????????????????????????????????");
              return;
            }

            if (this.searchModel.TravelForm.Trips[index].Day > 365) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("??????????????????????????????");
              return;
            }
            if (trip.StartDate && trip.EndDate) {
              trip.StartDate = trip.StartDate.replace("T", " ").substring(
                0,
                10
              );
              trip.EndDate = trip.EndDate.replace("T", " ").substring(0, 10);
            }
            // this.searchModel.TravelForm.Trips.some()
          }
        }
      }
      if (
        this.tmc &&
        this.TravelApprovalType &&
        this.tmc.TravelApprovalType == this.TravelApprovalType.Free
      ) {
        if (!this.searchModel.ApprovalName) {
          const el = this.getEleByAttr("accountId", "accountId");
          this.moveRequiredEleToViewPort(el);
          AppHelper.alert("??????????????????");
          return;
        }
      }

      if (this.searchModel.TravelForm) {
        this.searchModel.TravelForm.OrganizationId = this.searchModel.OrganizationId =
          this.searchModel.TravelForm.Organization &&
          this.searchModel.TravelForm.Organization.Id;
      }
      this.processOutNumbers();

      await this.service.travelSubmit(this.searchModel);
      this.router.navigate([AppHelper.getRoutePath("business-list")], {
        queryParams: { doRefresh: true },
      });
    } catch (e) {
      console.error(e);
      let msg = e;
      if (e && e.toLowerCase().includes("flownotexist")) {
        msg = "?????????????????????";
      }
      if (msg) {
        AppHelper.alert(msg);
      }
    }
  }

  async onSave() {
    try {
      if (this.searchModel.TravelForm) {
        if (this.searchModel.TravelForm.Trips) {
          // tslint:disable-next-line: prefer-for-of
          for (
            let index = 0;
            index < this.searchModel.TravelForm.Trips.length;
            index++
          ) {
            const trip = this.searchModel.TravelForm.Trips[index];
            if (trip && trip.travelTools) {
              trip.TravelTool = trip.travelTools.join(",");
            }
            if (this.searchModel.TravelForm.Trips[index].Day <= 0) {
              const el = this.getEleByAttr("addStroke", `${index}`);
              this.moveRequiredEleToViewPort(el);
              AppHelper.alert("????????????????????????????????????????????????");
              return;
            }
            if (trip.StartDate && trip.EndDate) {
              trip.StartDate = trip.StartDate.replace("T", " ").substring(
                0,
                10
              );
              trip.EndDate = trip.EndDate.replace("T", " ").substring(0, 10);
            }
            // this.searchModel.TravelForm.Trips.some()
          }
        }
        // if (
        //   this.tmc &&
        //   this.TravelApprovalType &&
        //   this.tmc.TravelApprovalType == this.TravelApprovalType.Free
        // ) {
        //   if (!this.appovalStaff) {
        //     const el = this.getEleByAttr("accountId", "accountId");
        //     this.moveRequiredEleToViewPort(el);
        //     AppHelper.toast("??????????????????");
        //     return;
        //   }
        // }
        this.searchModel.OrganizationId =
          this.searchModel.TravelForm.Organization &&
          this.searchModel.TravelForm.Organization.Id;
      }
      if (this.searchModel.TravelForm.Trips) {
        // tslint:disable-next-line: prefer-for-of
        for (
          let index = 0;
          index < this.searchModel.TravelForm.Trips.length;
          index++
        ) {
          const trip = this.searchModel.TravelForm.Trips[index];
          if (trip.StartDate && trip.EndDate) {
            trip.StartDate = trip.StartDate.replace("T", " ").substring(0, 10);
            trip.EndDate = trip.EndDate.replace("T", " ").substring(0, 10);
          }
        }
      }
      this.getAllTravelDays();
      this.processOutNumbers();
      const r = await this.service.getTravelSave({
        ...this.searchModel,
        ...this.searchModel.TravelForm,
      });
      this.router.navigate([AppHelper.getRoutePath("business-list")], {
        queryParams: { doRefresh: true },
      });
    } catch (e) {
      console.error(e);
      AppHelper.alert(e);
    }
  }

  onTextarea(evt: CustomEvent) {
    const len = evt.detail && evt.detail.value && evt.detail.value.length;
    if (len > 50) {
      AppHelper.alert("??????????????????50???");
      setTimeout(() => {
        if (
          this.searchModel.TravelForm.Subject &&
          this.searchModel.TravelForm.Subject.length > 50
        ) {
          this.searchModel.TravelForm.Subject = this.searchModel.TravelForm.Subject.substr(
            0,
            50
          );
        }
      }, 100);
      return;
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
    item.EndDate = moment().format("YYYY-MM-DD");
    item.StartDate = moment().format("YYYY-MM-DD");
    // item.StartDate
    if (!this.searchModel.TravelForm.Trips) {
      this.searchModel.TravelForm.Trips = [];
    }
    this.searchModel.TravelForm.Trips.push(item);
  }
  ngDoCheck() {
    this.getAllTravelDays();

    // console.log("calcTotalTrvavelDays", days);
  }
  private getAllTravelDays() {
    if (this.searchModel && this.searchModel.TravelForm) {
      const days = this.travelService.calcTotalTrvavelDays(
        this.searchModel.TravelForm.Trips
      );
      this.searchModel.TravelForm.DayCount = days;
    }
    if (!this.searchModel.TravelForm.DayCount) {
      this.searchModel.TravelForm.DayCount = 0;
    }
    return this.searchModel.TravelForm.DayCount;
  }
  getCashSuccess() {}
}
