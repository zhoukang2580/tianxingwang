import { SwiperSlideContentComponent } from "../components/swiper-slide-content/swiper-slide-content.component";
import { IonSlides } from "@ionic/angular";
import { DomController } from "@ionic/angular";
import { Platform, IonContent, IonHeader } from "@ionic/angular";
import { AfterViewInit } from "@angular/core";
import { ElementRef, ViewChild } from "@angular/core";
import { OnDestroy } from "@angular/core";
import { Subscription, fromEvent } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { OrderService, OrderDetailModel } from "src/app/order/order.service";
import { Component, OnInit } from "@angular/core";
import { MOCK_CAR_ORDER_DETAIL_DATA } from "../mock-data";
import { TmcEntity, TmcService } from "src/app/tmc/tmc.service";
import { OrderEntity, OrderStatusType } from "../models/OrderEntity";
import { AppHelper } from "src/app/appHelper";
import { OrderPayStatusType } from "../models/OrderInsuranceEntity";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { OrderCarEntity } from "../models/OrderCarEntity";
import { environment } from "src/environments/environment";
import { TaskStatusType } from "src/app/workflow/models/TaskStatusType";
interface ITab {
  label: string;
  value: number;
  active?: boolean;
}
@Component({
  selector: "app-order-car-detail-df",
  templateUrl: "./order-car-detail_df.page.html",
  styleUrls: ["./order-car-detail_df.page.scss"],
})
export class CarOrderDetailDfPage implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  private orderId: string;
  private OrderPayStatusType = OrderPayStatusType;
  OrderStatusType = OrderStatusType;
  OrderItemHelper = OrderItemHelper;
  TaskStatusType = TaskStatusType;
  @ViewChild(IonContent) content: IonContent;
  tmc: TmcEntity;
  orderDetail: OrderDetailModel;
  tabs: ITab[] = [];
  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private plt: Platform,
    private tmcService: TmcService,
  ) {

  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onPay() {
    this.tmcService.payOrder(this.orderDetail.Order.Id).catch(() => 0);
  }
  ngOnInit() {
    this.initTabs();
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((q) => {
        // if (!environment.production) {
        //   this.loadOrderDetail(this.orderId);
        // }
        this.orderId = q.get("Id");
        if (this.orderId) {
          this.loadOrderDetail(this.orderId);
        }
      })
    );
    this.tmcService
      .getTmc()
      .then((tmc) => {
        this.tmc = tmc;
      })
      .catch(() => 0);
  }
  getVariableObj(
    it: { Variables: string; VariablesDictionary: any },
    key: string
  ) {
    if (it) {
      it.VariablesDictionary =
        it.VariablesDictionary || (it.Variables ? JSON.parse(it.Variables) : {});
      return it.VariablesDictionary[key];
    }
  }
  async ngAfterViewInit() {}
  private initTabs() {
    this.tabs = [];
    this.tabs.push({ label: "订单信息", value: 0 });
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderCars
    ) {
      this.orderDetail.Order.OrderCars.forEach((it, idx) => {
        // if (it.VariablesJsonObj.isShow) {
        this.tabs.push({ label: it.Id, value: idx + 1 });
        // }
      });
    }
  }
  getTotalAmount(order: OrderEntity) {
    const Tmc = this.tmc;
    if (!Tmc || !order) {
      return 0;
    }
    let amount = 0;
    if (Tmc.IsShowServiceFee || order.Status == OrderStatusType.Cancel) {
      amount = order.OrderItems.reduce(
        (acc, it) => (acc += AppHelper.add(acc, +it.Amount)),
        0
      );
    } else {
      amount = order.OrderItems.filter((it) => !it.Tag.endsWith("Fee")).reduce(
        (acc, it) => (acc += AppHelper.add(acc, +it.Amount)),
        0
      );
    }
    return amount < 0 ? 0 : amount;
  }
  getTotalAmountByKey(order: OrderEntity, key: string) {
    const Tmc = this.tmc;
    if (!order.OrderItems || !Tmc) {
      return 0;
    }
    let amount = 0;
    if (Tmc.IsShowServiceFee || order.Status == OrderStatusType.Cancel) {
      amount = order.OrderItems.filter((it) => it.Key == key).reduce(
        (acc, it) => (acc += AppHelper.add(acc, +it.Amount)),
        0
      );
    } else {
      amount = order.OrderItems.filter(
        (it) => it.Key == key && !it.Tag.endsWith("Fee")
      ).reduce((acc, it) => (acc += AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount;
  }
  getUseCarAmount(order: OrderEntity, key: string) {
    if (!order.OrderItems) {
      return 0;
    }
    return order.OrderItems.filter(
      (it) => it.Key == key && it.Tag == OrderItemHelper.Car
    ).reduce((acc, it) => (acc += AppHelper.add(acc, +it.Amount)), 0);
  }
  getFeeAmount(order: OrderEntity, key: string) {
    if (!order || !order.OrderItems) {
      return 0;
    }
    return order.OrderItems.filter(
      (it) => it.Key == key && it.Tag.includes("Fee")
    ).reduce((acc, it) => (acc += AppHelper.add(acc, +it.Amount)), 0);
  }
  getOtherAmount(order: OrderEntity, key: string) {
    if (!order || !order.OrderItems) {
      return 0;
    }
    return order.OrderItems.filter(
      (it) => it.Key == key && it.Tag == OrderItemHelper.CarItem
    ).reduce((acc, it) => (acc += AppHelper.add(acc, +it.Amount)), 0);
  }
  getOrderNumbers() {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderNumbers &&
      this.orderDetail.Order.OrderNumbers.filter(
        (it) => it.Tag == "TmcOutNumber"
      )
    );
  }
  getPayAmount(order: OrderEntity) {
    const Tmc = this.tmc;
    if (!Tmc || !order || !order.OrderPays) {
      return 0;
    }
    let amount = 0;
    amount = order.OrderPays.filter(
      (it) => it.Status == OrderPayStatusType.Effective
    ).reduce((acc, it) => (acc += AppHelper.add(acc, +it.Amount)), 0);
    if (amount == 0) {
      return 0;
    }
    if (Tmc.IsShowServiceFee || !order.OrderItems) {
      return amount;
    } else {
      return (
        amount -
        order.OrderItems.filter((it) => !it.Tag.endsWith("Fee")).reduce(
          (acc, it) => (acc += AppHelper.add(acc, +it.Amount)),
          0
        )
      );
    }
  }
  getServicetip(order: OrderEntity) {
    const Tmc = this.tmc;
    if (!Tmc || !order || !order.OrderPays) {
      return 0;
    }

    if (Tmc.IsShowServiceFee) {
      let tip = order.OrderItems.find((item) => item.Tag == "CarOnlineFee");
      return tip && tip.Amount;
      //  order.OrderItems.forEach(item=>{
      //    if(item.Tag="CarOnlineFee"){

      //    }
      //  })
    }
  }
  private loadOrderDetail(id: string) {
    // if (!environment.production) {
    //   this.orderDetail = {
    //     Order: MOCK_CAR_ORDER_DETAIL_DATA
    //   } as any;
    //   console.log("orderdetail", this.orderDetail);
    //   this.initOrderCarTravel();
    //   return;
    // }
    this.subscription.unsubscribe();
    this.subscription = this.orderService
      .getOrderDetail(id)
      .subscribe((res) => {
        this.orderDetail = res && res.Data;
        this.initOrderCarTravel();
      });
  }
  private initOrderCarTravel() {
    this.initTabs();
    if (this.orderDetail && this.orderDetail.Order) {
      if (
        this.orderDetail.Order.OrderCars &&
        this.orderDetail.Order.OrderTravels
      ) {
        this.orderDetail.Order.OrderCars = this.orderDetail.Order.OrderCars.map(
          (it) => {
            const oneTravel = this.orderDetail.Order.OrderTravels.find(
              (t) => t.Key == it.Key
            );
            if (oneTravel && !it.OrderTravel) {
              it.OrderTravel = oneTravel;
            }
            return it;
          }
        );
      }
    }
  }
}
