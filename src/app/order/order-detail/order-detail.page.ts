import { IdentityEntity } from 'src/app/services/identity/identity.entity';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { OrderInsuranceEntity } from './../models/OrderInsuranceEntity';
import { SelectTicketPopoverComponent } from "./../components/select-ticket-popover/select-ticket-popover.component";
import { SendEmailComponent } from "../components/send-email/send-email.component";
import { OrderFlightTicketEntity } from "../models/OrderFlightTicketEntity";
import { CalendarService } from "../../tmc/calendar.service";
import { TmcEntity } from "../../tmc/tmc.service";
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
import { ProductItem, ProductItemType } from "../../tmc/models/ProductItems";
import { TmcService } from "../../tmc/tmc.service";
import { OrderDetailModel, OrderService } from "src/app/order/order.service";
import { OrderPayStatusType } from "src/app/order/models/OrderInsuranceEntity";
import * as moment from "moment";
import { OrderItemPricePopoverComponent } from "../components/order-item-price-popover/order-item-price-popover.component";
import { OrderPassengerEntity } from "src/app/order/models/OrderPassengerEntity";
import { OrderNumberEntity } from "src/app/order/models/OrderNumberEntity";
import { SendMsgComponent } from "../components/send-msg/send-msg.component";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { AppHelper } from "src/app/appHelper";
import { OrderFlightTripStatusType } from "../models/OrderFlightTripStatusType";
import { OrderEntity, OrderItemEntity } from "../models/OrderEntity";
import { OrderFlightTripEntity } from "../models/OrderFlightTripEntity";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { OrderPayEntity } from "../models/OrderPayEntity";

export interface TabItem {
  label: string;
  value: number;
  isActive?: boolean;
  rect?: ClientRect;
}

@Component({
  selector: "app-order-detail",
  templateUrl: "./order-detail.page.html",
  styleUrls: ["./order-detail.page.scss"]
})
export class OrderDetailPage implements OnInit, AfterViewInit {
  tmc: TmcEntity;
  title: string;
  tab: ProductItem;
  ProductItemType = ProductItemType;
  items: { label: string; value: string }[] = [];
  tabs: TabItem[] = [];
  orderDetail: OrderDetailModel;
  isLoading = false;
  @ViewChildren("info") tabEles: QueryList<IonButton>;
  @ViewChildren("link") linkEles: QueryList<IonList>;
  @ViewChild("infos") infosContainer: ElementRef<HTMLElement>;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChild("cnt") ionContent: IonContent;
  scrollElement: HTMLElement;
  selectedTicket: OrderFlightTicketEntity
  constructor(
    private plt: Platform,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private domCtrl: DomController,
    private orderService: OrderService
  ) { }
  scrollTop: number;

