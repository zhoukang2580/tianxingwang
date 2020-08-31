import { Router } from "@angular/router";
import { AgentService } from "../agent.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { ProductItemType } from "../../tmc/models/ProductItems";
import { ORDER_TABS } from "../../order/product-list/product-list.page";
import { finalize, catchError, map } from "rxjs/operators";
import { Subscription, of } from "rxjs";
import { OrderService } from "../../order/order.service";
import { Component, OnInit, OnDestroy } from "@angular/core";
import { OrderModel } from "src/app/order/models/OrderModel";
import { OrderEntity } from "src/app/order/models/OrderEntity";
import { ProductItem } from "src/app/tmc/models/ProductItems";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-agent-order-list",
  templateUrl: "./agent-order-list.page.html",
  styleUrls: ["./agent-order-list.page.scss"]
})
export class AgentOrderListPage implements OnInit, OnDestroy {
  private searchCondition: OrderModel;
  private loadSubscription = Subscription.EMPTY;
  tab: ProductItem; //
  tabs: ProductItem[];
  loadDataErrmsg = "";
  isLoading = false;
  orderList: OrderEntity[];
  constructor(
    private orderService: OrderService,
    private agentService: AgentService,
    private router: Router
  ) {}
  onActiveTab(tab: ProductItem) {
    this.tab = tab;
    this.doRefresh();
  }
  ngOnInit() {
    this.tabs = ORDER_TABS.filter(it => it.isDisplay).filter(
      it =>
        it.value != ProductItemType.waitingApprovalTask &&
        it.value != ProductItemType.more
    );
    this.tab = ORDER_TABS.find(it => it.value == ProductItemType.plane);
    this.onActiveTab(this.tab);
  }
  goToDetailPage(orderId: string) {
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(this.tab),
        orderId: orderId
      }
    });
  }
  async doRefresh() {
    this.searchCondition = new OrderModel();
    // this.searchCondition.Tmc = this.agentService.tmc;
    this.orderList = [];
    this.loadSubscription.unsubscribe();
    this.loadDataErrmsg = "";
    this.loadMore();
  }
  ngOnDestroy() {
    this.loadSubscription.unsubscribe();
  }
  loadMore() {
    this.loadSubscription = this.orderService
      .getOrderList(this.searchCondition)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.isLoading = false;
          }, 200);
        }),
        map(res => (res && res.Data && res.Data.Orders) || []),
        catchError(e => {
          this.loadDataErrmsg = e.Message || e;
          return of([]);
        })
      )
      .subscribe((res: OrderEntity[]) => {
        this.orderList = res;
      });
  }
  onFilter() {}
}
