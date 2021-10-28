import { Subscription } from "rxjs";
import { SwiperSlideContentComponent } from "../components/swiper-slide-content/swiper-slide-content.component";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { OrderInsuranceEntity } from "../models/OrderInsuranceEntity";
import { SelectTicketPopoverComponent } from "../components/select-ticket-popover/select-ticket-popover.component";
import { SendEmailComponent } from "../components/send-email/send-email.component";
import { OrderFlightTicketEntity } from "../models/OrderFlightTicketEntity";
import { CalendarService } from "../../tmc/calendar.service";
import { TmcEntity } from "../../tmc/tmc.service";
import { flyInOut } from "src/app/animations/flyInOut";
import {
  NavController,
  Platform,
  IonButton,
  IonList,
  IonContent,
  ModalController,
  PopoverController,
  IonHeader,
  DomController,
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
  OnDestroy,
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
import { OrderHotelType, OrderHotelEntity } from "../models/OrderHotelEntity";
import { MOCK_TMC_DATA } from "../mock-data";
import { OrderTravelPayType } from "../models/OrderTravelEntity";
import { HotelOrderPricePopoverComponent } from "../components/hotel-order-price-popover/hotel-order-price-popover.component";
import { SearchHotelModel } from "src/app/hotel/hotel.service";
import { ThemeService } from "src/app/services/theme/theme.service";

export interface TabItem {
  label: string;
  value: number;
}
@Component({
  selector: "app-order-hotel-detail_df",
  templateUrl: "./order-hotel-detail_df.page.html",
  styleUrls: ["./order-hotel-detail_df.page.scss"],
})
export class OrderHotelDetailDfPage
  implements OnInit, AfterViewInit, OnDestroy {
  private headerHeight = 0;
  OrderHotelType = OrderHotelType;
  private subscriptions: Subscription[] = [];
  tmc: TmcEntity;
  selectedFlightTicket: OrderFlightTicketEntity;
  ProductItemType = ProductItemType;
  items: { label: string; value: string }[] = [];
  tabs: TabItem[] = [];
  orderDetail: OrderDetailModel;
  searchHotelModel: SearchHotelModel;
  isLoading = false;
  showTiket = false;
  VariablesJsonObj: any;
  @ViewChild("infos") infosContainer: ElementRef<HTMLElement>;
  @ViewChildren("slide") slides: QueryList<any>;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChild(IonContent, { static: true }) ionContent: IonContent;
  @ViewChild(SwiperSlideContentComponent)
  swiperComp: SwiperSlideContentComponent;
  scrollElement: HTMLElement;
  // selectedFlightTicket: OrderFlightTicketEntity;
  // selectedTrainTicket: OrderTrainTicketEntity;
  // selectedInsuranceId: string;
  identity: IdentityEntity;
  flightTickect: { [tickectId: string]: OrderFlightTicketEntity[] };
  tikect2Insurance: { [tikectKey: string]: OrderInsuranceEntity[] } = {};
  tikectId2OriginalTickets: {
    [ticketId: string]: OrderFlightTicketEntity[];
  } = {};
  constructor(
    private plt: Platform,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private tmcService: TmcService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private domCtrl: DomController,
    private orderService: OrderService,
    private identityService: IdentityService,
    private calendarService: CalendarService,
    private refEle: ElementRef<HTMLElement>,
    private themeService: ThemeService,

  ) {
    this.themeService.getModeSource().subscribe(m => {
      if (m == 'dark') {
        this.refEle.nativeElement.classList.add("dark")
      } else {
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
  }
  scrollTop: number;

  compareFn(t1: OrderFlightTicketEntity, t2: OrderFlightTicketEntity) {
    return t1 && t2 && t1.Id == t2.Id;
  }
  private getOrderNumbers(tag = "TmcOutNumber"): OrderNumberEntity[] {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderNumbers
    ) {
      return [];
    }
    return this.orderDetail.Order.OrderNumbers.filter((it) => it.Tag == tag);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  private initTabs() {
    this.tabs = [];
    this.tabs.push({ label: "订单信息", value: 0 });
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderHotels
    ) {
      this.orderDetail.Order.OrderHotels.forEach((it, idx) => {
        // if (it.VariablesJsonObj.isShow) {
        this.tabs.push({ label: it.Id, value: idx + 1 });
        this.VariablesJsonObj =
          this.VariablesJsonObj || JSON.parse(it.Variables);
        console.log(this.VariablesJsonObj.ExceptionMessage, "============");
        // }
      });
    }
  }
  async ngOnInit() {
    this.route.queryParamMap.subscribe((q) => {
      this.initTabs();
      if (q.get("orderId")) {
        this.getOrderInfo(q.get("orderId"));
      }
    });
    this.tmc = await this.tmcService.getTmc();
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
  getVariable(orderHotel: OrderHotelEntity, key: string) {
    if (orderHotel.Variables) {
      orderHotel.VariablesJsonObj =
        orderHotel.VariablesJsonObj || JSON.parse(orderHotel.Variables) || {};
      return orderHotel.VariablesJsonObj[key];
    }
  }
  getOrderItemsSum(Tag: string = "", name: string = "Amount") {
    return (
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderItems &&
      this.orderDetail.Order.OrderItems.filter((it) =>
        Tag ? it.Tag == Tag : true
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it[name])), 0)
    );
  }
  getHotelServiceFee(orderHotelKey: string) {
    return (
      this.orderDetail &&
      this.orderDetail.Order.OrderItems &&
      this.orderDetail.Order.OrderItems.filter(
        (it) => it.Key == orderHotelKey && (it.Tag || "").includes("Fee")
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
      amount = order.OrderItems.filter((it) => it.Key == key).reduce(
        (acc, it) => (acc = AppHelper.add(acc, +it.Amount)),
        0
      );
    } else {
      amount = order.OrderItems.filter(
        (it) => it.Key == key && !(it.Tag || "").endsWith("Fee")
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    }
    return amount;
  }

  private initTicketsTripsInsurance() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderFlightTickets.forEach((ticket) => {
      const ticketInsurances = this.orderDetail.Order.OrderInsurances.filter(
        (insurance) => insurance.TravelKey == ticket.Key
      );
      ticketInsurances.map((insurance) => {
        const oneTrip = ticket.OrderFlightTrips.find(
          (trip) =>
            // console.log("wwww");
            insurance.AdditionKey == trip.Key
        );
        console.log("onetrip", oneTrip);
        if (oneTrip) {
          insurance.VariablesJsonObj =
            insurance.VariablesJsonObj || JSON.parse(insurance.Variables) || {};
          insurance.VariablesJsonObj.trip = oneTrip;
        }
        return insurance;
      });
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
      .catch((_) => null);
    console.log(this.orderDetail, "33333");
    // console.log(this.orderDetail.Order.OrderFlightTickets, "44444");
    this.initTicketsTripsInsurance();
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
        this.orderDetail.Histories = this.orderDetail.Histories.map((h) => {
          if (h.ExpiredTime) {
            h.ExpiredTime = this.transformTime(h.ExpiredTime);
          }
          if (h.InsertTime) {
            h.InsertDateTime = this.transformTime(h.InsertTime);
          }
          return h;
        });
      }
      if (this.orderDetail.Order && this.orderDetail.Order.OrderHotels) {
        this.orderDetail.Order.OrderHotels.forEach((it) => {
          if (it.CheckinTime && it.CheckoutTime) {
            it.countDay =
              (AppHelper.getDate(it.CheckoutTime.substr(0, 10)).getTime() -
                AppHelper.getDate(it.CheckinTime.substr(0, 10)).getTime()) /
              86400000;
          }
          if (it.BeginDate && it.EndDate) {
            it["beCountDay"] =
              (AppHelper.getDate(it.EndDate).getTime() -
                AppHelper.getDate(it.BeginDate).getTime()) /
              86400000;
          }
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
        (it) => !(it.Tag || "").endsWith("Fee")
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
      .filter((it) => it.Status == OrderPayStatusType.Effective)
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
          .filter((it) => !(it.Tag || "").endsWith("Fee"))
          .reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)
      );
    }
  }

  async showPricePopover() {
    const Tmc = this.tmc;
    console.log(Tmc, "TmcTmcTmcTmc");

    if (!Tmc) {
      return `0`;
    }
    if (OrderTravelPayType.Person) {
      Tmc.IsShowServiceFee = true;
    }
    let orderItems =
      this.orderDetail.Order && this.orderDetail.Order.OrderItems;
    if (!Tmc.IsShowServiceFee) {
      orderItems = orderItems.filter((it) => !(it.Tag || "").endsWith("Fee"));
    }
    console.log(orderItems, "orderItems");
    const p = await this.popoverCtrl.create({
      component: HotelOrderPricePopoverComponent,
      cssClass: "ticket-changing",
      componentProps: {
        order: this.orderDetail && this.orderDetail.Order,
        IsShowServiceFee: Tmc.IsShowServiceFee,
        orderItems,
        amount: orderItems.reduce(
          (acc, item) => (acc = AppHelper.add(acc, +item.Amount)),
          0
        ),
      },
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
        (it) =>
          it.OrderFlightTrips &&
          it.OrderFlightTrips.filter(
            (t) => t.Status == OrderFlightTripStatusType.Exchange
          ).length > 0
      ).length > 0
    );
  }
  getTicketPassenger(t: OrderFlightTicketEntity) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers.find(
        (it) => t.Passenger.Id == it.Id
      )
    );
  }
  getInsuranceTravel(t: OrderFlightTripEntity) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderInsurances.find(
        (it) => t.Key == it.AdditionKey
      )
    );
  }
  getHotelRoomFee(orderHotelKey: string) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderItems &&
      this.orderDetail.Order.OrderItems.filter(
        (it) => it.Key == orderHotelKey && it.Tag == OrderItemHelper.Hotel
      ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0)
    );
  }
  getPassengerCostOrgInfo(hotel: OrderHotelEntity) {
    const passengerId = hotel && hotel.Passenger && hotel.Passenger.Id;
    let p: OrderPassengerEntity =
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers &&
      this.orderDetail.Order.OrderPassengers.find((it) => it.Id == passengerId);
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
    if (hotel || trainTicket) {
      ticketKey = (hotel || trainTicket).Key;
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
        .filter((it) => it.Key == ticketKey)
        .map((it) => it.IllegalPolicy)
        .join(",");
      const IllegalReason = orderTravels
        .filter((it) => it.Key == ticketKey)
        .map((it) => it.IllegalReason)
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
          (it) => it.Key == ticketKey
        )
          .map((it) => it.CostCenterCode)
          .join(",");
        CostCenterName = this.orderDetail.Order.OrderTravels.filter(
          (it) => it.Key == ticketKey
        )
          .map((it) => it.CostCenterName)
          .join(",");
        OrganizationCode = this.orderDetail.Order.OrderTravels.filter(
          (it) => it.Key == ticketKey
        )
          .map((it) => it.OrganizationCode)
          .join(",");
        OrganizationName = this.orderDetail.Order.OrderTravels.filter(
          (it) => it.Key == ticketKey
        )
          .map((it) => it.OrganizationName)
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
        OutNumbers,
      };
      return info;
    }
    return null;
  }
  canSendEmailMsg() {
    const selectedTicket: OrderFlightTicketEntity = this.selectedFlightTicket;
    if (
      this.identity &&
      !(this.identity.Numbers && !!this.identity.Numbers["AgentId"])
    ) {
      return false;
    }
    if (selectedTicket) {
      return (
        selectedTicket.Status != OrderFlightTicketStatusType.Abolish &&
        selectedTicket.Status != OrderFlightTicketStatusType.Abolishing
      );
    }
    return false;
  }
  async sendMsg(passenger: OrderPassengerEntity) {
    if (
      this.identity &&
      !(this.identity.Numbers && !!this.identity.Numbers["AgentId"])
    ) {
      return false;
    }
    const selectedTicket = this.selectedFlightTicket;
    if (selectedTicket) {
      const p = await this.modalCtrl.create({
        component: SendMsgComponent,
        componentProps: {
          defaultMobile: passenger.Mobile,
          orderTicketId: selectedTicket.Id,
        },
      });
      await p.present();
      const result = await p.onDidDismiss();
      if (result && result.data) {
        const data = result.data as {
          mobiles: string[];
          content: string;
        };
        const res = await this.tmcService
          .sendSms(
            data.mobiles,
            data.content,
            this.orderDetail.Order && this.orderDetail.Order.Id
          )
          .catch((_) => {
            AppHelper.alert(_ || "短信发送失败");
            return null;
          });
        if (res) {
          AppHelper.alert("短信已发送");
        }
      }
    }
  }
  async sendEmail(passenger: OrderPassengerEntity) {
    if (
      this.identity &&
      !(this.identity.Numbers && !!this.identity.Numbers["AgentId"])
    ) {
      return false;
    }
    const selectedTicket = this.selectedFlightTicket;
    if (selectedTicket) {
      const p = await this.modalCtrl.create({
        component: SendEmailComponent,
        componentProps: {
          defaultEmail: passenger.Email,
          orderTicketId: selectedTicket.Id,
        },
      });
      await p.present();
      const result = await p.onDidDismiss();
      if (result && result.data) {
        const data = result.data as {
          emails: string[];
          subject: string;
          content: string;
        };
        const res = await this.tmcService
          .sendEmail(
            data.emails,
            data.subject,
            data.content,
            this.orderDetail.Order && this.orderDetail.Order.Id
          )
          .catch((_) => {
            AppHelper.alert(_ || "邮件发送失败");
            return null;
          });
        if (res) {
          AppHelper.alert("邮件已发送");
        }
      }
    }
  }
  getExpenseType(hkey: string) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderTravels &&
      this.orderDetail.Order.OrderTravels.filter((it) => it.Key == hkey)
        .map((it) => it.ExpenseType)
        .join(",")
    );
  }
}