  compareFn(t1: OrderFlightTicketEntity, t2: OrderFlightTicketEntity) {
    return t1 && t2 && t1.Id == t2.Id;
  }
  getTravelFlightTrips() {
    let infos: OrderFlightTripEntity[] = [];
    if (!this.orderDetail || !this.orderDetail.Order || !this.orderDetail.Order.OrderFlightTickets)
      return infos;
    this.orderDetail.Order.OrderFlightTickets.forEach(ticket => {
      if (ticket.OrderFlightTrips) {
        ticket.OrderFlightTrips.forEach(flightTrip => {
          if (flightTrip.Status == OrderFlightTripStatusType.Normal)
            infos.push(flightTrip);
        })
      }
    });
    infos.sort((a, b) => new Date(a.TakeoffTime).getTime() - new Date(b.TakeoffTime).getTime());
    return infos;
  }
  canSendEmailMsg() {
    const selectedTicket: OrderFlightTicketEntity = this.selectedTicket;
    if (selectedTicket) {
      return (
        selectedTicket.Status != OrderFlightTicketStatusType.Abolish &&
        selectedTicket.Status != OrderFlightTicketStatusType.Abolishing
      );
    }
    return false;
  }
  async sendMsg(passenger: OrderPassengerEntity) {
    const selectedTicket = this.selectedTicket;
    if (selectedTicket) {
      const p = await this.modalCtrl.create({
        component: SendMsgComponent,
        componentProps: {
          defaultMobile: passenger.Mobile,
          orderTicketId: selectedTicket.Id
        }
      });
      await p.present();
      const result = await p.onDidDismiss();
      if (result && result.data) {
        const data = result.data as {
          mobiles: string[];
          content: string;
        };
        const res = await this.tmcService.sendSms(
          data.mobiles,
          data.content,
          this.orderDetail.Order && this.orderDetail.Order.Id
        );
        if (res.Status) {
          AppHelper.alert("短信已发送");
        } else {
          AppHelper.alert(res.Message || "短信发送失败");
        }
      }
    }
  }
  getPassengerCostOrgInfo(p: OrderPassengerEntity) {
    if (!p || !this.orderDetail.Order) {
      return;
    }
    const ticket = this.selectedTicket;
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      ticket
    ) {
      let CostCenterCode: string;
      let CostCenterName: string;
      let OrganizationCode: string;
      let OrganizationName: string;
      const orderTravels = this.orderDetail.Order.OrderTravels || [];
      const IllegalPolicy = orderTravels
        .filter(it => it.Key == ticket.Key)
        .map(it => it.IllegalPolicy)
        .join(",");
      const IllegalReason = orderTravels
        .filter(it => it.Key == ticket.Key)
        .map(it => it.IllegalReason)
        .join(",");
      const OutNumbers = this.getOrderNumbers().concat(
        this.getOrderNumbers("OutNumber")
      )
      if (
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderTravels
      ) {
        CostCenterCode = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticket.Key
        )
          .map(it => it.CostCenterCode)
          .join(",");
        CostCenterName = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticket.Key
        )
          .map(it => it.CostCenterName)
          .join(",");
        OrganizationCode = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticket.Key
        )
          .map(it => it.OrganizationCode)
          .join(",");
        OrganizationName = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticket.Key
        )
          .map(it => it.OrganizationName)
          .join(",");
      }
      return {
        CostCenterCode,
        CostCenterName,
        OrganizationCode,
        OrganizationName,
        IllegalPolicy,
        IllegalReason,
        OutNumbers
      };
    }
    return null;
  }
  private getOrderNumbers(tag = "TmcOutNumber"): OrderNumberEntity[] {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderNumbers
    ) {
      return [];
    }
    return this.orderDetail.Order.OrderNumbers.filter(it => it.Tag == tag);
  }
  async sendEmail(passenger: OrderPassengerEntity) {
    const selectedTicket = this.selectedTicket;
    if (selectedTicket) {
      const p = await this.modalCtrl.create({
        component: SendEmailComponent,
        componentProps: {
          defaultEmail: passenger.Email,
          orderTicketId: selectedTicket.Id
        }
      });
      await p.present();
      const result = await p.onDidDismiss();
      if (result && result.data) {
        const data = result.data as {
          emails: string[];
          subject: string;
          content: string;
        };
        const res = await this.tmcService.sendEmail(
          data.emails,
          data.subject,
          data.content,
          this.orderDetail.Order && this.orderDetail.Order.Id
        );
        if (res.Status) {
          AppHelper.alert("邮件已发送");
        } else {
          AppHelper.alert(res.Message || "邮件发送失败");
        }
      }
    }
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
        label: "出行信息",
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
      },
      {
        label: "联系信息",
        value: 6,
        isActive: false,
        rect: null
      }
    ];
    this.route.queryParamMap.subscribe(q => {
      if (q.get("tab")) {
        this.tab = this.tab || JSON.parse(q.get("tab"));
        this.title = this.tab.label + "订单";
        if (!(this.tab.value == ProductItemType.train || this.tab.value == ProductItemType.plane)) {
          this.tabs = this.tabs.filter(it => it.label != '保险信息');
        }
      }
      if (q.get("orderId")) {
        this.getOrderInfo(q.get("orderId"));
      }
    });
    this.onTabActive(this.tabs[0]);
    this.tmc = await this.tmcService.getTmc();
  }
  getVariableObj(it: { Variables: string; VariablesDictionary: any }, key: string) {
    if (it) {
      it.VariablesDictionary = it.VariablesDictionary || JSON.parse(it.Variables) || {};
      return it.VariablesDictionary[key];
    }
  }
  getHotelServiceFee(orderHotelKey: string) {
    return this.orderDetail
      && this.orderDetail.Order.OrderItems
      && this.orderDetail.Order.OrderItems
        .filter(it => it.Key == orderHotelKey && (it.Tag || "").includes("Fee"))
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
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
  private async getOrderInfo(orderId: string) {
    if (!orderId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.orderDetail = await this.orderService.getOrderDetailAsync(orderId).catch(_ => null);
    this.isLoading = false;
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc(true);
    }
    if (this.orderDetail) {
      if (
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderFlightTickets &&
        this.orderDetail.Order.OrderFlightTickets.length
      ) {
        const tickets = this.orderDetail.Order.OrderFlightTickets.slice(0);
        tickets.sort((ta, tb) => {
          return (
            new Date(tb.InsertTime).getTime() -
            new Date(ta.InsertTime).getTime()
          );
        });
        if (tickets) {
          this.selectedTicket = tickets[0];
        }
      }
      if (this.orderDetail.Order) {
        this.orderDetail.Order.InsertDateTime = this.transformTime(
          this.orderDetail.Order.InsertTime
        );
      }
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
  getOrderTotalAmount() {
    let amount = 0;
    const order = this.orderDetail && this.orderDetail.Order;
    const Tmc = this.tmc;
    if (!Tmc || !order || !order.OrderItems)
      return amount;
    if (Tmc.IsShowServiceFee) {
      amount = order.OrderItems
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    } else {
      amount = order.OrderItems
        .filter(it => !(it.Tag || "").endsWith("Fee"))
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount < 0 ? 0 : amount;
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
  getOrderPayAmount() {
    const Tmc = this.tmc;
    let amount = 0;
    const order = this.orderDetail && this.orderDetail.Order;
    if (!Tmc || !order) { return amount; }
    amount = (order.OrderPays || [])
      .filter(it => it.Status == OrderPayStatusType.Effective)
      .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    if (amount == 0) { return amount; }
    if (Tmc.IsShowServiceFee || !order.OrderItems) {
      return amount;
    }
    else {
      return amount - (order.OrderItems || [])
        .filter(it => !(it.Tag || "").endsWith("Fee"))
        .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
  }
  getTabByLabel(label: string) {
    return this.tabs && this.tabs.find(it => it.label && it.label.includes(label));
  }
  getInsuranceAmount() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderItems ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return 0;
    }
    const flightTripkeys: string[] = [];
    this.orderDetail.Order.OrderFlightTickets.forEach(t => {
      if (t.OrderFlightTrips) {
        t.OrderFlightTrips.forEach(trip => {
          if (!flightTripkeys.find(k => k == trip.Key)) {
            flightTripkeys.push(trip.Key);
          }
        })
      }
    });
    const keys = this.orderDetail.Order.OrderInsurances.filter(
      it => !!flightTripkeys.find(k => k == it.AdditionKey)
    ).map(it => it.Key);
    const insuranceAmount = this.orderDetail.Order.OrderItems.filter(it =>
      keys.find(k => k == it.Key)
    ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    return insuranceAmount;
  }
  async showPricePopover() {
    const Tmc = this.tmc;
    if (!Tmc) {
      return `0`;
    }
    let orderItems =
      this.orderDetail.Order && this.orderDetail.Order.OrderItems;
    if (!Tmc.IsShowServiceFee) {
      orderItems = orderItems.filter(it => !(it.Tag || "").endsWith("Fee"));
    }
    const p = await this.popoverCtrl.create({
      component: OrderItemPricePopoverComponent,
      componentProps: {
        insurance: this.getInsuranceAmount(),
        IsShowServiceFee: Tmc.IsShowServiceFee,
        orderItems,
        amount: orderItems.reduce(
          (acc, item) => (acc = AppHelper.add(acc, +item.Amount)),
          0
        )
      }
    });
    p.present();
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

