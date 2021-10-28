import { LangService } from "src/app/services/lang.service";
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
import { OrderHotelType } from "../models/OrderHotelEntity";
import { MOCK_TMC_DATA } from "../mock-data";
import { OrderTravelPayType } from "../models/OrderTravelEntity";
import { OrderFlightTicketType } from "../models/OrderFlightTicketType";
import { TaskStatusType } from "src/app/workflow/models/TaskStatusType";
import { OrderItemPricePopoverEnComponent } from "../components/order-item-price-popover_en/order-item-price-popover_en.component";
import { FlightSegmentEntity } from "src/app/flight/models/flight/FlightSegmentEntity";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";
import { ThemeService } from "src/app/services/theme/theme.service";

@Component({
  selector: "app-order-flight-detail_df",
  templateUrl: "./order-flight-detail_df.page.html",
  styleUrls: ["./order-flight-detail_df.page.scss"],
  animations: [flyInOut],
})
export class OrderFlightDetailDfPage
  implements OnInit, AfterViewInit, OnDestroy {
  OrderHotelType = OrderHotelType;
  private subscriptions: Subscription[] = [];
  private tikectId2OriginalTickets: {
    [ticketId: string]: OrderFlightTicketEntity[];
  } = {};
  tmc: TmcEntity;
  TaskStatusType = TaskStatusType;
  ProductItemType = ProductItemType;
  items: { label: string; value: string }[] = [];
  orderDetail: OrderDetailModel;
  lowestPriceSegments: FlightSegmentEntity[];
  isLoading = false;
  showTiket = false;
  tikectNo = [];
  selectedOrderFlightTicket: OrderFlightTicketEntity;
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
  filterCondition: FilterConditionModel;
  // flightTickect: { [tickectId: string]: OrderFlightTicketEntity[] };
  tikect2Insurance: { [tikectKey: string]: OrderInsuranceEntity[] } = {};
  orderFlightTicketsTabs: OrderFlightTicketEntity[];
  OrderFlightTicketStatusType = OrderFlightTicketStatusType;
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
    private langService: LangService,
    private calendarService: CalendarService,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,


    ) {
    this.themeService.getModeSource().subscribe(m=>{
         if(m=='dark'){
           this.refEle.nativeElement.classList.add("dark")
         }else{
           this.refEle.nativeElement.classList.remove("dark")
         }
       })
  }
  scrollTop: number;

  compareFn(t1: OrderFlightTicketEntity, t2: OrderFlightTicketEntity) {
    return t1 && t2 && t1.Id == t2.Id;
  }

  get filterConditionIsFiltered() {
    return (
      (this.filterCondition && this.filterCondition.onlyDirect) ||
      (this.filterCondition.userOps &&
        Object.keys(this.filterCondition.userOps).some(
          (k) => this.filterCondition.userOps[k]
        ))
    );
  }

  getPassengerCostOrgInfo(ticket: OrderFlightTicketEntity) {
    const passengerId = ticket && ticket.Passenger && ticket.Passenger.Id;
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
  private getExpenseType(t: OrderFlightTicketEntity) {
    return (
      t &&
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderTravels &&
      this.orderDetail.Order.OrderTravels.filter((it) => it.Key == t.Key)
        .map((it) => it.ExpenseType)
        .join(",")
    );
  }
  onSelectTicket(
    t: OrderFlightTicketEntity,
    container?: HTMLElement,
    tabEl?: HTMLElement
  ) {
    this.selectedOrderFlightTicket = t;
    if (container) {
      try {
        if (tabEl) {
          const rect = tabEl.getBoundingClientRect();
          const left = rect.left + rect.width / 2 - this.plt.width() / 2;
          container.scrollBy({ left, behavior: "smooth" });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  private getOrderInsurances(ticket: OrderFlightTicketEntity) {
    const passengerId = ticket && ticket.Passenger && ticket.Passenger.Id;
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
      let InsuredAmount: string;
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
        StatusName = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.StatusName)
          .join(",");
        BookTime = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.BookTime)
          .join(",");
        Count = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.Count)
          .join(",");
        Premium = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.Premium)
          .join(",");
        InsuredAmount = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.InsuredAmount)
          .join(",");
        Detail = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.Detail)
          .join(",");
        EffectiveDate = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.EffectiveDate)
          .join(",");
        ExpireDate = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.ExpireDate)
          .join(",");
        Name = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.Name)
          .join(",");
        PolicyNo = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.PolicyNo)
          .join(",");
        Onumber = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.Number)
          .join(",");
        Supplier = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.Supplier)
          .join(",");
        BookCode = this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == ticketKey
        )
          .map((it) => it.BookCode)
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
        isShowDetail: false,
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
    return this.orderDetail.Order.OrderNumbers.filter((it) => it.Tag == tag);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  private initTabs() {
    this.orderFlightTicketsTabs = [];
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderFlightTickets &&
      this.tikectId2OriginalTickets
    ) {
      this.orderDetail.Order.OrderFlightTickets.forEach((it, idx) => {
        if (it.Variables && !it.VariablesJsonObj) {
          it.VariablesJsonObj =
            it.VariablesJsonObj || JSON.parse(it.Variables) || {};
        }
        it.VariablesJsonObj.isShowExchange = this.isShowExchange(it);
        it.VariablesJsonObj.isTicketCanRefund = this.isTicketCanRefund(it);
      });

      const hasOrgArr = this.orderDetail.Order.OrderFlightTickets.filter(
        (it) => it.VariablesJsonObj && it.VariablesJsonObj.OriginalTicketId
      );
      const noOrgArr = this.orderDetail.Order.OrderFlightTickets.filter(
        (it) => !it.VariablesJsonObj || !it.VariablesJsonObj.OriginalTicketId
      );
      this.orderFlightTicketsTabs = noOrgArr.concat(hasOrgArr);
    }
  }
  private isShowExchange(orderFlightTicket: OrderFlightTicketEntity) {
    if (!orderFlightTicket) {
      return false;
    }
    return [
      OrderFlightTicketStatusType.BookExchanging,
      OrderFlightTicketStatusType.BookExchanged,
      OrderFlightTicketStatusType.Exchanging,
      OrderFlightTicketStatusType.Exchanged,
      OrderFlightTicketStatusType.ChangeTicket,
      OrderFlightTicketStatusType.ExchangeUsed,
      OrderFlightTicketStatusType.ExchangeAbolishing,
    ].includes(orderFlightTicket.Status);
  }
  private isTicketCanRefund(orderFlightTicket: OrderFlightTicketEntity) {
    if (!orderFlightTicket) {
      return false;
    }
    return [
      OrderFlightTicketStatusType.Refunded,
      OrderFlightTicketStatusType.Refunding,
    ].includes(orderFlightTicket.Status);
  }
  // ticket["isShowDetail"]=!ticket["isShowDetail"]
  isShowDetail(t: OrderFlightTicketEntity, event: CustomEvent) {
    t["isShowExplain"] = !t["isShowExplain"];
    if (t["isShowExplain"]) {
      // const height = this.plt.height();
      // setTimeout(() => {
      //   const rect = (event.target as HTMLElement).getBoundingClientRect();
      //   this.ionContent.scrollToBottom(100);
      // }, 200);
    }
  }
  async ngOnInit() {
    // this.route.queryParamMap.subscribe((q) => {
    //   this.title =  "机票订单";
    // });
    this.route.queryParamMap.subscribe((q) => {
      if (q.get("orderId")) {
        this.getOrderInfo(q.get("orderId"));
      }
    });
    this.tmc = await this.tmcService.getTmc();
    this.identity = await this.identityService.getIdentityAsync();
    // this.getTicketNo();
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

  getWeekName(date: string) {
    if (date) {
      const d = AppHelper.getDate(date);
      return this.calendarService.getDayOfWeekNames(d.getDay());
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

  private initOriginalTickets() {
    this.tikectId2OriginalTickets = {};
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderFlightTickets.forEach((t) => {
      if (!this.tikectId2OriginalTickets[t.Id]) {
        const res: OrderFlightTicketEntity[] = [];
        this.tikectId2OriginalTickets[t.Id] = this.getOriginalTickets(
          t,
          this.orderDetail.Order.OrderFlightTickets,
          res
        );
      }
    });
    console.log("tikectId2OriginalTickets", this.tikectId2OriginalTickets);
  }
  isOriginalTicket(tid: string) {
    return (
      this.tikectId2OriginalTickets &&
      Object.keys(this.tikectId2OriginalTickets).some((k) =>
        this.tikectId2OriginalTickets[k].some((it) => it.Id == tid)
      )
    );
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
        // console.log("onetrip", oneTrip);
        if (oneTrip) {
          insurance.VariablesJsonObj =
            insurance.VariablesJsonObj || JSON.parse(insurance.Variables) || {};
          insurance.VariablesJsonObj.trip = oneTrip;
        }
        return insurance;
      });
    });
  }
  private initTikectsInsurances() {
    this.tikect2Insurance = {};
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderFlightTickets.forEach((t) => {
      if (!this.tikect2Insurance[t.Key]) {
        this.tikect2Insurance[t.Key] = this.getTicketOrderInsurances(t);
        // console.log(this.tikect2Insurance[t.Key], "sss");
      }
    });
  }
  private initTicketExpenseType() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderFlightTickets = this.orderDetail.Order.OrderFlightTickets.map(
      (t) => {
        t.VariablesJsonObj =
          t.VariablesJsonObj || JSON.parse(t.Variables) || {};
        t.VariablesJsonObj.ExpenseType = this.getExpenseType(t);
        return t;
      }
    );
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
    this.initOriginalTickets();
    this.initTicketExpenseType();
    this.initTicketsTripsInsurance();
    this.initTikectsInsurances();
    this.isLoading = false;
    this.initTabs();
    this.sortTabs();
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc(true);
    }
    console.log(this.tmc);
    if (this.orderDetail) {
      this.orderDetail.orderTotalAmount = +this.orderService.getOrderTotalAmount(
        this.orderDetail && this.orderDetail.Order,
        this.tmc
      );
      this.orderDetail.insuranceAmount = this.getInsuranceAmount();
      if (
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderFlightTickets &&
        this.orderDetail.Order.OrderFlightTickets.length
      ) {
        // this.getTicketNo();
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
      if (this.orderFlightTicketsTabs) {
        this.onSelectTicket(this.orderFlightTicketsTabs[0]);
      }
      console.log("orderDetail ", this.orderDetail);
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
  private getInsuranceAmount() {
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
    this.orderDetail.Order.OrderFlightTickets.forEach((t) => {
      if (t.OrderFlightTrips) {
        t.OrderFlightTrips.forEach((trip) => {
          if (!flightTripkeys.find((k) => k == trip.Key)) {
            flightTripkeys.push(trip.Key);
          }
        });
      }
    });
    const keys = this.orderDetail.Order.OrderInsurances.filter(
      (it) => !!flightTripkeys.find((k) => k == it.AdditionKey)
    ).map((it) => it.Key);
    const insuranceAmount = this.orderDetail.Order.OrderItems.filter((it) =>
      keys.find((k) => k == it.Key)
    ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Amount)), 0);
    return insuranceAmount;
  }
  getInsuranceName() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderFlightTickets
    ) {
      return 0;
    }
    const flightTripkeys: string[] = [];
    const insuranceName = this.orderDetail.Order.OrderFlightTickets.forEach(
      (t) => {
        if (t.OrderFlightTrips) {
          t.OrderFlightTrips.forEach((trip) => {
            if (!flightTripkeys.find((k) => k == trip.Key)) {
              flightTripkeys.push(trip.Key);
              this.orderDetail.Order.OrderInsurances.filter(
                (insurance) => insurance.AdditionKey == trip.Key
              ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Name)), 0);
            }
          });
        }
      }
    );
    return insuranceName;
  }
  async showPricePopover() {
    try {
      if (!this.tmc) {
        this.tmc = await this.tmcService.getTmc();
      }
      let Tmc = this.tmc;
      console.log(Tmc, "TmcTmcTmcTmc");
      if (!Tmc) {
        return `0`;
      }
      Tmc = { ...this.tmc };
      if (this.orderDetail && this.orderDetail.Order) {
        if (
          [OrderTravelPayType.Company, OrderTravelPayType.Balance].some(
            (t) => t == this.orderDetail.Order.TravelPayType
          )
        ) {
          Tmc.IsShowServiceFee = this.tmc && this.tmc.IsShowServiceFee;
        }
        if (OrderTravelPayType.Person == this.orderDetail.Order.TravelPayType) {
          Tmc.IsShowServiceFee = true;
        }
      }
      let orderItems =
        this.orderDetail.Order && this.orderDetail.Order.OrderItems;
      if (!Tmc.IsShowServiceFee) {
        orderItems = orderItems.filter((it) => !(it.Tag || "").endsWith("Fee"));
      }
      const p = await this.popoverCtrl.create({
        component: this.langService.isCn
          ? OrderItemPricePopoverComponent
          : OrderItemPricePopoverEnComponent,
        cssClass: "ticket-changing",
        componentProps: {
          order: this.orderDetail && this.orderDetail.Order,
          insurance: this.getInsuranceAmount(),
          IsShowServiceFee: Tmc.IsShowServiceFee,
          orderItems,
          amount: orderItems.reduce(
            (acc, item) => (acc = AppHelper.add(acc, +item.Amount)),
            0
          ),
        },
      });
      p.present();
    } catch (e) {
      console.error(e);
    }
  }
  back() {
    this.navCtrl.pop();
  }

  async ngAfterViewInit() {
    this.subscriptions.push(
      this.slides.changes.subscribe(() => {
        if (this.swiperComp) {
          // this.swiperComp.update(false);
          // this.swiperComp.updateSlides();
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
  private sortTabs() {
    if (this.orderFlightTicketsTabs) {
      this.orderFlightTicketsTabs.sort((t1, t2) => {
        return +t2.Id - +t1.Id;
      });
    }
  }
  onShowFlightTicket(
    t: OrderFlightTicketEntity,
    originalid: string,
    event: CustomEvent
  ) {
    const originalTicket =
      this.tikectId2OriginalTickets[t.Id] &&
      this.tikectId2OriginalTickets[t.Id].find((f) => f.Id == originalid);
    // console.log(this.tikectId2OriginalTickets, "onShowFlightTicket");
    t.VariablesJsonObj.isShowOriginalTicket = !t.VariablesJsonObj
      .isShowOriginalTicket;
    if (originalTicket) {
      originalTicket.isShowOriginalTicket = !originalTicket.isShowOriginalTicket;
      const height = this.plt.height();
      setTimeout(() => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        this.ionContent.scrollByPoint(0, rect.top - height / 5, 100);
      }, 100);
    }
  }
  private getTicketOrderInsurances(t: OrderFlightTicketEntity) {
    return (
      (this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderInsurances &&
        this.orderDetail.Order.OrderInsurances.filter(
          (it) => it.TravelKey == t.Key
        )) ||
      []
    );
  }
  // const insurance =
  // (this.tikect2Insurance && this.tikect2Insurance[t.Key]) || [];
  // if (insurance) {
  //   console.log(insurance["isShowDetail"],"isShowDetail");

  //   insurance["isShowDetail"] = !insurance["isShowDetail"];
  // }
  private getOriginalTickets(
    t: OrderFlightTicketEntity,
    orderFlightTickets: OrderFlightTicketEntity[],
    res: OrderFlightTicketEntity[]
  ) {
    if (t.Variables) {
      t.VariablesJsonObj = t.VariablesJsonObj || JSON.parse(t.Variables) || {};
    }
    if (!t.VariablesJsonObj) {
      t.VariablesJsonObj = {};
    }
    const it = orderFlightTickets.find(
      (itm) => itm.Id == t.VariablesJsonObj.OriginalTicketId
    );
    if (it) {
      it.VariablesJsonObj =
        it.VariablesJsonObj || JSON.parse(it.Variables) || {};
      res.push(it);
      if (it.VariablesJsonObj.OriginalTicketId) {
        this.getOriginalTickets(it, orderFlightTickets, res);
      }
    }
    return res;
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
  onGetNewTicket(is: boolean) {
    this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderFlightTickets;
    this.orderDetail.Order.OrderFlightTickets.filter(
      (t) => t.VariablesJsonObj.isShow == is
    );
    console.log(
      this.orderDetail.Order.OrderFlightTickets.filter(
        (t) => t.VariablesJsonObj.isShow == is
      ),
      "isisisisis"
    );
  }
}
