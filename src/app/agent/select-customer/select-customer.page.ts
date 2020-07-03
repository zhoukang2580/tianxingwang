import { finalize } from "rxjs/operators";
import { TmcService, TmcEntity } from "./../../tmc/tmc.service";
import { AgentService } from "./../agent.service";
import { IonRefresher, NavController, IonInfiniteScroll } from "@ionic/angular";
import { Router } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ApiService } from "src/app/services/api/api.service";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { AppHelper } from "src/app/appHelper";
import { Subscription } from "rxjs";
import { LoginService } from "src/app/services/login/login.service";
import { BackButtonComponent } from "src/app/components/back-button/back-button.component";
import { RefresherComponent } from "src/app/components/refresher";
@Component({
  selector: "app-select-customer",
  templateUrl: "./select-customer.page.html",
  styleUrls: ["./select-customer.page.scss"],
})
export class SelectCustomerPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  private pageIndex = 0;
  @ViewChild(BackButtonComponent, { static: true })
  // private selectedItem: TmcEntity;
  backbtn: BackButtonComponent;
  keyword = "";
  customers: any[] = [];
  loading: boolean;
  identityEntity: IdentityEntity;
  identitySubscription = Subscription.EMPTY;
  @ViewChild(RefresherComponent, { static: true })
  ionrefresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  company: any;
  constructor(
    private agentService: AgentService,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private router: Router,
    private loginService: LoginService
  ) {
    this.identitySubscription = this.identityService
      .getIdentitySource()
      .subscribe((id) => {
        this.identityEntity = id;
      });
  }
  back() {
    if (this.company) {
      this.goHome();
      return;
    }
    this.backbtn.popToPrePage();
  }
  onSwitchAccount() {
    this.loginService.logout();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    this.subscriptions.push(this.identitySubscription);
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.tmcService.getSelectedCompanySource().subscribe((c) => {
        this.company = c;
      })
    );
    if (this.scroller) {
      this.scroller.disabled = true;
    }
  }
  private goHome() {
    this.router.navigate([AppHelper.getRoutePath("")]);
  }
  async onSelect(item: TmcEntity) {
    const ok = await this.agentService.onSelect(item);
    if (ok) {
      this.tmcService.setSelectedCompanySource(item.Name);
      this.goHome();
    }
  }
  goToOrderListPage() {
    this.router.navigate([AppHelper.getRoutePath("order-list")]);
  }
  doRefresh() {
    this.customers = [];
    this.pageIndex = 0;
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    if (this.ionrefresher) {
      this.ionrefresher.complete();
    }
    if (this.keyword.trim()) {
      this.onSearch();
    } else {
      this.loadMore();
    }
  }
  onSearch() {
    this.subscription.unsubscribe();
    this.subscription = this.loadMoreData().subscribe(
      (res) => {
        const arr = (res && res.Data) || [];
        this.customers = arr;
      },
      (_) => {
        this.customers = [];
      }
    );
  }
  loadMore() {
    this.subscription = this.loadMoreData().subscribe(
      (res) => {
        const arr = (res && res.Data) || [];
        this.scroller.disabled = arr.length < 20;
        if (arr.length) {
          this.pageIndex++;
          this.customers = this.customers.concat(arr);
        }
      },
      (_) => {
        // this.customers = [];
      }
    );
  }
  private loadMoreData() {
    return this.agentService
      .queryTmc((this.keyword || "").trim(), this.pageIndex)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loading = false;
            if (this.scroller) {
              this.scroller.complete();
            }
          }, 200);
        })
      );
  }
}
