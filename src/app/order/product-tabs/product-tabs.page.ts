import { AppHelper } from "src/app/appHelper";
import { OrderModel } from "src/app/order/models/OrderModel";
import { TmcEntity, TmcService } from "../../tmc/tmc.service";
import { ActivatedRoute, Router } from "@angular/router";
import { TrafficlineEntity } from "src/app/tmc/models/TrafficlineEntity";
import {
  NavController,
  ModalController,
  IonInfiniteScroll,
  IonRefresher
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
@Component({
  selector: "app-product-tabs",
  templateUrl: "./product-tabs.page.html",
  styleUrls: ["./product-tabs.page.scss"]
})
export class ProductTabsPage implements OnInit, OnDestroy {
  private condition: SearchTicketConditionModel = new SearchTicketConditionModel();
  loadDataSub = Subscription.EMPTY;
  productItemType = ProductItemType;
  activeTab: ProductItemType;
  tabs: ProductItem[] = [];
  tmc: TmcEntity;
  orderModel: OrderModel;
  dataCount: number;
  isLoading = true;
  title = "机票订单";
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    route: ActivatedRoute,
    private tmcService: TmcService,
    private router: Router
  ) {
    route.queryParamMap.subscribe(d => {
      console.log("product-tabs", d);
      if (d && d.get("tabId")) {
        this.activeTab = +d.get("tabId") || ProductItemType.plane;
      }
      if (d && d.get("tabs")) {
        this.tabs = JSON.parse(d.get("tabs"));
        this.tabs = this.tabs.filter(t => t.value != ProductItemType.more);
      }
    });
  }
  ngOnDestroy() {
    this.loadDataSub.unsubscribe();
  }
  loadMore() {
    this.doSearch();
  }
  doRefresh(condition?: SearchTicketConditionModel) {
    this.condition = condition || new SearchTicketConditionModel();
    this.condition.pageIndex = 0;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    this.orderModel = null;
    this.loadMore();
  }
  onTabClick(tab: ProductItem) {
    this.activeTab = tab.value;
    this.title = tab.label + "订单";
    this.doRefresh();
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
    if (result && result.data) {
      const condition = { ...this.condition, ...result.data };
      this.doRefresh(condition);
    } else {
      this.doRefresh();
    }
  }
  goToDetailPage(order: OrderEntity) {
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(this.activeTab),
        orderId: order.Id
      }
    });
  }
  private async doSearch() {
    try {
      if (this.loadDataSub) {
        this.loadDataSub.unsubscribe();
      }
      const m = this.transformSearchCondition(this.condition);
      m.Type =
        this.activeTab == ProductItemType.plane
          ? "flight"
          : this.activeTab == ProductItemType.train
          ? "train"
          : this.activeTab == ProductItemType.hotel
          ? "hotel"
          : "flight";
      this.isLoading = true;
      this.loadDataSub = this.tmcService
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
            let orderModel: OrderModel = res.Status ? res.Data : null;
            if (!this.tmc) {
              this.tmc = await this.tmcService.getTmc();
            }
            this.dataCount = orderModel && orderModel.DataCount;
            orderModel = this.combineInfo(orderModel);
            if (orderModel && orderModel.Orders && orderModel.Orders.length) {
              this.condition.pageIndex++;
              if (this.orderModel) {
                this.orderModel.Orders = [
                  ...this.orderModel.Orders,
                  ...orderModel.Orders
                ];
              } else {
                this.orderModel = orderModel;
              }
            }
            if (this.infiniteScroll) {
              this.infiniteScroll.disabled =
                orderModel && orderModel.Orders.length == 0;
            }
          },
          e => {}
        );
    } catch (e) {
      console.error(e);
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
              t.vmInsuranceAmount = this.insuranceAmount(order, t);
              t.vmIsAllowExchange = this.isAllowExchange(order);
              t.vmIsAllowRefund = this.isAllowRefund(order);
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
  private insuranceAmount(
    order: OrderEntity,
    orderFlightTicket: OrderFlightTicketEntity
  ) {
    if (!order || !orderFlightTicket) {
      return 0;
    }
    let flighttripKeys: string[] = [];
    if (orderFlightTicket && orderFlightTicket.OrderFlightTrips) {
      flighttripKeys = orderFlightTicket.OrderFlightTrips.map(it => it.Key);
    }
    let keys: string[] = [];
    if (order.OrderInsurances) {
      keys = order.OrderInsurances.filter(
        it => !!flighttripKeys.find(fkey => fkey == it.AdditionKey)
      ).map(it => it.Key);
    }

    let insuranceAmount = 0;
    if (order.OrderItems) {
      insuranceAmount = order.OrderItems.filter(
        it => !!keys.find(k => k == it.Key)
      ).reduce((acc, it) => {
        acc += +it.Amount;
        return acc;
      }, 0);
    }
    return insuranceAmount;
  }
  private isAllowRefund(order: OrderEntity) {
    return false;
  }
  private isAllowExchange(order: OrderEntity) {
    return false;
  }
  private transformSearchCondition(data: SearchTicketConditionModel) {
    const model = new OrderModel();
    model.StartDate =
      data.fromDate ||
      moment()
        .startOf("year")
        .format("YYYY-MM-DD");
    model.EndDate = data.toDate;
    model.Id = data.orderNumber;
    model.Type = "flight";
    model.Status = data.orderStatus;
    model.Passenger = data.passengerName;
    model.PageIndex = data.pageIndex || 0;
    if (data.toCity) {
      model.ToCityName = data.toCity.CityName || data.toCity.Nickname;
    }
    if (data.fromCity) {
      model.FromCityName = data.fromCity.CityName || data.fromCity.Nickname;
    }
    return model;
  }
  async ngOnInit() {
    this.tmc = await this.tmcService.getTmc(true);
    this.doRefresh();
  }
  getTotalAmount(order: OrderEntity, key: string) {
    console.log("getTotalAmount", order, key);
    if (!order.OrderItems || !this.tmc) {
      return 0;
    }
    let amount = 0;
    if (this.tmc.IsShowServiceFee) {
      amount = order.OrderItems.filter(it => it.Key == key).reduce(
        (acc, it) => {
          acc += +it.Amount;
          return acc;
        },
        0
      );
    } else {
      amount = order.OrderItems.filter(
        it => it.Key == key && !it.Tag.endsWith("Fee")
      ).reduce((acc, it) => {
        acc += +it.Amount;
        return acc;
      }, 0);
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
