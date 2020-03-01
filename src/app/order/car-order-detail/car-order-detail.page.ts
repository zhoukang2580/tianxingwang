import { SwiperSlideContentComponent } from './../components/swiper-slide-content/swiper-slide-content.component';
import { IonSlides } from '@ionic/angular';
import { DomController } from '@ionic/angular';
import { Platform, IonContent, IonHeader } from '@ionic/angular';
import { AfterViewInit } from '@angular/core';
import { ElementRef, ViewChild } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { OrderService, OrderDetailModel } from 'src/app/order/order.service';
import { Component, OnInit } from '@angular/core';
import { MOCK_CAR_ORDER_DETAIL_DATA } from '../mock-data';
type LabelValue = "baseInfo" | "rentalInfo" | "passengerInfo" | "priceInfo" | "approveInfo" | "orderLogInfo";
interface ITab {
  label: string;
  value: LabelValue;
  active?: boolean;
}
@Component({
  selector: 'app-car-order-detail',
  templateUrl: './car-order-detail.page.html',
  styleUrls: ['./car-order-detail.page.scss'],
})
export class CarOrderDetailPage implements OnInit, OnDestroy, AfterViewInit {
  private subscription = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  private orderId: string;
  
  @ViewChild(IonContent) content: IonContent;

  orderDetail: OrderDetailModel;
  tabs: ITab[];
  tab: ITab;
  constructor(private orderService: OrderService,
    private route: ActivatedRoute,
    private plt: Platform) { }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
  ngOnInit() {
    this.initTabs();
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(this.route.queryParamMap.subscribe(q => {
      this.orderId = q.get("Id");
      if (this.orderId) {
        this.loadOrderDetail(this.orderId);
      }
    }));
  }
  async  ngAfterViewInit() {

  }
  private initTabs() {
    this.tabs = [];
    this.tabs.push({ label: "基础信息", value: 'baseInfo' });
    this.tabs.push({ label: "租车信息", value: "rentalInfo" });
    this.tabs.push({ label: "乘客信息", value: "passengerInfo" });
    this.tabs.push({ label: "票价/成本信息", value: "priceInfo" });
    this.tabs.push({ label: "审批记录", value: "approveInfo" });
    this.tabs.push({ label: "订单日志", value: "orderLogInfo" });
    this.tab = this.tabs[0];
    this.tab.active = true;
  }
  
  private loadOrderDetail(id: string) {
    this.orderDetail = {
      Order: MOCK_CAR_ORDER_DETAIL_DATA,
    } as any
    console.log("orderdetail", this.orderDetail)
    // this.subscription.unsubscribe();
    // this.subscription = this.orderService.getOrderDetail(id).subscribe(res => {
    //   this.orderDetail = res && res.Data;
    // })
  }
}
