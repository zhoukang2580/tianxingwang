import { Subscription } from "rxjs";
import { SwiperSlideContentComponent } from "./../components/swiper-slide-content/swiper-slide-content.component";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { OrderInsuranceEntity } from "./../models/OrderInsuranceEntity";
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
  AfterViewInit,
  OnDestroy
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
import { OrderTrainTicketEntity } from "../models/OrderTrainTicketEntity";
import { OrderHotelType } from "../models/OrderHotelEntity";
import { MOCK_TMC_DATA } from "../mock-data";

export interface TabItem {
  label: string;
  value: number;
}

@Component({
  selector: "app-flight-order-detail",
  templateUrl: "./flight-order-detail.page.html",
  styleUrls: ["./flight-order-detail.page.scss"]
})
export class FlightOrderDetailPage implements OnInit, AfterViewInit, OnDestroy {
  private headerHeight = 0;
  OrderHotelType = OrderHotelType;
  private subscriptions: Subscription[] = [];
  tmc: TmcEntity;
  title: string;
  tab: ProductItem;
  ProductItemType = ProductItemType;
  items: { label: string; value: string }[] = [];
  tabs: TabItem[] = [];
  orderDetail: OrderDetailModel;
  isLoading = false;
  showTiket = false;
  @ViewChild("infos") infosContainer: ElementRef<HTMLElement>;
  @ViewChildren("slide") slides: QueryList<any>;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(SwiperSlideContentComponent)
  swiperComp: SwiperSlideContentComponent;
  scrollElement: HTMLElement;
  // selectedFlightTicket: OrderFlightTicketEntity;
  // selectedTrainTicket: OrderTrainTicketEntity;
  // selectedInsuranceId: string;
  identity: IdentityEntity;
  passengerTikects: { [passengerId: string]: OrderFlightTicketEntity[] };
  constructor(
    private plt: Platform,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private domCtrl: DomController,
    private orderService: OrderService,
    private identityService: IdentityService
  ) {}
  scrollTop: number;

  compareFn(t1: OrderFlightTicketEntity, t2: OrderFlightTicketEntity) {
    return t1 && t2 && t1.Id == t2.Id;
  }

  // canSendEmailMsg() {
  //   const selectedTicket: OrderFlightTicketEntity = this.selectedFlightTicket;
  //   if (
  //     this.identity &&
  //     !(this.identity.Numbers && !!this.identity.Numbers["AgentId"])
  //   ) {
  //     return false;
  //   }
  //   if (selectedTicket) {
  //     return (
  //       selectedTicket.Status != OrderFlightTicketStatusType.Abolish &&
  //       selectedTicket.Status != OrderFlightTicketStatusType.Abolishing
  //     );
  //   }
  //   return false;
  // }
  // async sendMsg(passenger: OrderPassengerEntity) {
  //   if (
  //     this.identity &&
  //     !(this.identity.Numbers && !!this.identity.Numbers["AgentId"])
  //   ) {
  //     return false;
  //   }
  //   const selectedTicket = this.selectedFlightTicket;
  //   if (selectedTicket) {
  //     const p = await this.modalCtrl.create({
  //       component: SendMsgComponent,
  //       componentProps: {
  //         defaultMobile: passenger.Mobile,
  //         orderTicketId: selectedTicket.Id
  //       }
  //     });
  //     await p.present();
  //     const result = await p.onDidDismiss();
  //     if (result && result.data) {
  //       const data = result.data as {
  //         mobiles: string[];
  //         content: string;
  //       };
  //       const res = await this.tmcService
  //         .sendSms(
  //           data.mobiles,
  //           data.content,
  //           this.orderDetail.Order && this.orderDetail.Order.Id
  //         )
  //         .catch(_ => {
  //           AppHelper.alert(_ || "短信发送失败");
  //           return null;
  //         });
  //       if (res) {
  //         AppHelper.alert("短信已发送");
  //       }
  //     }
  //   }
  // }

