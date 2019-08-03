import { OrderFlightTicketEntity } from "./../../order/models/OrderFlightTicketEntity";
import { FlydayService } from "./../../flight/flyday.service";
import { TmcEntity } from "./../tmc.service";
import {
  NavController,
  Platform,
  IonButton,
  IonList,
  IonContent,
  ModalController,
  PopoverController,
  IonHeader,
  DomController
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
import * as moment from "moment";
import { OrderItemPricePopoverComponent } from "../components/order-item-price-popover/order-item-price-popover.component";
import { OrderPassengerEntity } from "src/app/order/models/OrderPassengerEntity";
import { OrderNumberEntity } from "src/app/order/models/OrderNumberEntity";
import { OrderTrainTicketEntity } from "src/app/order/models/OrderTrainTicketEntity";
export class OrderTripTicketModel {
  trip: OrderFlightTripEntity;
  ticket: OrderFlightTicketEntity;
  order: OrderEntity;
  CostCenterName: string;
  CostCenterCode: string;
  OrganizationName: string;
  OrganizationCode: string;
  IllegalPolicy: string;
  IllegalReason: string;
  passenger: OrderPassengerEntity;
  OutNumbers: OrderNumberEntity[];
}
export interface TabItem {
  label: string;
  value: number;
  isActive?: boolean;
  rect?: ClientRect;
  linkRect?: ClientRect;
  linkEle?: HTMLElement;
}
class CombineInfo extends OrderDetailModel {
  trips: OrderTripTicketModel[];
  exchangeFlightTrips: OrderTripTicketModel[];
  TotalAmount: string;
  PayAmount: string;
  insuranceAmount: string;
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
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChild("cnt") ionContent: IonContent;
  scrollElement: HTMLElement;
  constructor(
    private plt: Platform,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private flydayService: FlydayService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private domCtrl: DomController
  ) {}
  scrollTop: number;
  private getOrderNumbers(
    order: OrderEntity,
    tag = "TmcOutNumber"
  ): OrderNumberEntity[] {
    if (!order || !order.OrderNumbers) {
      return [];
    }
    return order.OrderNumbers.filter(it => it.Tag == tag);
  }
  private getTravelFlightTrips(order: OrderEntity) {
    const trips: OrderTripTicketModel[] = [];
    const exchangeFlightTrips: OrderTripTicketModel[] = [];
    if (!order || !order.OrderFlightTickets) {
      return trips;
    }
    order.OrderFlightTickets.forEach(ticket => {
      ticket.LastIssueTime = this.transformTime(ticket.LastIssueTime);
      if (ticket.OrderFlightTrips && order.OrderTravels) {
        ticket.OrderFlightTrips.forEach(trip => {
          const m = moment(trip.TakeoffTime);
          const d = this.flydayService.generateDayModel(m);
          trip.TakeoffDate = `${m.format("YYYY年MM月DD日")}(${
            d.dayOfWeekName
          })`;
          trip.TakeoffShortTime = this.transformTime(trip.TakeoffTime);
          trip.ArrivalShortTime = this.transformTime(trip.ArrivalTime);
          const info: OrderTripTicketModel = {
            passenger:
              order.OrderPassengers &&
              order.OrderPassengers.find(
                p => p.Id == (ticket.Passenger && ticket.Passenger.Id)
              ),
            trip,
            ticket,
            order,
            CostCenterName: order.OrderTravels.filter(
              it => it.Key == ticket.Key
            )
              .map(it => it.CostCenterName)
              .join(","),
            CostCenterCode: order.OrderTravels.filter(
              it => it.Key == ticket.Key
            )
              .map(it => it.CostCenterCode)
              .join(","),
            OrganizationCode: order.OrderTravels.filter(
              it => it.Key == ticket.Key
            )
              .map(it => it.OrganizationCode)
              .join(","),
            OrganizationName: order.OrderTravels.filter(
              it => it.Key == ticket.Key
            )
              .map(it => it.OrganizationName)
              .join(","),
            IllegalPolicy: order.OrderTravels.filter(it => it.Key == ticket.Key)
              .map(it => it.IllegalPolicy)
              .join(","),
            IllegalReason: order.OrderTravels.filter(it => it.Key == ticket.Key)
              .map(it => it.IllegalReason)
              .join(","),
            OutNumbers: this.getOrderNumbers(order)
          };
          if (trip.Status == OrderFlightTripStatusType.Normal) {
            trips.push(info);
          }
          if (
            trip.Status == OrderFlightTripStatusType.Exchange &&
            (new Date(trip.InsertTime).getTime() <
              new Date(ticket.IssueTime).getTime() ||
              ticket.IssueTime.startsWith("1800"))
          ) {
            exchangeFlightTrips.push(info);
          }
        });
      }
    });

    trips.sort(
      (t1, t2) =>
        new Date(t1.trip.TakeoffTime).getTime() -
        new Date(t2.trip.TakeoffTime).getTime()
    );
    this.orderDetail.exchangeFlightTrips = exchangeFlightTrips;
    return trips;
  }
  async showPricePopover() {
    const orderItems =
      this.orderDetail.Order && this.orderDetail.Order.OrderItems;
    const p = await this.popoverCtrl.create({
      component: OrderItemPricePopoverComponent,
      componentProps: {
        orderItems,
        amount:
          orderItems && orderItems.reduce((acc, it) => (acc += +it.Amount), 0)
      }
    });
    p.present();
  }
  getPassengerInfo(passenger: OrderPassengerEntity) {
    if (!passenger) {
      return null;
    }
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers
    ) {
      const p = this.orderDetail.Order.OrderPassengers.find(
        it => it.Id == passenger.Id
      );
      const t =
        this.orderDetail.trips &&
        this.orderDetail.trips.find(t => t.passenger.Id == passenger.Id);
      return {
        ...p,
        ...t
      };
    }
    return null;
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
  private getInsuranceAmount(
    order: OrderEntity,
    ticket: OrderTrainTicketEntity
  ) {
    if (!order || !order.OrderInsurances) {
      return 0;
    }
    const trainTripkeys = ticket.OrderTrainTrips.map(t => t.Key);
    const keys = order.OrderInsurances.filter(
      it => !!trainTripkeys.find(trainKey => trainKey == it.AdditionKey)
    ).map(it => it.Key);
    const insuranceAmount = order.OrderItems.filter(it =>
      keys.find(k => k == it.Key)
    ).reduce((acc, it) => (acc += +it.Amount), 0);
    return insuranceAmount;
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
      console.log("ngAfterViewInit", this.tabs);
    }
  }
  onScrollEnd() {
    if (this.scrollElement) {
      const headerHeight =
        (this.headerEle &&
          this.headerEle["el"] &&
          this.headerEle["el"].clientHeight) ||
        112;
      const scrollTop =
        (this.scrollTop = this.scrollElement.scrollTop) + headerHeight;
      let activeTab: TabItem;
      const linkEles = this.linkEles.toArray();
      for (let i = 0; i < linkEles.length; i++) {
        const el = linkEles[i]["el"];
        const rect = el && el.getBoundingClientRect();
        if (el && rect) {
          if (rect.top - headerHeight >= 0 || rect.bottom - headerHeight >= 0) {
            activeTab = this.tabs.find(
              t => t.value == +el.getAttribute("tabid")
            );
            break;
          }
        }
      }
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
        const headerHeight =
          (this.headerEle &&
            this.headerEle["el"] &&
            this.headerEle["el"].clientHeight) ||
          112;
        if (this.ionContent) {
          this.ionContent
            .scrollByPoint(0, rect.top - headerHeight, 100)
            .then(_ => {
              // this.onScroll();
            });
        }
      }
    }
  }
  private moveTabToCenter(tab: TabItem) {
    // console.log("moveTabToCenter ", tab.label);
    this.tabs.forEach(t => (t.isActive = false));
    tab.isActive = true;
    if (this.infosContainer && this.tabEles) {
      this.domCtrl.read(_ => {
        const el = this.tabEles.find(
          item => item["el"].getAttribute("tabid") == `${tab.value}`
        );
        const activeTabEle = el && el["el"];
        if (activeTabEle) {
          const elRect = activeTabEle.getBoundingClientRect();
          tab.rect = elRect;
        }
        this.domCtrl.write(_ => {
          if (tab.rect) {
            const dist =
              tab.rect.width / 2 + tab.rect.left - this.plt.width() / 2;
            // console.dir(dist);
            this.infosContainer.nativeElement.scrollBy({
              left: dist,
              top: 0,
              behavior: "smooth"
            });
          }
        });
      });
    }
  }
}
