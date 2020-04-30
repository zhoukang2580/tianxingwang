import { Component, OnInit, OnDestroy } from "@angular/core";
import { ModalController } from "@ionic/angular";
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

@Component({
  selector: "app-add-apply",
  templateUrl: "./add-apply.page.html",
  styleUrls: ["./add-apply.page.scss"],
})
export class AddApplyPage implements OnInit, OnDestroy {
  organization: string;
  organizationId: string;
  costCenterName: string;
  costCenterCode: string;
  organizationCode: string;
  customerName: string;
  private subscription = Subscription.EMPTY;
  items: TravelFormEntity[];
  searchModel: SearchModel;
  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private service: TravelService,
    private router: Router
  ) {}

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
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
    this.searchModel.TravelForm.Trips.push(item);
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
      this.organization = org.Name;
      this.organizationCode = org.Code;
      this.organizationId = org.Id;
    }
  }
  async onSelectCostCenter() {
    const m = await this.modalCtrl.create({ component: SelectCostcenter });
    m.present();
    const data = await m.onDidDismiss();
    const org = data && (data.data as CostCenterEntity);
    if (org) {
      this.costCenterName = org.Name;
      this.costCenterCode = org.Code;
    }
  }
  onSubmit() {
    if (this.searchModel.TravelForm) {
      this.searchModel.TravelForm.Organization = {
        Code: this.organizationCode,
        Name: this.organization,
        Id: this.organizationId,
      } as OrganizationEntity;
      this.searchModel.OrganizationId = this.organizationId;
      this.searchModel.TravelForm.CustomerName = this.customerName;
      this.searchModel.TravelForm.CostCenterName = this.costCenterName;
      this.searchModel.Trips = this.searchModel.TravelForm.Trips;
    }
    this.service.travelSubmit(this.searchModel);
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
}