  getPassengerCostOrgInfo(ticket: OrderFlightTicketEntity) {
    const passengerId = ticket && ticket.Passenger && ticket.Passenger.Id;
    let p: OrderPassengerEntity =
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers &&
      this.orderDetail.Order.OrderPassengers.find(it => it.Id == passengerId);
    if (!p) {
      if (
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderPassengers
      ) {
        p = this.orderDetail.Order.OrderPassengers[0];
      }
    }
    if (!p || !this.orderDetail.Order) {
      return;
    }
    const trainTicket =
      this.orderDetail.Order.OrderTrainTickets &&
      this.orderDetail.Order.OrderTrainTickets[0];
    let ticketKey;
    if (ticket || trainTicket) {
      ticketKey = (ticket || trainTicket).Key;
    }
    if (!ticketKey) {
      ticketKey =
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderHotels &&
        this.orderDetail.Order.OrderHotels[0] &&
        this.orderDetail.Order.OrderHotels[0].Key;
    }
    if (this.orderDetail && this.orderDetail.Order && ticketKey) {
      let CostCenterCode: string;
      let CostCenterName: string;
      let OrganizationCode: string;
      let OrganizationName: string;
      const orderTravels = this.orderDetail.Order.OrderTravels || [];
      const IllegalPolicy = orderTravels
        .filter(it => it.Key == ticketKey)
        .map(it => it.IllegalPolicy)
        .join(",");
      const IllegalReason = orderTravels
        .filter(it => it.Key == ticketKey)
        .map(it => it.IllegalReason)
        .join(",");
      const OutNumbers = this.getOrderNumbers().concat(
        this.getOrderNumbers("OutNumber")
      );
      if (
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderTravels
      ) {
        CostCenterCode = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticketKey
        )
          .map(it => it.CostCenterCode)
          .join(",");
        CostCenterName = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticketKey
        )
          .map(it => it.CostCenterName)
          .join(",");
        OrganizationCode = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticketKey
        )
          .map(it => it.OrganizationCode)
          .join(",");
        OrganizationName = this.orderDetail.Order.OrderTravels.filter(
          it => it.Key == ticketKey
        )
          .map(it => it.OrganizationName)
          .join(",");
      }
      const info = {
        Passenger: p,
        CostCenterCode,
        CostCenterName,
        OrganizationCode,
        OrganizationName,
        IllegalPolicy,
        IllegalReason,
        OutNumbers
      };
      return info;
    }
    return null;
  }
  getOrderInsurances(ticket: OrderFlightTicketEntity) {
    const passengerId = ticket && ticket.Passenger && ticket.Passenger.Id;
    let p: OrderPassengerEntity =
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers &&
      this.orderDetail.Order.OrderPassengers.find(it => it.Id == passengerId);
    if (!p) {
      if (
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderPassengers
      ) {
        p = this.orderDetail.Order.OrderPassengers[0];
      }
    }
    if (!p || !this.orderDetail.Order) {
      return;
    }
    const trainTicket =
      this.orderDetail.Order.OrderTrainTickets &&
      this.orderDetail.Order.OrderTrainTickets[0];
    let ticketKey;
    if (ticket || trainTicket) {
      ticketKey = (ticket || trainTicket).Key;
    }
    if (!ticketKey) {
      ticketKey =
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderHotels &&
        this.orderDetail.Order.OrderHotels[0] &&
        this.orderDetail.Order.OrderHotels[0].Key;
    }
    if (this.orderDetail && this.orderDetail.Order && ticketKey) {
      let StatusName: string;
      let BookTime: string;
      let Count: string;
      let Premium: string;
      let InsuredAmount: String;
      let Detail: string;
      let EffectiveDate: string;
      let ExpireDate: string;
      let Name: string;
      let PolicyNo: string;
      let Onumber: string;
      let Supplier: string;
      let BookCode: string;
      const orderTravels = this.orderDetail.Order.OrderTravels || [];
      const IllegalPolicy = orderTravels
        .filter(it => it.Key == ticketKey)
        .map(it => it.IllegalPolicy)
        .join(",");
      const IllegalReason = orderTravels
        .filter(it => it.Key == ticketKey)
        .map(it => it.IllegalReason)
        .join(",");
      const OutNumbers = this.getOrderNumbers().concat(
        this.getOrderNumbers("OutNumber")
      );
      if (
        this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderTravels
      ) {
        StatusName = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.StatusName)
          .join(",");
        BookTime = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.BookTime)
          .join(",");
        Count = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.Count)
          .join(",");
        Premium = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.Premium)
          .join(",");
        InsuredAmount = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.InsuredAmount)
          .join(",");
        Detail = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.Detail)
          .join(",");
        EffectiveDate = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.EffectiveDate)
          .join(",");
        ExpireDate = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.ExpireDate)
          .join(",");
        Name = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.Name)
          .join(",");
        PolicyNo = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.PolicyNo)
          .join(",");
        Onumber = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.Number)
          .join(",");
        Supplier = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.Supplier)
          .join(",");
        BookCode = this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == ticketKey
        )
          .map(it => it.BookCode)
          .join(",");
      }
      const info = {
        StatusName, //保单状态
        Passenger: p,
        BookTime,
        Count,
        Premium,
        InsuredAmount,
        EffectiveDate,
        ExpireDate,
        Name, //类型
        PolicyNo, //保单号
        Onumber, //供应商订单号
        Supplier, //供应商
        BookCode, //预订代码
        Detail, //投保须知
        IllegalPolicy,
        IllegalReason,
        OutNumbers,
        isShowDetail: false
      };
      return info;
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
  // async sendEmail(passenger: OrderPassengerEntity) {
  //   if (
  //     this.identity &&
  //     !(this.identity.Numbers && !!this.identity.Numbers["AgentId"])
  //   ) {
  //     return false;
  //   }
  //   const selectedTicket = this.selectedFlightTicket;
  //   if (selectedTicket) {
  //     const p = await this.modalCtrl.create({
  //       component: SendEmailComponent,
  //       componentProps: {
  //         defaultEmail: passenger.Email,
  //         orderTicketId: selectedTicket.Id
  //       }
  //     });
  //     await p.present();
  //     const result = await p.onDidDismiss();
  //     if (result && result.data) {
  //       const data = result.data as {
  //         emails: string[];
  //         subject: string;
  //         content: string;
  //       };
  //       const res = await this.tmcService
  //         .sendEmail(
  //           data.emails,
  //           data.subject,
  //           data.content,
  //           this.orderDetail.Order && this.orderDetail.Order.Id
  //         )
  //         .catch(_ => {
  //           AppHelper.alert(_ || "邮件发送失败");
  //           return null;
  //         });
  //       if (res) {
  //         AppHelper.alert("邮件已发送");
  //       }
  //     }
  //   }
  // }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  private initTabs() {
    this.tabs = [];
    this.tabs.push({ label: "订单信息", value: 0 });
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers
    ) {
      this.orderDetail.Order.OrderPassengers.forEach((it, idx) => {
        this.tabs.push({ label: it.Name, value: idx + 1 });
      });
    }
  }
  async ngOnInit() {
    this.route.queryParamMap.subscribe(q => {
      this.initTabs();
      if (q.get("orderId")) {
        this.getOrderInfo(q.get("orderId"));
      }
    });
    // todo
    this.tmc = (MOCK_TMC_DATA as any) || (await this.tmcService.getTmc());
    this.identity = await this.identityService.getIdentityAsync();
  }
  getVariableObj(
    it: { Variables: string; VariablesDictionary: any },
    key: string
  ) {
    if (it) {
      it.VariablesDictionary =
        it.VariablesDictionary || JSON.parse(it.Variables) || {};
      return it.VariablesDictionary[key];
    }
  }
  getOrderItemsSum(Tag: string = "", name: string = "Amount") {
    return (
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderItems &&
      this.orderDetail.Order.OrderItems.filter(it =>
        Tag ? it.Tag == Tag : true
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it[name])), 0)
    );
  }
  getHotelServiceFee(orderHotelKey: string) {
    return (
      this.orderDetail &&
      this.orderDetail.Order.OrderItems &&
      this.orderDetail.Order.OrderItems.filter(
        it => it.Key == orderHotelKey && (it.Tag || "").includes("Fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)
    );
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
  // private getTicketPassenger(p: OrderPassengerEntity ) {
  //   const p = (this.orderDetail.Order && this.orderDetail.Order.OrderPassengers) || [];
  //   return p.find(it => it.Id == (ticket.Passenger && ticket.Passenger.Id));
  // }
  private initPassengerTikects() {
    this.passengerTikects = {};
    if (
      !this.orderDetail ||
      !this.orderDetail.Order.OrderPassengers ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderPassengers.forEach(p => {
      if (!this.passengerTikects[p.Id]) {
        this.passengerTikects[p.Id] = this.getPassengerTickets(p);
      }
    });
  }
  private async getOrderInfo(orderId: string) {
    if (!orderId) {
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.orderDetail = await this.orderService
      .getOrderDetailAsync(orderId)
      .catch(_ => null);
    // console.log(this.orderDetail, "33333");
    this.sortFlightTicket();
    this.initPassengerTikects();
    this.isLoading = false;
    this.initTabs();
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
            AppHelper.getDate(tb.InsertTime).getTime() -
            AppHelper.getDate(ta.InsertTime).getTime()
          );
        });
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
  private transformTime(datetime: string) {
    if (datetime && datetime.includes("T")) {
      const [date, time] = datetime.split("T");
      if (date && time) {
        return `${date} ${time.substring(0, time.lastIndexOf(":"))}`;
      }
    }
    return datetime;
  }
  getOrderTotalAmount() {
    let amount = 0;
    const order = this.orderDetail && this.orderDetail.Order;
    const Tmc = this.tmc;
    if (!Tmc || !order || !order.OrderItems) {
      return amount;
    }
    if (Tmc.IsShowServiceFee) {
      amount = order.OrderItems.reduce(
        (acc, it) => (acc = AppHelper.add(acc, +it.Amount)),
        0
      );
    } else {
      amount = order.OrderItems.filter(
        it => !(it.Tag || "").endsWith("Fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount < 0 ? 0 : amount;
  }
  getOrderPayAmount() {
    const Tmc = this.tmc;
    let amount = 0;
    const order = this.orderDetail && this.orderDetail.Order;
    if (!Tmc || !order) {
      return amount;
    }
    amount = (order.OrderPays || [])
      .filter(it => it.Status == OrderPayStatusType.Effective)
      .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    if (amount == 0) {
      return amount;
    }
    if (Tmc.IsShowServiceFee || !order.OrderItems) {
      return amount;
    } else {
      return (
        amount -
        (order.OrderItems || [])
          .filter(it => !(it.Tag || "").endsWith("Fee"))
          .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)
      );
    }
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
        });
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
      cssClass: "ticket-changing",
      componentProps: {
        order: this.orderDetail && this.orderDetail.Order,
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
    this.navCtrl.pop();
  }

  async ngAfterViewInit() {
    this.subscriptions.push(
      this.slides.changes.subscribe(() => {
        if (this.swiperComp) {
          this.swiperComp.update(false);
        }
      })
    );
    if (this.ionContent) {
      this.scrollElement = await this.ionContent.getScrollElement();
    }
  }
  hasOriginalFlightTrip() {
    return (
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderFlightTickets &&
      this.orderDetail.Order.OrderFlightTickets.filter(
        it =>
          it.OrderFlightTrips &&
          it.OrderFlightTrips.filter(
            t => t.Status == OrderFlightTripStatusType.Exchange
          ).length > 0
      ).length > 0
    );
  }
  private sortFlightTicket() {
    let trips: OrderFlightTripEntity[] = [];
    if (this.orderDetail.Order && this.orderDetail.Order.OrderFlightTickets) {
      this.orderDetail.Order.OrderFlightTickets.sort(
        (t1, t2) => +t2.Id - +t1.Id
      );
    }
    return trips;
  }
  onShowFlightTicket(
    idx: number,
    p: OrderPassengerEntity,
    t: OrderFlightTicketEntity
  ) {
    const tickets =
      (this.passengerTikects && this.passengerTikects[p.Id]) || [];
    const ticket = tickets[idx + 1];
    if (ticket) {
      ticket["isShow"] = !ticket["isShow"];
    }
    if (t) {
      t["isToggle"] = !t["isToggle"];
    }
  }
  onShowOrderInsurance(t: OrderFlightTicketEntity) {
    if (t) {
      t["isShowDetail"] = !t["isShowDetail"];
    }
  }
  private getPassengerTickets(p: OrderPassengerEntity) {
    return (
      (this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderFlightTickets &&
        this.orderDetail.Order.OrderFlightTickets.filter(
          it => it.Passenger && it.Passenger.Id == p.Id
        ).map((m, index) => {
          // let isShow=true;
          m["isShow"] = index == 0;
          return m;
        })) ||
      []
    );
  }
}
