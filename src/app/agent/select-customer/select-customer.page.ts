import { IonRefresher } from "@ionic/angular";
import { Router } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
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
export class SelectCustomerPage implements OnInit {
  keyword: string = "";
  customers: any[] = [];
  loading: boolean;
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private router: Router
  ) {}

  ngOnInit() {}
  async onSelect(item: TmcEntity) {
    const req = new RequestEntity();
    req.Method = "AgentApiHomeUrl-Home-SelectTmc";
    req.Data = {
      TmcId: item.Id
    };
    req.IsShowLoading = true;
    const result = await this.apiService
      .getPromiseResponse<IdentityEntity>(req)
      .catch(e => {
        console.log(e);
        return null;
      });
    if (result && result.Numbers && result.Numbers.TmcId) {
      const origalIdentity = await this.identityService.getIdentity();
      this.identityService.setIdentity({
        ...origalIdentity,
        ...result
      });
      this.router.navigate([AppHelper.getRoutePath("")]);
    }
  }
  async doRefresh() {
    this.customers = [];
    if (this.ionrefresher) {
      if (this.keyword) {
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
    req.Method = "AgentApiHomeUrl-Home-QueryTmc";
    req.Data = {
      Name: this.keyword
    };
    try {
      return await this.apiService.getPromiseResponse<TmcEntity[]>(req);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
