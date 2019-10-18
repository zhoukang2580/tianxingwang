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
import { ProductItem } from "../../tmc/models/ProductItems";
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
  title: string;
  tab: ProductItem;
  items: { label: string; value: string }[] = [];
  tabs: TabItem[] = [];
  orderDetail: OrderDetailModel;
  tmc: TmcEntity;
  selectedTicket: OrderFlightTicketEntity;
  viewModel: ITicketViewModelItem;
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
    private flydayService: CalendarService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private domCtrl: DomController,
    private orderService: OrderService
  ) {}
  scrollTop: number;
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
  async onSelectTicket(vm: ITicketViewModelItem) {
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderFlightTickets &&
      this.orderDetail.Order.OrderFlightTickets.length > 1
    ) {
      const p = await this.popoverCtrl.create({
        component: SelectTicketPopoverComponent,
        componentProps: {
          tickets: this.orderDetail.Order.OrderFlightTickets,
          selectedTicket: this.selectedTicket
        }
      });
      p.present();
      const result = await p.onDidDismiss();
      if (result && result.data) {
        this.selectedTicket = result.data;
        this.initViewModel();
        console.log("onSelectTicket", this.selectedTicket, this.viewModel);
      }
    }
  }
  canSendEmailMsg() {
    if (this.selectedTicket) {
      return (
        this.selectedTicket.Status != OrderFlightTicketStatusType.Abolish &&
        this.selectedTicket.Status != OrderFlightTicketStatusType.Abolishing
      );
    }
    return false;
  }
  async sendMsg(passenger: OrderPassengerEntity) {
    if (this.selectedTicket) {
      const p = await this.modalCtrl.create({
        component: SendMsgComponent,
        componentProps: {
          defaultMobile: passenger.Mobile,
          orderTicketId: this.selectedTicket.Id
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
  async sendEmail(passenger: OrderPassengerEntity) {
    if (this.selectedTicket) {
      const p = await this.modalCtrl.create({
        component: SendEmailComponent,
        componentProps: {
          defaultEmail: passenger.Email,
          orderTicketId: this.selectedTicket.Id
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
    this.orderDetail = await this.orderService.getOrderDetailAsync(orderId);
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
        this.selectedTicket = tickets[0];
        if (this.selectedTicket) {
          this.initViewModel();
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
    return (
      this.orderDetail &&
      this.orderDetail.Order.OrderItems &&
      this.orderDetail.Order.OrderItems.reduce(
        (acc, item) => (acc = AppHelper.add(acc, +item.Amount)),
        0
      )
    );
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
    if (!this.orderDetail || !this.orderDetail.Order || !this.tmc) {
      return `0`;
    }
    let amount = 0;
    if (this.orderDetail.Order.OrderPays) {
      amount = this.orderDetail.Order.OrderPays.filter(
        it => it.Type != "SelfPay" && it.Status == OrderPayStatusType.Effective
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    if (amount == 0) {
      return `0`;
    }
    if (this.tmc.IsShowServiceFee || !this.orderDetail.Order.OrderItems) {
      return `${amount}`;
    } else {
      return `${amount -
        (this.orderDetail.Order.OrderItems || [])
          .filter(it => !(it.Tag || "").endsWith("Fee"))
          .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)}`;
    }
  }
  getInsuranceAmount() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.selectedTicket ||
      !this.orderDetail.Order.OrderItems
    ) {
      return 0;
    }
    const flightTripkeys = this.selectedTicket.OrderFlightTrips.map(t => t.Key);
    const keys = this.orderDetail.Order.OrderInsurances.filter(
      it => !!flightTripkeys.find(trainKey => trainKey == it.AdditionKey)
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
        orderItems,
        amount: orderItems.reduce(
          (acc, item) => (acc = AppHelper.add(acc, +item.Amount)),
          0
        )
      }
    });
    p.present();
  }
  private getPassengerCostOrgInfo(ticket: OrderFlightTicketEntity) {
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers &&
      ticket
    ) {
      let CostCenterCode: string;
      let CostCenterName: string;
      let OrganizationCode: string;
      let OrganizationName: string;
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
        OrganizationName
      };
    }
    return null;
  }
  initViewModel(): ITicketViewModelItem {
    const result: ITicketViewModelItem = {} as any;
    const ticket = this.selectedTicket;
    if (
      ticket &&
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderFlightTickets &&
      this.orderDetail.Order.OrderPassengers
    ) {
      result.orderFlightTicket = ticket;
      result.order = this.orderDetail && this.orderDetail.Order;
      if (this.orderDetail.Order.OrderItems) {
        result.orderItems = this.orderDetail.Order.OrderItems.filter(
          it => it.Key === ticket.Key
        );
      }
      if (this.orderDetail.Order.OrderPays) {
        result.orderPays = this.orderDetail.Order.OrderPays.filter(
          it => it.Key === ticket.Key
        );
      }
      if (!ticket.VariablesJsonObj) {
        ticket.VariablesJsonObj =
          (ticket.Variables && JSON.parse(ticket.Variables)) || {};
      }
      result.existExchanged = !!ticket.VariablesJsonObj["OriginalTicketId"];
      result.existRefund =
        ticket.OrderFlightTrips &&
        ticket.OrderFlightTrips.reduce((acc, it) => {
          if (it.Status == OrderFlightTripStatusType.Refund) {
            acc++;
          }
          return acc;
        }, 0) > 0;
      const orderPassenger = this.orderDetail.Order.OrderPassengers.find(
        it => it.Id == (ticket.Passenger && ticket.Passenger.Id)
      );
      if (orderPassenger) {
        const costOrgInfos = this.getPassengerCostOrgInfo(this.selectedTicket);
        const orderTravels = this.orderDetail.Order.OrderTravels || [];
        result.orderPassengerInfo = {
          orderPassenger,
          ...costOrgInfos,
          IllegalPolicy: orderTravels
            .filter(it => it.Key == ticket.Key)
            .map(it => it.IllegalPolicy)
            .join(","),
          IllegalReason: orderTravels
            .filter(it => it.Key == ticket.Key)
            .map(it => it.IllegalReason)
            .join(","),
          OutNumbers: this.getOrderNumbers().concat(
            this.getOrderNumbers("OutNumber")
          )
        };
      }
    }
    this.viewModel = result;
    this.initTrips();
    return result;
  }
  private initTrips() {
    let trips =
      (this.selectedTicket && this.selectedTicket.OrderFlightTrips) || [];
    console.log("this.selectedTicket.OrderFlightTrips", trips);
    trips = trips
      .filter(it => it.Status == OrderFlightTripStatusType.Normal)
      .map(it => {
        it.tripDesc = "行程航班信息";
        return { ...it } as any;
      });
    trips.sort((a, b) => +a.Id - +b.Id);
    if (this.viewModel) {
      if (this.selectedTicket) {
        const originalTrips = this.getOriginalTrips();
        const exchangedTrips = this.getExchangedTrips();
        const refundTrips = this.getRefundTrips();
        [...originalTrips, ...exchangedTrips, ...refundTrips].forEach(trip => {
          if (!trips.find(it => it.Id == trip.Id)) {
            trips.push(trip);
          }
        });
      }
      this.viewModel.trips = trips;
    }
    console.log("initTrips", trips);
  }
  private getExchangedTrips() {
    let exchangedTrips: OrderFlightTripEntity[] = [];
    if (
      this.viewModel &&
      this.viewModel.orderFlightTicket &&
      this.viewModel.orderFlightTicket.OrderFlightTrips &&
      this.viewModel.existExchanged
    ) {
      exchangedTrips = this.viewModel.orderFlightTicket.OrderFlightTrips.map(
        it => {
          it.tripDesc =
            it.Status == OrderFlightTripStatusType.Normal
              ? "行程航班信息"
              : "改签航班信息";
          if (it.TakeoffTime) {
            const m = moment(it.TakeoffTime);
            const d = this.flydayService.generateDayModel(m);
            it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
          }
          return it;
        }
      );
    }
    return exchangedTrips;
  }
  private getRefundTrips() {
    let refundTrips: OrderFlightTripEntity[] = [];
    if (
      this.viewModel &&
      this.viewModel.orderFlightTicket &&
      this.viewModel.existRefund
    ) {
      const orderFlightTicket = this.viewModel.orderFlightTicket;
      if (orderFlightTicket && orderFlightTicket.OrderFlightTrips) {
        refundTrips = orderFlightTicket.OrderFlightTrips.filter(
          orderFlightTrip =>
            orderFlightTrip.Status == OrderFlightTripStatusType.Refund
        ).map(it => {
          it.tripDesc = "退票航班信息";
          if (it.TakeoffTime) {
            const m = moment(it.TakeoffTime);
            const d = this.flydayService.generateDayModel(m);
            it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
          }
          return it;
        });
      }
    }
    return refundTrips;
  }
  private getOriginalTrips() {
    let originalTrips: OrderFlightTripEntity[] = [];
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.selectedTicket &&
      this.orderDetail.Order.OrderFlightTickets
    ) {
      if (!this.selectedTicket.VariablesJsonObj) {
        this.selectedTicket.VariablesJsonObj =
          (this.selectedTicket.Variables &&
            JSON.parse(this.selectedTicket.Variables)) ||
          {};
      }
      const originalTicketId = this.selectedTicket.VariablesJsonObj[
        "OriginalTicketId"
      ];
      const ticket = this.orderDetail.Order.OrderFlightTickets.find(it => {
        return it.Id == originalTicketId;
      });
      originalTrips = (ticket && ticket.OrderFlightTrips) || [];
      originalTrips = originalTrips.map(it => {
        it.tripDesc = "原始航班信息";
        if (it.TakeoffTime) {
          const m = moment(it.TakeoffTime);
          const d = this.flydayService.generateDayModel(m);
          it.TakeoffDate = m.format(`YYYY年MM月DD日(${d.dayOfWeekName})`);
        }
        return it;
      });
      originalTrips.sort((a, b) => +a.Id - +b.Id);
    }
    return originalTrips;
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
export interface ITicketViewModelItem {
  orderItems: OrderItemEntity[];
  orderFlightTicket: OrderFlightTicketEntity;
  orderPays: OrderPayEntity[];
  existExchanged: boolean;
  existRefund: boolean;
  order: OrderEntity;
  trips: OrderFlightTripEntity[];
  orderPassengerInfo: {
    orderPassenger: OrderPassengerEntity;
    CostCenterCode: string;
    CostCenterName: string;
    OrganizationCode: string;
    OrganizationName: string;
    OutNumbers: { Name: string; Number: string }[];
    IllegalPolicy: string;
    IllegalReason: string;
  };
}
