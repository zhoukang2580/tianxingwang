import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { RefresherComponent } from "./../../components/refresher/refresher.component";
import { IdentityService } from "./../../services/identity/identity.service";
import { OrderTripModel } from "./../models/OrderTripModel";
import { OrderService } from "./../order.service";
import { ApiService } from "./../../services/api/api.service";
import { AppHelper } from "src/app/appHelper";
import { OrderModel } from "src/app/order/models/OrderModel";
import { TmcEntity, TmcService } from "../../tmc/tmc.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ModalController,
  IonInfiniteScroll,
  IonRefresher,
  IonContent,
  IonDatetime
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
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ORDER_TABS } from "../product-list/product-list.page";
import { PayService } from "src/app/services/pay/pay.service";
import { StaffService } from "src/app/hr/staff.service";
import { FlightService } from "src/app/flight/flight.service";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import { OrderFlightTripEntity } from "../models/OrderFlightTripEntity";

@Component({
  selector: "app-product-tabs",
  templateUrl: "./product-tabs.page.html",
  styleUrls: ["./product-tabs.page.scss"]
})
export class ProductTabsPage implements OnInit, OnDestroy {
  private condition: SearchTicketConditionModel = new SearchTicketConditionModel();
  private readonly pageSize = 20;
  private loadDataSub = Subscription.EMPTY;
  private exchangeDateSub = Subscription.EMPTY;
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
  loadMoreErrMsg: string;
  myTripsTotalCount = 0;
  orderFlightTicketStatusTypes: any[];
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(IonDatetime) datetime: IonDatetime;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  constructor(
    private modalCtrl: ModalController,
    route: ActivatedRoute,
    private tmcService: TmcService,
    private router: Router,
    private apiService: ApiService,
    private orderService: OrderService,
    private identityService: IdentityService,
    private staffService: StaffService,
    private flightService: FlightService
  ) {
    route.queryParamMap.subscribe(d => {
      if (d && d.get("tabId")) {
        const tab = ORDER_TABS.find(it => it.value == +d.get("tabId"));
        console.log("product-tabs", tab);
        const plane = ORDER_TABS.find(it => it.value == ProductItemType.plane);
        this.activeTab = this.isOpenUrl
          ? this.activeTab
          : this.activeTab || tab || plane;
        this.title = tab.label;
      }
      this.isOpenUrl = false;
      if (d && d.get("doRefresh") == "true") {
        this.doRefresh();
      }
    });
  }
  ngOnDestroy() {
    this.loadDataSub.unsubscribe();
    this.exchangeDateSub.unsubscribe();
  }
  async onPay(order: OrderEntity) {
    try {
      // const isSelfBookType = await this.staffService.isSelfBookType();
      if (order) {
        // if (order.Status == OrderStatusType.WaitPay) {
        // }
        await this.tmcService.payOrder(order.Id);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  loadMoreOrders() {
    if (
      this.isShowMyTrips ||
      this.activeTab.value == ProductItemType.waitingApprovalTask
    ) {
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
    this.isLoading = true;
    this.condition = condition || new SearchTicketConditionModel();
    this.condition.pageIndex = 0;
    this.loadMoreErrMsg = "";
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (this.activeTab.value == ProductItemType.waitingApprovalTask) {
      this.doRefreshTasks();
      return;
    }
    this.isShowMyTrips = false;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }
    this.orderModel = new OrderModel();
    this.myTrips = [];
    this.orderModel.Orders = [];
    this.scrollToTop();
    this.loadMore();
  }
  loadMore() {
    this.loadMoreOrders();
    this.loadMoreMyTrips();
    this.doLoadMoreTasks();
  }
  onTabClick(tab: ProductItem) {
    this.isLoading = true;
    this.loadDataSub.unsubscribe();
    this.activeTab = tab;
    this.dataCount = 0;
    this.myTripsTotalCount = 0;
    this.title = tab.label + "订单";
    if (this.activeTab.value == ProductItemType.waitingApprovalTask) {
      this.title = tab.label;
    }
    this.doRefresh();
  }
  async onRefundFlightTicket(data: {
    orderId: string;
    ticketId: string;
    IsVoluntary: boolean;
    FileName: string;
    FileValue: string;
  }) {
    await this.orderService
      .refundFlightTicket(data)
      .then(() => {
        AppHelper.toast("退票申请中", 2000, "middle");
        this.doRefresh();
        this.doRefreshTasks();
      })
      .catch(e => {
        AppHelper.alert(e);
      });
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
    m.PageSize = this.pageSize;
    m.Type =
      this.activeTab.value == ProductItemType.plane
        ? "Flight"
        : this.activeTab.value == ProductItemType.hotel
        ? "Hotel"
        : "Train";
    this.isLoading = this.condition.pageIndex < 1;
    this.loadDataSub = this.orderService
      .getMyTrips(m)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        res => {
          if (res && res.Data && res.Data.Trips) {
            if (this.condition.pageIndex < 1 && res.Data.Trips.length) {
              this.myTripsTotalCount = res.Data.DataCount;
            }
            if (this.infiniteScroll) {
              this.infiniteScroll.disabled = res.Data.Trips.length < 10;
              this.infiniteScroll.complete();
            }
            if (res.Data.Trips.length) {
              this.myTrips = [...this.myTrips, ...res.Data.Trips];
              this.condition.pageIndex++;
            }
          }
        },
        err => {
          this.loadMoreErrMsg = err.Message || err;
        }
      );
  }
  back() {
    this.backbtn.backToPrePage();
  }
  async openSearchModal() {
    const condition = new SearchTicketConditionModel();
    const m = await this.modalCtrl.create({
      component: SearchTicketModalComponent,
      componentProps: {
        type: this.activeTab,
        condition: {
          ...condition,
          orderFlightTicketStatusTypes:
            this.activeTab.value == ProductItemType.plane
              ? this.orderFlightTicketStatusTypes || []
              : []
        }
      }
    });
    await m.present();
    const result = await m.onDidDismiss();
    console.log("条件查询", result.data);
    if (result && result.data) {
      const cond = { ...this.condition, ...result.data };
      this.doRefresh(cond);
    }
    // else {
    //   this.doRefresh();
    // }
  }
  onAbolishTrainOrder(data: { orderId: string; ticketId: string }) {
    this.orderService
      .abolishTrainOrder({
        OrderId: data.orderId,
        TicketId: data.ticketId
      })
      .then(() => {
        this.doRefresh();
      })
      .catch(e => {
        AppHelper.alert(e);
      });
  }
  private getExchangeDate() {
    this.datetime.value = "";
    this.datetime.open();
    return new Promise<string>(resolve => {
      this.exchangeDateSub = this.datetime.ionChange.subscribe(() => {
        resolve(this.datetime.value);
      });
    });
  }
  async onExchangeFlightTicket(data: {
    orderId: string;
    ticketId: string;
    trip: OrderFlightTripEntity;
  }) {
    try {
      this.datetime.yearValues = [
        new Date().getFullYear(),
        new Date().getFullYear() + 1
      ];
      const date = await this.getExchangeDate();
      console.log("改签日期", date);
      if (!data) {
        AppHelper.alert("请选择改签日期");
        return;
      }
      const res = await this.orderService.getExchangeFlightTrip({
        OrderId: data.orderId,
        TicketId: data.ticketId,
        ExchangeDate: date
      });
      await this.flightService.initSelfBookTypeBookInfos();
      const bookInfos = this.flightService.getPassengerBookInfos();
      if (!bookInfos.length) {
        AppHelper.alert("改签失败，请重试");
        return;
      }
      bookInfos[0].exchangeInfo = {
        order: { Id: data.orderId } as any,
        ticket: { Id: data.ticketId } as any,
        trip: res.trip
      };
      this.flightService.setSearchFlightModelSource({
        ...this.flightService.getSearchFlightModel(),
        FromCode: res.trip.FromAirport,
        ToCode: res.trip.ToAirport,
        FromAsAirport: false,
        ToAsAirport: false,
        fromCity: res.fromCity,
        toCity: res.toCity,
        isExchange: true,
        Date: date.substr(0, 10)
      });
      this.router.navigate(["flight-list"], {
        queryParams: { doRefresh: true }
      });
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  onAbolishFlightOrder(data: { orderId: string; ticketId: string }) {
    this.orderService
      .abolishFlightOrder({ OrderId: data.orderId, TicketId: data.ticketId })
      .then(() => {
        AppHelper.toast("订单取消申请中", 2000, "middle");
        this.doRefresh();
      })
      .catch(e => {
        AppHelper.alert(e);
      });
  }
  goToDetailPage(orderId: string, type: string) {
    // Flight
    if (type && type.toLowerCase() == "car") {
      this.router.navigate([AppHelper.getRoutePath("car-order-detail")], {
        queryParams: { Id: orderId }
      });
      return;
    }
    else if (type && type.toLowerCase() == "flight") {
      this.router.navigate([AppHelper.getRoutePath("flight-order-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId
        }
      });
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(this.activeTab),
        orderId: orderId
      }
    });
  }
  private doRefreshTasks() {
    this.isLoading = true;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (this.activeTab.value != ProductItemType.waitingApprovalTask) {
      return;
    }
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.tasks = [];
    this.curTaskPageIndex = 0;
    this.doLoadMoreTasks();
    this.scrollToTop();
  }
  private doLoadMoreTasks() {
    if (this.activeTab.value != ProductItemType.waitingApprovalTask) {
      return;
    }
    const pageSize = 15;
    this.loadDataSub = this.orderService
      .getOrderTasks({
        PageSize: pageSize,
        PageIndex: this.curTaskPageIndex
      } as any)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        })
      )
      .subscribe(
        tasks => {
          if (tasks) {
            if (tasks.length) {
              this.tasks = this.tasks.concat(tasks);
              this.curTaskPageIndex++;
            }
            if (this.infiniteScroll) {
              this.infiniteScroll.disabled =
                tasks.length == 0 || tasks.length < pageSize;
            }
          }
        },
        err => {
          this.loadMoreErrMsg = err.Message || err;
        }
      );
  }
  getTaskOrderId(task: TaskEntity) {
    return task && task.VariablesJsonObj["OrderId"];
  }
  getTaskUrl(task: TaskEntity) {
    return task && task.VariablesJsonObj["TaskUrl"];
  }
  private async doSearchOrderList() {
    try {
      if (this.loadDataSub) {
        this.loadDataSub.unsubscribe();
      }
      const m = this.transformSearchCondition(this.condition);
      m.PageSize = this.pageSize;
      m.Type =
        this.activeTab.value == ProductItemType.plane
          ? "Flight"
          : this.activeTab.value == ProductItemType.train
          ? "Train"
          : this.activeTab.value == ProductItemType.car
          ? "Car"
          : "Hotel";
      this.orderModel.Type = m.Type;
      if (
        this.orderModel &&
        this.orderModel.Orders &&
        this.orderModel.Orders.length &&
        !m.EndDate
      ) {
        m.EndDate = this.orderModel.Orders[
          this.orderModel.Orders.length - 1
        ].InsertTime;
      }
      this.loadDataSub = this.orderService
        .getOrderList(m)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(
          async res => {
            let result: OrderModel = res.Status ? res.Data : null;
            this.orderFlightTicketStatusTypes =
              (res.Data && res.Data.OrderFlightTicketStatusTypes) || [];
            if (m.PageIndex < 1) {
              this.dataCount = result && result.DataCount;
            }
            result = this.combineInfo(result);
            if (this.infiniteScroll) {
              this.infiniteScroll.complete();
            }
            if (result && result.Orders && result.Orders) {
              this.infiniteScroll.disabled =
                result.Orders.length == 0 ||
                result.Orders.length < this.pageSize;
            }
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
            this.loadMoreErrMsg = e.Message || e;
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
      const identity: IdentityEntity = await this.identityService
        .getIdentityAsync()
        .catch(_ => null);
      const sign = this.apiService.getSign({
        Token: identity && identity.Token
      } as any);
      this.router
        .navigate(["open-url"], {
          queryParams: {
            url: `${url}?sign=${sign}&taskid=${task.Id}&ticket=${identity &&
              identity.Ticket}`,
            title: task && task.Name,
            tabId: this.activeTab.value
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
    if (data.fromDate) {
      model.StartDate = data.fromDate;
    }
    if (data.toDate) {
      model.EndDate = data.toDate || moment().format("YYYY-MM-DD");
    }
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
      this.tabs = ORDER_TABS.filter(
        t => t.value != ProductItemType.more && t.isDisplay
      );
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
      amount = order.OrderItems.filter(it => it.Key == key).reduce(
        (acc, it) => (acc = AppHelper.add(acc, +it.Amount)),
        0
      );
    } else {
      amount = order.OrderItems.filter(
        it => it.Key == key && !(it.Tag || "").endsWith("Fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
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
