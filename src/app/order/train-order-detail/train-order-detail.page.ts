import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { OrderTrainTicketEntity } from "../models/OrderTrainTicketEntity";
import {
  IonHeader,
  IonContent,
  Platform,
  NavController,
  ModalController,
  PopoverController,
  DomController
} from "@ionic/angular";
import { OrderDetailModel, OrderService } from "../order.service";
import { TabItem } from "../order-detail/order-detail.page";
import { OrderHotelType } from "../models/OrderHotelEntity";
import { Subscription } from "rxjs";
import { TmcEntity, TmcService } from "src/app/tmc/tmc.service";
import { SwiperSlideContentComponent } from "../components/swiper-slide-content/swiper-slide-content.component";
import {
  OrderInsuranceEntity,
  OrderPayStatusType
} from "../models/OrderInsuranceEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { OrderTrainTicketStatusType } from "../models/OrderTrainTicketStatusType";
import { AppHelper } from "src/app/appHelper";
import { OrderEntity } from "../models/OrderEntity";
import { OrderPassengerEntity } from "../models/OrderPassengerEntity";
import { ProductItem, ProductItemType } from "src/app/tmc/models/ProductItems";
import { ActivatedRoute } from "@angular/router";
import { IdentityService } from "src/app/services/identity/identity.service";
import { OrderNumberEntity } from "../models/OrderNumberEntity";
import { flyInOut } from "src/app/animations/flyInOut";

@Component({
  selector: "app-train-order-detail",
  templateUrl: "./train-order-detail.page.html",
  styleUrls: ["./train-order-detail.page.scss"],
  animations: [flyInOut]
})
export class TrainOrderDetailPage implements OnInit, AfterViewInit, OnDestroy {
  tab:ProductItem;
  title:string;
  private headerHeight = 0;
  OrderHotelType = OrderHotelType;
  private subscriptions: Subscription[] = [];
  tmc: TmcEntity;
  ProductItemType = ProductItemType;
  items: { label: string; value: string }[] = [];
  tabs: TabItem[] = [];
  orderDetail: OrderDetailModel;
  isLoading = false;
  showTiket = false;
  @ViewChild("infos") infosContainer: ElementRef<HTMLElement>;
  @ViewChildren("slide") slides: QueryList<any>;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChild(IonContent, { static: true }) ionContent: IonContent;
  @ViewChild(SwiperSlideContentComponent)
  swiperComp: SwiperSlideContentComponent;
  scrollElement: HTMLElement;
  identity: IdentityEntity;
  flightTickect: { [tickectId: string]: OrderTrainTicketEntity[] };
  tikect2Insurance: { [tikectKey: string]: OrderInsuranceEntity[] } = {};
  tikectId2OriginalTickets: {
    [ticketId: string]: OrderTrainTicketEntity[];
  } = {};
  scrollTop: number;
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

