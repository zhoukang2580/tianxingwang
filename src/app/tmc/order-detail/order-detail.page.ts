import { TmcEntity } from "./../tmc.service";
import { OrderModel } from "src/app/order/models/OrderModel";
import {
  NavController,
  Platform,
  IonButton,
  IonList,
  IonContent
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  QueryList,
  ViewChildren,
  AfterViewInit
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ProductItem } from "../models/ProductItems";
import { TmcService } from "../tmc.service";
import { OrderDetailModel } from "src/app/order/order.service";
import { OrderEntity } from "src/app/order/models/OrderEntity";
import { OrderPayStatusType } from "src/app/order/models/OrderInsuranceEntity";
import { OrderFlightTripStatusType } from "src/app/order/models/OrderFlightTripStatusType";
import { OrderFlightTripEntity } from "src/app/order/models/OrderFlightTripEntity";
interface TabItem {
  label: string;
  value: number;
  isActive?: boolean;
  rect?: ClientRect;
  linkRect?: ClientRect;
  linkEle?: HTMLElement;
}
class CombineInfo extends OrderDetailModel {
  trips: OrderFlightTripEntity[];
}
@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.page.html",
  styleUrls: ["./order-detail.page.scss"]
})
export class OrderDetailPage implements OnInit, AfterViewInit {
  title: string;
  tab: ProductItem;
  items: { label: string; value: string }[] = [];
  tabs: TabItem[] = [];
  orderDetail: CombineInfo = new CombineInfo();
  tmc: TmcEntity;
  @ViewChildren("info") tabEles: QueryList<IonButton>;
  @ViewChildren("link") linkEles: QueryList<IonList>;
  @ViewChild("infos") infosContainer: ElementRef<HTMLElement>;
  @ViewChild("cnt") ionContent: IonContent;
  scrollElement: HTMLElement;
  constructor(
    private plt: Platform,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private tmcService: TmcService
  ) {}
  scrollTop: number;
  /// <summary>
  ///
  /// </summary>
  /// <returns></returns>
  public getTravelFlightTrips(order: OrderEntity) {
    const trips: OrderFlightTripEntity[] = [];
    if (!order || !order.OrderFlightTickets) {
      return trips;
    }
    order.OrderFlightTickets.forEach(ticket => {
      if (ticket.OrderFlightTrips) {
        ticket.OrderFlightTrips.forEach(trip => {
          if (trip.Status == OrderFlightTripStatusType.Normal) {
            trips.push(trip);
          }
        });
      }
    });

    trips.sort(
      (t1, t2) =>
        new Date(t1.TakeoffTime).getTime() - new Date(t2.TakeoffTime).getTime()
    );
    return trips;
  }
  async ngOnInit() {
    this.tabs = [
      {
        label: "订单信息",
        value: 1,
        isActive: false,
        rect: null
      },
      {
        label: "航班信息",
        value: 2,
        isActive: false,
        rect: null
      },
      {
        label: "旅客信息",
        value: 3,
        isActive: false,
        rect: null
      },
      {
        label: "保险信息",
        value: 4,
        isActive: false,
        rect: null
      },
      {
        label: "审批记录",
        value: 5,
        isActive: false,
        rect: null
      }
    ];
    this.route.queryParamMap.subscribe(q => {
      if (q.get("tab")) {
        this.tab = JSON.parse(q.get("tab"));
        this.title = this.tab.label;
      }
      if (q.get("orderId")) {
        this.getOrderInfo(q.get("orderId"));
      }
    });
    this.onTabActive(this.tabs[0]);
    this.tmc = await this.tmcService.getTmc(true);
  }
  private async getOrderInfo(orderId: string) {
    this.orderDetail = await this.tmcService
      .getOrderDetail(orderId)
      .then(r => r as CombineInfo)
      .catch(_ => new CombineInfo());
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc(true);
    }
    if (this.orderDetail) {
      if (this.orderDetail.Order) {
        this.orderDetail.trips = this.getTravelFlightTrips(
          this.orderDetail.Order
        );
        this.orderDetail.Order.InsertDateTime = this.transformTime(
          this.orderDetail.Order.InsertTime
        );
        this.orderDetail.Order.VariablesJsonObj = this.orderDetail.Order
          .Variables
          ? JSON.parse(this.orderDetail.Order.Variables)
          : {};
      }
      this.orderDetail.TotalAmount = this.getTotalAmount(
        this.orderDetail.Order
      );
      this.orderDetail.PayAmount = this.getPayAmount(this.orderDetail.Order);
      if (this.orderDetail.Histories) {
        this.orderDetail.Histories = this.orderDetail.Histories.map(h => {
          if (h.ExpiredTime) {
            h.ExpiredTime = this.transformTime(h.ExpiredTime);
          }
          if (h.InsertTime) {
            h.InsertDateTime = this.transformTime(h.InsertTime);
          }
          return h;
        });
      }
    }
  }
  private transformTime(datetime: string) {
    if (datetime && datetime.includes("T")) {
      const [date, time] = datetime.split("T");
      if (date && time) {
        return `${date} ${time.substring(0, time.lastIndexOf(":"))}`;
      }
    }
    return datetime;
  }
  private getPayAmount(order: OrderEntity) {
    if (!order || !this.tmc) {
      return `0`;
    }
    let amount = 0;
    if (order.OrderPays) {
      amount = order.OrderPays.filter(
        it => it.Type != "SelfPay" && it.Status == OrderPayStatusType.Effective
      ).reduce((acc, it) => (acc += +it.Amount), 0);
    }
    if (amount == 0) {
      return `0`;
    }
    if (this.tmc.IsShowServiceFee || !order.OrderItems) {
      return `${amount}`;
    } else {
      return `${amount -
        (order.OrderItems || [])
          .filter(it => !(it.Tag || "").endsWith("Fee"))
          .reduce((acc, it) => (acc += +it.Amount), 0)}`;
    }
  }
  private getTotalAmount(order: OrderEntity) {
    const Tmc = this.tmc;
    if (!Tmc || !order) {
      return `0`;
    }
    let amount = 0;
    if (Tmc.IsShowServiceFee) {
      amount = (order.OrderItems || []).reduce(
        (acc, it) => (acc += +it.Amount),
        0
      );
    } else {
      amount = (order.OrderItems || [])
        .filter(it => !(it.Tag || "").endsWith("Fee"))
        .reduce((acc, it) => (acc += +it.Amount), 0);
    }
    return `${amount < 0 ? 0 : amount}`;
  }
  back() {
    this.navCtrl.back();
  }
  onTabActive(tab: TabItem) {
    this.tabs.forEach(t => (t.isActive = false));
    tab.isActive = true;
    this.moveTabToCenter(tab);
    this.moveTargetLinkToView(tab);
  }
  async ngAfterViewInit() {
    if (this.ionContent) {
      this.scrollElement = await this.ionContent.getScrollElement();
    }
    if (this.linkEles) {
      this.linkEles.forEach(l => {
        const rect = l["el"] && l["el"].getBoundingClientRect();
        const tabid = l["el"].getAttribute("tabid");
        const tab = this.tabs.find(t => t.value == +tabid);
        if (tab) {
          tab.linkRect = rect;
          tab.linkEle = l["el"];
        }
      });
    }
  }
  onScroll() {
    if (this.scrollElement) {
      const scrollTop = (this.scrollTop = this.scrollElement.scrollTop);
      const activeTab = this.tabs.find(
        t =>
          t.linkRect &&
          t.linkEle &&
          scrollTop >= t.linkRect.top &&
          scrollTop < t.linkRect.bottom
      );
      if (activeTab) {
        this.moveTabToCenter(activeTab);
      }
    }
  }
  private moveTargetLinkToView(tab: TabItem) {
    if (this.linkEles) {
      const activeLink = this.linkEles.find(
        l => l["el"] && l["el"].getAttribute("tabid") == `${tab.value}`
      );
      if (activeLink && activeLink["el"]) {
        const rect = activeLink["el"].getBoundingClientRect();
        if (this.ionContent) {
          this.ionContent.scrollByPoint(0, rect.top, 100);
        }
      }
    }
  }
  private moveTabToCenter(tab: TabItem) {
    this.tabs.forEach(t => (t.isActive = false));
    tab.isActive = true;
    if (this.infosContainer && this.tabEles) {
      const el = this.tabEles.find(
        item => item["el"].getAttribute("tabid") == `${tab.value}`
      );
      const activeTabEle = el && el["el"];
      if (activeTabEle) {
        const elRect = activeTabEle.getBoundingClientRect();
        tab.rect = elRect;
      }
      if (tab.rect) {
        const dist = tab.rect.width / 2 + tab.rect.left - this.plt.width() / 2;
        // console.dir(dist);
        this.infosContainer.nativeElement.scrollBy({
          left: dist,
          top: 0,
          behavior: "smooth"
        });
      }
    }
  }
}
