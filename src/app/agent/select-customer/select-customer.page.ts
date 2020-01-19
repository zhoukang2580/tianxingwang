import { finalize } from "rxjs/operators";
import { TmcService, TmcEntity } from "./../../tmc/tmc.service";
import { AgentService } from "./../agent.service";
import { IonRefresher, NavController } from "@ionic/angular";
import { Router } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { Subscription } from "rxjs";
@Component({
  selector: "app-select-customer",
  templateUrl: "./select-customer.page.html",
  styleUrls: ["./select-customer.page.scss"]
})
export class SelectCustomerPage implements OnInit, OnDestroy {
  private subscription = Subscription.EMPTY;
  keyword = "";
  customers: any[] = [];
  loading: boolean;
  selectedItem: TmcEntity;
  identityEntity: IdentityEntity;
  identitySubscription = Subscription.EMPTY;
  @ViewChild(IonRefresher, { static: false }) ionrefresher: IonRefresher;
  constructor(
    private agentService: AgentService,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private router: Router
  ) {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(id => {
        this.identityEntity = id;
      });
  }
  back() {
    this.navCtrl.pop();
  }
  ngOnDestroy() {
    this.identitySubscription.unsubscribe();
    this.subscription.unsubscribe();
  }
  ngOnInit() {}
  async onSelect(item: TmcEntity) {
    this.selectedItem = item;
    const ok = await this.agentService.onSelect(item);
    if (ok) {
      this.tmcService.setSelectedCompany(this.selectedItem.Name);
      this.router.navigate([AppHelper.getRoutePath("")]);
    }
  }
  goToOrderListPage() {
    this.router.navigate([AppHelper.getRoutePath("order-list")]);
  }
  async doRefresh() {
    this.customers = [];
    if (this.ionrefresher) {
      if (this.keyword.trim()) {
        this.onSearch();
      }
      // console.log(this.ionrefresher);
      this.ionrefresher.complete();
    }
  }
  onSearch() {
    this.subscription.unsubscribe();
    this.subscription = this.loadMoreData().subscribe(
      res => {
        this.customers = (res && res.Data) || [];
      },
      _ => {
        this.customers = [];
      }
    );
  }
  loadMoreData() {
    return this.agentService.queryTmc((this.keyword || "").trim()).pipe(
      finalize(() => {
        setTimeout(() => {
          this.loading = false;
        }, 200);
      })
    );
  }
}
