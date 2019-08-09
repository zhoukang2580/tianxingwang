import { IonRefresher, NavController } from "@ionic/angular";
import { Router } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { TmcService } from "src/app/tmc/tmc.service";
import { Subscription } from "rxjs";
type TmcEntity = {
  GroupCompanyName: string; // "爱普科斯";
  Id: string; // 1;
  Name: string; // "爱普科斯（上海）产品服务有限公司";
};
@Component({
  selector: "app-select-customer",
  templateUrl: "./select-customer.page.html",
  styleUrls: ["./select-customer.page.scss"]
})
export class SelectCustomerPage implements OnInit, OnDestroy {
  keyword: string = "";
  customers: any[] = [];
  loading: boolean;
  selectedItem: TmcEntity;
  identityEntity: IdentityEntity;
  identitySubscription = Subscription.EMPTY;
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private router: Router,
    private tmcService: TmcService,
    private navCtrl: NavController
  ) {
    this.identitySubscription = this.identityService
      .getIdentity()
      .subscribe(id => {
        this.identityEntity = id;
      });
  }
  back() {
    this.navCtrl.back();
  }
  ngOnDestroy() {
    this.identitySubscription.unsubscribe();
  }
  ngOnInit() {}
  async onSelect(item: TmcEntity) {
    this.selectedItem = item;
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Agent-SelectTmc";
    req.Data = {
      TmcId: item.Id
    };
    req.IsShowLoading = true;
    const result = await this.apiService
      .getPromiseData<IdentityEntity>(req)
      .catch(e => {
        console.log(e);
        return null;
      });
    if (result && result.Numbers && result.Numbers.TmcId) {
      this.identityService.setIdentity({
        ...this.identityEntity,
        ...result
      });
      this.tmcService.setSelectedCompany(this.selectedItem.Name);
      this.router.navigate([AppHelper.getRoutePath("")]);
    }
  }
  async doRefresh() {
    this.customers = [];
    if (this.ionrefresher) {
      if (this.keyword.trim()) {
        await this.onSearch();
      }
      // console.log(this.ionrefresher);
      this.ionrefresher.complete();
    }
  }
  async onSearch() {
    this.loading = true;
    this.customers = await this.loadMoreData();
    this.loading = !true;
  }
  async loadMoreData() {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Agent-QueryTmc";
    req.Data = {
      Name: this.keyword.trim()
    };
    try {
      return await this.apiService.getPromiseData<TmcEntity[]>(req);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