  getPassengerCostOrgInfo(ticket: OrderTrainTicketEntity) {
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
  getExpenseType(t: OrderTrainTicketEntity) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderTravels &&
      this.orderDetail.Order.OrderTravels.filter(it => it.Key == t.Key)
        .map(it => it.ExpenseType)
        .join(",")
    );
  }
  getOrderInsurances(ticket: OrderTrainTicketEntity) {
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
        StatusName, // 保单状态
        Passenger: p,
        BookTime,
        Count,
        Premium,
        InsuredAmount,
        EffectiveDate,
        ExpireDate,
        Name, // 类型
        PolicyNo, // 保单号
        Onumber, // 供应商订单号
        Supplier, // 供应商
        BookCode, // 预订代码
        Detail, // 投保须知
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
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  private initTabs() {
    this.tabs = [];
    this.route.queryParamMap.subscribe(q => {
      this.tab = this.tab || JSON.parse(q.get("tab"));
      this.title = this.tab.label + "订单";
    });
    this.tabs.push({ label: "订单信息", value: 0 });
    if (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderTrainTickets
    ) {
      this.orderDetail.Order.OrderTrainTickets.forEach((it, idx) => {
        if (it.VariablesJsonObj.isShow) {
          this.tabs.push({ label: it.Id, value: idx + 1 });
        }
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
  private initOriginalTickets() {
    this.tikectId2OriginalTickets = {};
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderTrainTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderTrainTickets = this.orderService.checkIfOrderTrainTicketShow(
      this.orderDetail.Order.OrderTrainTickets
    );
    this.orderDetail.Order.OrderTrainTickets.forEach(t => {
      if (!this.tikectId2OriginalTickets[t.Id]) {
        const res: OrderTrainTicketEntity[] = [];
        this.tikectId2OriginalTickets[t.Id] = this.getOriginalTickets(
          t,
          this.orderDetail.Order.OrderTrainTickets,
          res
        );
      }
    });
  }
  private initTicketsTripsInsurance() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderTrainTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderTrainTickets.forEach(ticket => {
      const ticketInsurances = this.orderDetail.Order.OrderInsurances.filter(
        insurance => insurance.TravelKey == ticket.Key
      );
      ticketInsurances.map(insurance => {
        const oneTrip = ticket.OrderTrainTrips.find(
          trip =>
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
  private initTikectsInsurances() {
    this.tikect2Insurance = {};
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderTrainTickets
    ) {
      return;
    }
    this.orderDetail.Order.OrderTrainTickets.forEach(t => {
      if (!this.tikect2Insurance[t.Key]) {
        this.tikect2Insurance[t.Key] = this.getTicketOrderInsurances(t);
        console.log(this.tikect2Insurance[t.Key], "sss");
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
    console.log(this.orderDetail, "33333");
    this.initOriginalTickets();
    // console.log(this.orderDetail.Order.OrderTrainTickets, "44444");
    this.initTicketsTripsInsurance();
    this.initTikectsInsurances();
    this.isLoading = false;
    this.initTabs();
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc(true);
    }
    if (this.orderDetail) {
      if (
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderTrainTickets &&
        this.orderDetail.Order.OrderTrainTickets.length
      ) {
        const tickets = this.orderDetail.Order.OrderTrainTickets.slice(0);
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
      !this.orderDetail.Order.OrderTrainTickets
    ) {
      return 0;
    }
    const flightTripkeys: string[] = [];
    this.orderDetail.Order.OrderTrainTickets.forEach(t => {
      if (t.OrderTrainTrips) {
        t.OrderTrainTrips.forEach(trip => {
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
  getInsuranceName() {
    if (
      !this.orderDetail ||
      !this.orderDetail.Order ||
      !this.orderDetail.Order.OrderInsurances ||
      !this.orderDetail.Order.OrderTrainTickets
    ) {
      return 0;
    }
    const flightTripkeys: string[] = [];
    const insuranceName = this.orderDetail.Order.OrderTrainTickets.forEach(
      t => {
        if (t.OrderTrainTrips) {
          t.OrderTrainTrips.forEach(trip => {
            if (!flightTripkeys.find(k => k == trip.Key)) {
              flightTripkeys.push(trip.Key);
              this.orderDetail.Order.OrderInsurances.filter(
                insurance => insurance.AdditionKey == trip.Key
              ).reduce((acc, it) => (acc = AppHelper.add(acc, +it.Name)), 0);
            }
          });
        }
      }
    );
    return insuranceName;
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
  onShowTicket(
    t: OrderTrainTicketEntity,
    originalid: string,
    event: CustomEvent
  ) {
    const originalTicket =
      this.tikectId2OriginalTickets[t.Id] &&
      this.tikectId2OriginalTickets[t.Id].find(f => f.Id == originalid);
    t.VariablesJsonObj.isToggleIcon = !t.VariablesJsonObj.isToggleIcon;
    if (originalTicket) {
      originalTicket.isShowOriginalTicket = !originalTicket.isShowOriginalTicket;
      const height = this.plt.height();
      setTimeout(() => {
        const rect = (event.target as HTMLElement).getBoundingClientRect();
        this.ionContent.scrollByPoint(0, rect.top - height / 5, 100);
        // console.log(rect.top - height / 5, "height");
      }, 100);
    }
  }
  private getTicketOrderInsurances(t: OrderTrainTicketEntity) {
    return (
      (this.orderDetail &&
        this.orderDetail.Order &&
        this.orderDetail.Order.OrderInsurances &&
        this.orderDetail.Order.OrderInsurances.filter(
          it => it.TravelKey == t.Key
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
    t: OrderTrainTicketEntity,
    orderFlightTickets: OrderTrainTicketEntity[],
    res: OrderTrainTicketEntity[]
  ) {
    t.VariablesJsonObj = t.VariablesJsonObj || JSON.parse(t.Variables) || {};
    const it = orderFlightTickets.find(
      itm => itm.Id == t.VariablesJsonObj.OriginalTicketId
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
  getTicketPassenger(t: OrderTrainTicketEntity) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderPassengers.find(it => t.Passenger.Id == it.Id)
    );
  }
  getInsuranceTravel(t: OrderTrainTicketEntity) {
    return (
      this.orderDetail &&
      this.orderDetail.Order &&
      this.orderDetail.Order.OrderInsurances.find(it => t.Key == it.AdditionKey)
    );
  }
}
