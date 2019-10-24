import { IdentityService } from './../../services/identity/identity.service';
import { OrderTripModel } from "./../models/OrderTripModel";
import { OrderService } from "./../order.service";
import { ApiService } from "./../../services/api/api.service";
import { StaffService } from "src/app/hr/staff.service";
import { PayService } from "src/app/services/pay/pay.service";
import { AppHelper } from "src/app/appHelper";
import { OrderModel } from "src/app/order/models/OrderModel";
import { TmcEntity, TmcService } from "../../tmc/tmc.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import {
  NavController,
  ModalController,
  IonInfiniteScroll,
  IonRefresher,
  IonContent
} from "@ionic/angular";
import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { SearchTicketModalComponent } from "../components/search-ticket-modal/search-ticket-modal.component";
import { SearchTicketConditionModel } from "../../tmc/models/SearchTicketConditionModel";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "src/app/order/models/OrderTrainTicketStatusType";
import { OrderFlightTicketEntity } from "src/app/order/models/OrderFlightTicketEntity";
import * as moment from "moment";
import { Subscription, from } from "rxjs";
import { finalize } from "rxjs/operators";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { LanguageHelper } from "src/app/languageHelper";
import { OrderTaskModel } from "../models/OrderTaskModel";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { TaskModel } from "../models/TaskModel";
import { IdentityEntity } from 'src/app/services/identity/identity.entity';
export const ORDER_TABS: ProductItem[] = [
  {
    label: "机票",
    value: ProductItemType.plane,
    imageSrc: "assets/svgs/product-plane.svg",
    isDisplay: true
  },
  {
    label: "酒店",
    value: ProductItemType.hotel,
    imageSrc: "assets/svgs/product-hotel.svg",
    isDisplay: true
  },
  {
    label: "火车票",
    value: ProductItemType.train,
    imageSrc: "assets/svgs/product-train.svg",
    isDisplay: true
  },
  {
    label: "保险",
    value: ProductItemType.insurance,
    imageSrc: "assets/svgs/product-insurance.svg",
    isDisplay: !true
  },
  {
    label: "待审任务",
    value: ProductItemType.waitingApprovalTask,
    imageSrc: "assets/images/projectcheck.png",
    isDisplay: true
  },
  {
    label: "更多",
    value: ProductItemType.more,
    imageSrc: "assets/svgs/product-more.svg",
    isDisplay: true
  }
];
@Component({
  selector: "app-product-tabs",
  templateUrl: "./product-tabs.page.html",
  styleUrls: ["./product-tabs.page.scss"]
})
export class ProductTabsPage implements OnInit, OnDestroy {
  private condition: SearchTicketConditionModel = new SearchTicketConditionModel();
  loadDataSub = Subscription.EMPTY;
  productItemType = ProductItemType;
  activeTab: ProductItem;
  tabs: ProductItem[] = [];
  tmc: TmcEntity;
  orderModel: OrderModel;
  dataCount: number;
  isLoading = true;
  title = "机票订单";
  tasks: TaskEntity[];
  curTaskPageIndex = 0;
  isShowMyTrips = false;
  myTrips: OrderTripModel[];
  isOpenUrl = false;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    route: ActivatedRoute,
    private tmcService: TmcService,
    private router: Router,
    private payService: PayService,
    private staffService: StaffService,
    private apiService: ApiService,
    private orderService: OrderService,
    private identityService: IdentityService
  ) {
    route.queryParamMap.subscribe(d => {
      if (d && d.get("tabId")) {
        const tab = ORDER_TABS.find(it => it.value == +(d.get('tabId')));
        console.log("product-tabs", tab);
        const plane = ORDER_TABS.find(it => it.value == ProductItemType.plane);
        this.activeTab = this.isOpenUrl
          ? this.activeTab
          : this.activeTab || tab || plane;
        this.title = tab.label;
      }
      this.isOpenUrl = false;
    });
  }
  ngOnDestroy() {
    this.loadDataSub.unsubscribe();
  }
  private async payOrder(tradeNo: string) {
    const payWay = await this.payService.selectPayWay();
    if (!payWay) {
      const ok = await AppHelper.alert(
        LanguageHelper.Order.getGiveUpPayTip(),
        true,
        LanguageHelper.getYesTip(),
        LanguageHelper.getNegativeTip()
      );
      if (ok) {
        // this.router.navigate([""]);
      } else {
        await this.payOrder(tradeNo);
      }
    } else {
      if (payWay.value == "ali") {
        await this.aliPay(tradeNo);
      }
      if (payWay.value == "wechat") {
        await this.wechatPay(tradeNo);
      }
      // this.router.navigate([""]);
    }
    this.doRefresh();
  }

  private async wechatPay(tradeNo: string) {
    const req = new RequestEntity();
    req.Method = "TmcApiOrderUrl-Pay-Create";
    req.Version = "2.0";
    req.Data = {
      Channel: "App",
      Type: "3",
      OrderId: tradeNo,
      IsApp: AppHelper.isApp()
    };
    return this.payService
      .wechatpay(req, "")
      .then(r => {
        const req1 = new RequestEntity();
        req1.Method = "TmcApiOrderUrl-Pay-Process";
        req1.Version = "2.0";
        req1.Data = {
          OutTradeNo: r,
          Type: "3"
        };
        return this.payService.process(req1);
      })
      .catch(r => {
        AppHelper.alert(r);
      });
  }

  private async aliPay(tradeNo: string) {
    const req = new RequestEntity();
    req.Method = "TmcApiOrderUrl-Pay-Create";
    req.Version = "2.0";
    req.Data = {
      Channel: "App",
      Type: "2",
      IsApp: AppHelper.isApp(),
      OrderId: tradeNo
    };
    const r = await this.payService.alipay(req, "").catch(e => {
      AppHelper.alert(e);
    });
    if (r) {
      const req1 = new RequestEntity();
      req1.Method = "TmcApiOrderUrl-Pay-Process";
      req1.Version = "2.0";
      req1.Data = {
        OutTradeNo: r,
        Type: "2"
      };
      return this.payService.process(req1);
    }
  }
  async onPay(order: OrderEntity) {
    const isSelfBookType = await this.staffService.isSelfBookType();
    if (order) {
      if (order.Status == OrderStatusType.WaitPay) {
        if (
          order.TravelPayType == OrderTravelPayType.Person &&
          isSelfBookType
        ) {
          const result = await this.payOrder(order.Id);
        }
      }
    }
  }
  loadMoreOrders() {
    if (this.isShowMyTrips) {
      return;
    }
    this.doSearchOrderList();
  }
  private scrollToTop() {
    if (this.ionContent) {
      this.ionContent.scrollToTop(100);
    }
  }
  doRefresh(condition?: SearchTicketConditionModel) {
    if (this.activeTab.value == ProductItemType.waitingApprovalTask) {
      this.doRefreshTasks();
      return;
    }
    this.isShowMyTrips = false;
    this.condition = condition || new SearchTicketConditionModel();
    this.condition.pageIndex = 0;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.orderModel = new OrderModel();
    this.myTrips = [];
    this.orderModel.Orders = [];
    this.scrollToTop();
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    this.loadMoreOrders();
  }
  onTabClick(tab: ProductItem) {
    this.activeTab = tab;
    this.title = tab.label + "订单";
    if (this.activeTab.value == ProductItemType.waitingApprovalTask) {
      this.doRefreshTasks();
      this.title = tab.label;
    }
    this.doRefresh();
  }
  historyTrips() {
    const condition = new SearchTicketConditionModel();
    condition.toDate = moment().format("YYYY-MM-DD");
    this.doRefresh(condition);
  }
  onshowMyTrips() {
    this.condition = new SearchTicketConditionModel();
    this.condition.pageIndex = 0;
    this.isShowMyTrips = true;
    this.myTrips = [];
    this.loadMoreMyTrips();
  }
  loadMoreMyTrips() {
    if (!this.isShowMyTrips) {
      return;
    }
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    const m = this.transformSearchCondition(this.condition);
    m.Type =
      this.activeTab.value == ProductItemType.plane
        ? "Flight"
        : this.activeTab.value == ProductItemType.hotel
          ? "Hotel"
          : "Train";
    this.isLoading = this.condition && this.condition.pageIndex == 0;
    this.loadDataSub = this.orderService
      .getMyTrips(m)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.ionRefresher) {
            this.ionRefresher.complete();
          }
        })
      )
      .subscribe(res => {
        if (res && res.Data && res.Data.OrderTrips) {
          if (this.infiniteScroll) {
            this.infiniteScroll.disabled = res.Data.OrderTrips.length === 0;
            this.infiniteScroll.complete();
          }
          if (res.Data.OrderTrips.length) {
            this.myTrips = [...this.myTrips, ...res.Data.OrderTrips];
            this.condition.pageIndex++;
          }
        }
      });
  }
  back() {
    this.navCtrl.back();
  }
  async openSearchModal() {
    const m = await this.modalCtrl.create({
      component: SearchTicketModalComponent,
      componentProps: {
        type: this.activeTab
      }
    });
    await m.present();
    const result = await m.onDidDismiss();
    console.log("条件查询", result.data);
    if (result && result.data) {
      const condition = { ...this.condition, ...result.data };
      this.doRefresh(condition);
    } else {
      this.doRefresh();
    }
  }
  goToDetailPage(orderId: string) {
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(this.activeTab),
        orderId: orderId
      }
    });
  }
  doRefreshTasks() {
    if (this.activeTab.value != ProductItemType.waitingApprovalTask) {
      this.isLoading = false;
      return;
    }
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.tasks = [];
    this.curTaskPageIndex = 0;
    if (this.ionRefresher) {
      this.ionRefresher.complete();
    }
    this.doLoadMoreTasks();
  }
  private doLoadMoreTasks() {
    if (this.activeTab.value != ProductItemType.waitingApprovalTask) {
      this.isLoading = false;
      return;
    }
    this.isLoading = this.curTaskPageIndex == 0;
    this.loadDataSub = this.orderService
      .getOrderTasks({
        PageSize: 15,
        PageIndex: this.curTaskPageIndex
      } as any)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.ionRefresher) {
            this.ionRefresher.complete();
          }
        })
      )
      .subscribe(async tasks => {
        if (tasks) {
          if (tasks.length) {
            this.tasks = this.tasks.concat(tasks);
            this.curTaskPageIndex++;
          }
          if (this.infiniteScroll) {
            this.infiniteScroll.disabled = tasks.length == 0;
            this.infiniteScroll.complete();
          }
        }
      });
  }
  getTaskOrderId(task: TaskEntity) {
    return task && task.VariablesJsonObj["OrderId"];
  }
  getTaskUrl(task: TaskEntity) {
    return task && task.VariablesJsonObj["TaskUrl"];
  }
  private async doSearchOrderList() {
    try {
      if (this.infiniteScroll) {
        this.infiniteScroll.disabled = this.isLoading;
      }
      if (this.loadDataSub) {
        this.loadDataSub.unsubscribe();
      }
      const m = this.transformSearchCondition(this.condition);
      m.Type =
        this.activeTab.value == ProductItemType.plane
          ? "Flight"
          : this.activeTab.value == ProductItemType.train
            ? "Train"
            : "Hotel";
      this.isLoading = this.condition && this.condition.pageIndex == 0;
      this.loadDataSub = this.orderService
        .getOrderList(m)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            setTimeout(() => {
              if (this.infiniteScroll) {
                this.infiniteScroll.complete();
              }
              if (this.ionRefresher) {
                this.ionRefresher.complete();
              }
            }, 200);
          })
        )
        .subscribe(
          async res => {
            let result: OrderModel = res.Status ? res.Data : null;
            this.dataCount = result && result.DataCount;
            result = this.combineInfo(result);
            if (result && result.Orders && result.Orders.length) {
              this.condition.pageIndex++;
              if (this.orderModel) {
                this.orderModel.Orders = [
                  ...this.orderModel.Orders,
                  ...result.Orders
                ];
              } else {
                this.orderModel = result;
              }
            }
          },
          e => {
            console.error(e);
          }
        );
    } catch (e) {
      console.error(e);
    }
  }
  async onTaskDetail(task: TaskEntity) {
    const url = this.getTaskUrl(task);
    if (url) {
      const identity: IdentityEntity = await this.identityService.getIdentityAsync()
        .catch(_ => null);
      const sign = this.apiService.getSign({ Token: identity && identity.Token } as any);
      this.router
        .navigate(["open-url"], {
          queryParams: {
            url: `${url}?sign=${sign}&taskid=${task.Id}&ticket=${identity && identity.Ticket}`,
            title: task && task.Name,
            tabId: this.activeTab,
            isHideTitle: true
          }
        })
        .then(_ => {
          this.isOpenUrl = true;
        });
    }
  }
  private combineInfo(data: OrderModel) {
    if (data) {
      if (data.Orders) {
        data.Orders = data.Orders.map(order => {
          if (order.Variables) {
            order.VariablesJsonObj = JSON.parse(order.Variables);
          }
          if (order.InsertTime) {
            if (order.InsertTime.includes("T")) {
              const [date, time] = order.InsertTime.split("T");
              order.InsertDateTime = `${date} ${time.substring(
                0,
                time.lastIndexOf(":")
              )}`;
            } else {
              order.InsertDateTime = order.InsertTime;
            }
          }
          if (order.OrderFlightTickets) {
            order.OrderFlightTickets = order.OrderFlightTickets.map(t => {
              t.vmTicketAmount = this.getTotalAmount(order, t.Key);
              t.vmInsuranceAmount = this.getInsuranceAmount(order, t);
              // t.vmIsAllowExchange = this.isAllowExchange(order);
              // t.vmIsAllowRefund = this.isAllowRefund(order);
              if (t.OrderFlightTrips) {
                t.OrderFlightTrips = t.OrderFlightTrips.map(trip => {
                  if (trip.TakeoffTime) {
                    if (trip.TakeoffTime.includes("T")) {
                      const [date, time] = trip.TakeoffTime.split("T");
                      trip.TakeoffDate = date;
                      trip.TakeoffShortTime = time.substring(
                        0,
                        time.lastIndexOf(":")
                      );
                    } else {
                      const m = moment(trip.TakeoffTime);
                      trip.TakeoffDate = m.format("YYYY-MM-DD");
                      trip.TakeoffShortTime = m.format("HH:mm");
                    }
                  }
                  if (trip.ArrivalTime) {
                    if (trip.ArrivalTime.includes("T")) {
                      const [date, time] = trip.ArrivalTime.split("T");
                      trip.ArrivalDate = date;
                      trip.ArrivalShortTime = time.substring(
                        0,
                        time.lastIndexOf(":")
                      );
                    } else {
                      const m = moment(trip.ArrivalTime);
                      trip.ArrivalDate = m.format("YYYY-MM-DD");
                      trip.ArrivalShortTime = m.format("HH:mm");
                    }
                  }
                  return trip;
                });
              }
              return t;
            });
          }
          order.vmIsCheckPay = this.checkPay(order);
          return order;
        });
      }
    }
    return data;
  }

  private getInsuranceAmount(
    order: OrderEntity,
    orderFlightTicket: OrderFlightTicketEntity
  ) {
    if (!order || !orderFlightTicket || !order.OrderItems) {
      return 0;
    }
    return order.OrderItems.filter(
      it => it.Tag == OrderItemHelper.Insurance
    ).reduce((acc, item) => (acc = AppHelper.add(acc, +item.Amount)), 0);
  }
  private transformSearchCondition(data: SearchTicketConditionModel) {
    let model = new OrderModel();
    model = {
      ...model,
      ...data
    };
    model.StartDate =
      data.fromDate ||
      moment()
        .startOf("year")
        .format("YYYY-MM-DD");
    model.EndDate = data.toDate;
    model.Id = data.orderNumber;
    model.Status = data.orderStatus;
    model.Passenger = data.passengerName;
    model.PageIndex = data.pageIndex || 0;
    if (data.passengerName) {
      model.Orders = [
        {
          OrderPassengers: [
            {
              Name: data.passengerName
            } as any
          ]
        } as any
      ];
    }
    if (data.toCity) {
      model.ToCityName = data.toCity.CityName || data.toCity.Nickname;
    }
    if (data.fromCity) {
      model.FromCityName = data.fromCity.CityName || data.fromCity.Nickname;
    }
    if (data.fromCityName) {
      model.OrderTrips = [
        {
          FromName: data.fromCityName
        } as any
      ];
    }
    if (data.toCityName) {
      model.OrderTrips = [
        {
          ToName: data.toCityName
        } as any
      ];
    }
    console.log("transformSearchCondition", model);
    return model;
  }
  async ngOnInit() {
    try {
      this.tmc = await this.tmcService.getTmc(true);
      this.doRefresh();
      this.tabs = ORDER_TABS.filter(t => t.value != ProductItemType.more && t.isDisplay);
    } catch (e) {
      console.error(e);
    }
  }
  getTotalAmount(order: OrderEntity, key: string) {
    let amount = 0;
    const Tmc = this.tmc;
    if (!order || !order.OrderItems || !Tmc) {
      return amount;
    }
    if (Tmc.IsShowServiceFee) {
      amount = order.OrderItems
        .filter(it => it.Key == key)
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    } else {
      amount = order.OrderItems
        .filter(it => it.Key == key && !(it.Tag || "").endsWith("Fee"))
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount;
  }
  private checkPay(order: OrderEntity) {
    if (order.Status == OrderStatusType.WaitHandle) {
      return false;
    }
    let rev =
      order.PayAmount < order.TotalAmount &&
      order.VariablesJsonObj &&
      ((order.VariablesJsonObj["TravelPayType"] as OrderTravelPayType) ==
        OrderTravelPayType.Credit ||
        (order.VariablesJsonObj["TravelPayType"] as OrderTravelPayType) ==
        OrderTravelPayType.Person) &&
      order.Status != OrderStatusType.Cancel;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderFlightTickets ||
      order.OrderFlightTickets.reduce((acc, it) => {
        if (
          it.Status == OrderFlightTicketStatusType.Booking ||
          it.Status == OrderFlightTicketStatusType.BookExchanging
        ) {
          acc++;
        }
        return acc;
      }, 0) == 0;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderTrainTickets ||
      order.OrderTrainTickets.reduce((acc, it) => {
        if (
          it.Status == OrderTrainTicketStatusType.Booking ||
          it.Status == OrderTrainTicketStatusType.BookExchanging
        ) {
          acc++;
        }
        return acc;
      }, 0) == 0;
    return rev;
  }
}
