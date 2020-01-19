import { FlightService } from "src/app/flight/flight.service";
import { TrainService } from "./../../train/train.service";
import { Subscription } from "rxjs";
import { IonRefresher } from "@ionic/angular";
import { Router } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ApiService } from "src/app/services/api/api.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy
} from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
interface TcmCompany {
  Id: string;
  Name: string;
}
@Component({
  selector: "app-switch-company",
  templateUrl: "./switch-company.page.html",
  styleUrls: ["./switch-company.page.scss"]
})
export class SwitchCompanyPage implements OnInit, OnDestroy {
  keyword: string = "";
  customers: any[] = [];
  loading: boolean;
  identitySubscription = Subscription.EMPTY;
  identity: IdentityEntity;
  @ViewChild(IonRefresher, { static: false }) ionrefresher: IonRefresher;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private router: Router
  ) {}
  ngOnDestroy() {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe(id => {
        this.identity = id;
      });
  }
  ngOnInit() {}
  async onSelect(item: TcmCompany) {
    const req = new RequestEntity();
    req.Method = "AgentApiHomeUrl-Home-SelectTmc";
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
        ...this.identity,
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
      return await this.apiService.getPromiseData<TcmCompany[]>(req);
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
