import { LangService } from "../../services/lang.service";
import { BackButtonComponent } from "../../components/back-button/back-button.component";
import { IdentityService } from "../../services/identity/identity.service";
import { OrderTripModel } from "../models/OrderTripModel";
import { OrderService } from "../order.service";
import { AppHelper } from "src/app/appHelper";
import { OrderModel } from "src/app/order/models/OrderModel";
import {
  TmcEntity,
  TmcService,
  PassengerBookInfo,
} from "../../tmc/tmc.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  ModalController,
  IonInfiniteScroll,
  IonContent,
  IonDatetime,
  PickerController,
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  EventEmitter,
  ChangeDetectorRef,
} from "@angular/core";
import { SearchTicketModalComponent } from "../components/search-ticket-modal/search-ticket-modal.component";
import { SearchTicketConditionModel } from "../../tmc/models/SearchTicketConditionModel";
import { ProductItemType, ProductItem } from "../../tmc/models/ProductItems";
import { OrderEntity, OrderStatusType } from "src/app/order/models/OrderEntity";
import { OrderTravelPayType } from "src/app/order/models/OrderTravelEntity";
import { OrderFlightTicketStatusType } from "src/app/order/models/OrderFlightTicketStatusType";
import { OrderTrainTicketStatusType } from "src/app/order/models/OrderTrainTicketStatusType";
import { OrderFlightTicketEntity } from "src/app/order/models/OrderFlightTicketEntity";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { finalize } from "rxjs/operators";
import { OrderItemHelper } from "src/app/flight/models/flight/OrderItemHelper";
import { TaskEntity } from "src/app/workflow/models/TaskEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { ORDER_TABS } from "../product-list/product-list.page";
import { StaffEntity } from "src/app/hr/staff.service";
import { FlightService } from "src/app/flight/flight.service";
import { OrderFlightTripEntity } from "../models/OrderFlightTripEntity";
import { IFlightSegmentInfo } from "src/app/flight/models/PassengerFlightInfo";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { monitorEventLoopDelay } from "perf_hooks";
import { SearchTicketModalEnComponent } from "../components/search-ticket-modal_en/search-ticket-modal_en.component";
@Component({
  selector: "app-order-list_en",
  templateUrl: "./order-list_en.page.html",
  styleUrls: ["./order-list_en.page.scss"],
})
export class OrderListEnPage implements OnInit, OnDestroy {
  private condition: SearchTicketConditionModel = new SearchTicketConditionModel();
  private readonly pageSize = 20;
  public loadDataSub = Subscription.EMPTY;
  private subscriptions: Subscription[] = [];
  private selectDateChange = new EventEmitter();
  private selectDateSubscription = Subscription.EMPTY;
  productItemType = ProductItemType;
  activeTab: ProductItem;
  tabs: ProductItem[] = [];
  tmc: TmcEntity;
  orderModel: OrderModel;
  dataCount: number;
  isLoading = true;
  titles = "";
  tasks: TaskEntity[];
  curTaskPageIndex = 0;
  isShowMyTrips = false;
  myTrips: OrderTripModel[];
  isOpenUrl = false;
  loadMoreErrMsg: string;
  myTripsTotalCount = 0;
  orderFlightTicketStatusTypes: any[];
  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(IonDatetime) datetime: IonDatetime;
  @ViewChild(IonInfiniteScroll) infiniteScroll: IonInfiniteScroll;
  @ViewChild(BackButtonComponent) backbtn: BackButtonComponent;
  constructor(
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    public tmcService: TmcService,
    private router: Router,
    public orderService: OrderService,
    private identityService: IdentityService,
    private flightService: FlightService,
    private pickerCtrl: PickerController,
    private cdref: ChangeDetectorRef,
    private langService: LangService
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  async onPay(order: OrderEntity) {
    try {
      if (order) {
        await this.tmcService.payOrder(order.Id);
      }
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  loadMoreOrders() {
    if (
      this.isShowMyTrips ||
      (this.activeTab &&
        this.activeTab.value == ProductItemType.waitingApprovalTask)
    ) {
      return;
    }
    this.doSearchOrderList();
  }
  private scrollToTop() {
    if (this.ionContent) {
      this.ionContent.scrollToTop(100);
    }
  }
  doRefresh(condition?: SearchTicketConditionModel) {
    this.isLoading = true;
    this.condition = condition || new SearchTicketConditionModel();
    this.condition.pageIndex = 0;
    this.loadMoreErrMsg = "";
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (
      this.activeTab &&
      this.activeTab.value == ProductItemType.waitingApprovalTask
    ) {
      this.doRefreshTasks();
      return;
    }
    this.isShowMyTrips = false;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = true;
    }
    this.orderModel = new OrderModel();
    this.myTrips = [];
    this.orderModel.Orders = [];
    this.scrollToTop();
    this.loadMore();
  }
  loadMore() {
    this.loadMoreOrders();
    this.loadMoreMyTrips();
    this.doLoadMoreTasks();
  }
  onTabClick(tab: ProductItem) {
    this.isLoading = true;
    this.loadDataSub.unsubscribe();
    this.activeTab = tab;
    this.dataCount = 0;
    this.myTripsTotalCount = 0;
    this.titles = tab.label + " Orders";
    if (this.activeTab.value == ProductItemType.waitingApprovalTask) {
      this.titles = tab.label;
    }
    this.doRefresh();
  }
  async onRefundFlightTicket(data: {
    orderId: string;
    ticketId: string;
    IsVoluntary: boolean;
    FileName: string;
    FileValue: string;
  }) {
    await this.orderService
      .refundFlightTicket(data)
      .then(() => {
        AppHelper.toast("Refund application in progress", 2000, "middle");
        this.doRefresh();
        this.doRefreshTasks();
      })
      .catch((e) => {
        AppHelper.alert(e);
      });
  }
  historyTrips() {
    const condition = new SearchTicketConditionModel();
    condition.toDate = moment().format("YYYY-MM-DD");
    this.doRefresh(condition);
  }
  onshowMyTrips() {
    this.condition = new SearchTicketConditionModel();
    this.condition.pageIndex = 1;
    this.isShowMyTrips = true;
    this.myTrips = [];
    this.loadMoreMyTrips();
    this.ionContent.scrollToTop();
  }
  loadMoreMyTrips() {
    if (!this.isShowMyTrips) {
      return;
    }
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    const m = this.transformSearchCondition(this.condition);
    m.PageSize = this.pageSize;
    m.Type =
      this.activeTab.value == ProductItemType.plane
        ? "Flight"
        : this.activeTab.value == ProductItemType.hotel
        ? "Hotel"
        : "Train";
    this.isLoading = this.condition.pageIndex <= 1;
    this.loadDataSub = this.orderService
      .getMyTrips(m)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(
        (res) => {
          if (res && res.Data) {
            this.condition.LastFlightId = res.Data.LastFlightId;
            this.condition.LastHotelId = res.Data.LastHotelId;
            this.condition.LastTime = res.Data.LastTime;
            this.condition.LastTrainId = res.Data.LastTrainId;
          }
          if (res && res.Data && res.Data.Trips) {
            if (this.condition.pageIndex <= 1 && res.Data.Trips.length) {
              this.myTripsTotalCount = res.Data.DataCount;
            }
            if (this.infiniteScroll) {
              this.infiniteScroll.disabled = res.Data.Trips.length < 10;
              this.infiniteScroll.complete();
            }
            if (res.Data.Trips.length) {
              this.myTrips = [...this.myTrips, ...res.Data.Trips];
              this.myTrips = this.myTrips.map((trip) => {
                trip = this.getVariablesJsonObj(trip);
                return trip;
              });
              this.condition.pageIndex++;
            }
          }
        },
        (err) => {
          this.loadMoreErrMsg = err.Message || "数据获取失败";
        }
      );
  }
  back() {
    this.router.navigate([AppHelper.getRoutePath("tabs/my")]);
  }
  private getVariablesJsonObj(trip: OrderTripModel) {
    if (!trip) {
      return trip;
    }
    trip.VariablesJsonObj = trip.VariablesJsonObj || JSON.parse(trip.Variables);
    return trip;
  }
  async openSearchModal() {
    const condition = new SearchTicketConditionModel();
    const m = await this.modalCtrl.create({
      component: this.langService.isCn
        ? SearchTicketModalComponent
        : SearchTicketModalEnComponent,
      componentProps: {
        type: this.activeTab,
        condition: {
          ...condition,
          orderFlightTicketStatusTypes:
            this.activeTab.value == ProductItemType.plane
              ? this.orderFlightTicketStatusTypes || []
              : [],
        },
      },
    });
    await m.present();
    const result = await m.onDidDismiss();
    console.log("条件查询", result.data);
    if (result && result.data) {
      const cond = { ...this.condition, ...result.data };
      this.doRefresh(cond);
    }
    // else {
    //   this.doRefresh();
    // }
  }
  async onAbolishTrainOrder(data: { orderId: string; ticketId: string }) {
    this.orderService
      .abolishTrainOrder({
        OrderId: data.orderId,
        TicketId: data.ticketId,
        Channel: await this.tmcService.getChannel(),
      })
      .then(() => {
        this.doRefresh();
      })
      .catch((e) => {
        AppHelper.alert(e);
      });
  }
  private getExchangeDate(date = "") {
    interface TV {
      text: string;
      value: string;
    }
    this.datetime.value = date;
    if (!this.datetime.pickerOptions) {
      this.datetime.pickerOptions = {
        buttons: [],
        cssClass: "exchange-date-time",
      };
      this.datetime.pickerOptions.buttons.push(
        {
          text: "请选择航班日期：",
          handler: () => false,
          cssClass: "label-text",
        },
        { text: "取消", handler: () => false, role: "cancel" },
        {
          text: "确定",
          handler: (data: { year: TV; month: TV; day: TV }) => {
            this.selectDateChange.emit(
              `${data.year.value}-${
                +data.month.value < 10
                  ? "0" + data.month.value
                  : data.month.value
              }-${+data.day.value < 10 ? "0" + data.day.value : data.day.value}`
            );
          },
        }
      );
    }
    return new Promise<string>(async (resolve) => {
      this.selectDateSubscription.unsubscribe();
      this.selectDateSubscription = this.selectDateChange.subscribe((d) => {
        resolve(d);
      });
      this.datetime["el"].querySelector("selected");
      console.dir(this.datetime);
      await this.datetime.open();
      const p = await this.pickerCtrl.getTop();
    });
  }
  async onExchangeFlightTicket(data: {
    orderId: string;
    ticketId: string;
    trip: OrderFlightTripEntity;
  }) {
    try {
      this.datetime.yearValues = [
        new Date().getFullYear(),
        new Date().getFullYear() + 1,
      ];
      if (!data) {
        AppHelper.alert("改签失败，请重试");
        return;
      }
      const date = await this.getExchangeDate(data.trip.TakeoffDate);
      if (!date) {
        AppHelper.alert("请选择改签日期");
      }
      console.log("改签日期", date);
      const res = await this.orderService.getExchangeFlightTrip({
        OrderId: data.orderId,
        TicketId: data.ticketId,
        ExchangeDate: date,
      });
      if (
        !res ||
        !res.trip ||
        !res.order ||
        !res.order.OrderPassengers ||
        !res.order.OrderPassengers[0]
      ) {
        AppHelper.alert("改签失败，请重试");
        return;
      }
      // setSearchFlightModelSource
      this.flightService.removeAllBookInfos();
      let passenger: StaffEntity = {
        Account: {
          Id: res.order.OrderPassengers[0].Id,
        },
        AccountId: res.order.OrderPassengers[0].Id,
        Name: res.order.OrderPassengers[0].Name,
        Number: res.order.OrderPassengers[0].CredentialsNumber,
        // isNotWhiteList: !res.staff,
      } as StaffEntity;
      if (res.staff) {
        passenger = {
          ...passenger,
          ...res.staff,
        };
      }
      const credential: CredentialsEntity = {
        Name: res.order.OrderPassengers[0].Name,
        Type: res.order.OrderPassengers[0].CredentialsType,
        TypeName: res.order.OrderPassengers[0].PassengerTypeName,
        Number: res.order.OrderPassengers[0].CredentialsNumber,
      } as CredentialsEntity;
      const info: PassengerBookInfo<IFlightSegmentInfo> = {
        passenger,
        credential,
        isFilterPolicy: false,
        // isNotWhitelist: !res.staff,
      };
      this.flightService.addPassengerBookInfo(info);
      const bookInfos = this.flightService.getPassengerBookInfos();
      if (!bookInfos.length) {
        AppHelper.alert("改签失败，请重试");
        return;
      }
      bookInfos[0].exchangeInfo = {
        order: { Id: data.orderId } as any,
        ticket: { Id: data.ticketId } as any,
        trip: res.trip,
      };
      // setSearchFlightModelSource
      this.flightService.setSearchFlightModelSource({
        ...this.flightService.getSearchFlightModel(),
        FromCode: res.trip.FromAirport,
        ToCode: res.trip.ToAirport,
        FromAsAirport: false,
        ToAsAirport: false,
        fromCity: res.fromCity,
        toCity: res.toCity,
        isExchange: true,
        isRoundTrip: false,
        Date: date.substr(0, 10),
      });
      this.router.navigate(["flight-list"], {
        queryParams: { doRefresh: true },
      });
    } catch (e) {
      AppHelper.alert(e);
    }
  }
  async onAbolishOrder(data: {
    orderId: string;
    ticketId: string;
    tag: "flight" | "train";
  }) {
    if (data.tag == "flight") {
      this.orderService
        .abolishFlightOrder({
          OrderId: data.orderId,
          Channel: await this.tmcService.getChannel(),
          TicketId: data.ticketId,
        })
        .then(() => {
          AppHelper.alert("Order cancellation application");
          this.doRefresh();
        })
        .catch((e) => {
          AppHelper.alert(e);
        });
    } else if (data.tag == "train") {
      this.orderService
        .abolishTrainOrder({
          OrderId: data.orderId,
          Channel: await this.tmcService.getChannel(),
          TicketId: data.ticketId,
        })
        .then(() => {
          AppHelper.alert("Order cancellation application");
          this.doRefresh();
        })
        .catch((e) => {
          AppHelper.alert(e);
        });
    }
  }
  goToDetailPage(orderId: string, type: string) {
    // Flight
    console.log(type, "dddd");

    if (type && type.toLowerCase() == "car") {
      this.router.navigate([AppHelper.getRoutePath("order-car-detail")], {
        queryParams: { Id: orderId },
      });
      return;
    }
    if (type && type.toLowerCase() == "flight") {
      this.router.navigate([AppHelper.getRoutePath("order-flight-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId,
        },
      });
      return;
    } else if (type && type.toLowerCase() == "hotel") {
      this.router.navigate([AppHelper.getRoutePath("order-hotel-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId,
        },
      });
      return;
    }
    if (type && type.toLowerCase() == "train") {
      this.router.navigate([AppHelper.getRoutePath("order-train-detail")], {
        queryParams: {
          tab: JSON.stringify(this.activeTab),
          orderId: orderId,
        },
      });
      return;
    }
    this.router.navigate([AppHelper.getRoutePath("order-detail")], {
      queryParams: {
        tab: JSON.stringify(this.activeTab),
        orderId: orderId,
      },
    });
  }
  private doRefreshTasks() {
    this.isLoading = true;
    if (this.infiniteScroll) {
      this.infiniteScroll.disabled = false;
    }
    if (this.activeTab.value != ProductItemType.waitingApprovalTask) {
      return;
    }
    if (this.loadDataSub) {
      this.loadDataSub.unsubscribe();
    }
    this.tasks = [];
    this.curTaskPageIndex = 0;
    this.doLoadMoreTasks();
    this.scrollToTop();
  }
  private doLoadMoreTasks() {
    if (
      this.activeTab &&
      this.activeTab.value != ProductItemType.waitingApprovalTask
    ) {
      return;
    }
    const pageSize = 15;
    this.loadDataSub = this.orderService
      .getOrderTasks({
        PageSize: pageSize,
        PageIndex: this.curTaskPageIndex,
      } as any)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          if (this.infiniteScroll) {
            this.infiniteScroll.complete();
          }
        })
      )
      .subscribe(
        (tasks) => {
          if (tasks) {
            if (tasks.length) {
              this.tasks = this.tasks || [];
              this.tasks = this.tasks.concat(tasks);
              this.curTaskPageIndex++;
            }
            if (this.infiniteScroll) {
              this.infiniteScroll.disabled =
                tasks.length == 0 || tasks.length < pageSize;
            }
          }
        },
        (err) => {
          this.loadMoreErrMsg = err.Message || err;
        }
      );
  }
  getTaskOrderId(task: TaskEntity) {
    return (
      task &&
      task.VariablesJsonObj &&
      (task.VariablesJsonObj["OrderId"] || task.VariablesJsonObj["ConsumerId"])
    );
  }
  private getTaskUrl(task: TaskEntity) {
    return task && task.VariablesJsonObj["TaskUrl"];
  }
  private async doSearchOrderList() {
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc();
    }
    try {
      if (this.loadDataSub) {
        this.loadDataSub.unsubscribe();
      }
      const m = this.transformSearchCondition(this.condition);
      m.PageSize = this.pageSize;
      m.Type = "Flight";
      if (this.activeTab) {
        m.Type =
          this.activeTab.value == ProductItemType.plane
            ? "Flight"
            : this.activeTab.value == ProductItemType.train
            ? "Train"
            : this.activeTab.value == ProductItemType.car
            ? "Car"
            : "Hotel";
      }
      this.orderModel.Type = m.Type;
      if (
        this.orderModel &&
        this.orderModel.Orders &&
        this.orderModel.Orders.length &&
        !m.EndDate
      ) {
        m.EndDate = this.orderModel.Orders[
          this.orderModel.Orders.length - 1
        ].InsertTime;
      }
      this.loadDataSub = this.orderService
        .getOrderList(m)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe(
          async (res) => {
            let result: OrderModel = res.Status ? res.Data : null;
            this.orderFlightTicketStatusTypes =
              (res.Data && res.Data.OrderFlightTicketStatusTypes) || [];
            if (m.PageIndex < 1) {
              this.dataCount = result && result.DataCount;
            }
            result = this.combineInfo(result);
            if (this.infiniteScroll) {
              this.infiniteScroll.complete();
            }
            if (result && result.Orders && result.Orders) {
              this.infiniteScroll.disabled =
                result.Orders.length == 0 ||
                result.Orders.length < this.pageSize;
            }
            if (result && result.Orders && result.Orders.length) {
              this.condition.pageIndex++;
              if (this.orderModel) {
                this.orderModel.Orders = [
                  ...this.orderModel.Orders,
                  ...result.Orders,
                ];
              } else {
                this.orderModel = result;
              }
            }
          },
          (e) => {
            this.loadMoreErrMsg = e.Message || e;
            console.error(e);
          }
        );
    } catch (e) {
      console.error(e);
    }
  }
  private async getTaskHandleUrl(task: TaskEntity) {
    const identity: IdentityEntity = await this.identityService
      .getIdentityAsync()
      .catch((_) => null);
    let url = this.getTaskUrl(task);
    if (url.includes("?")) {
      url = `${url}&taskid=${task.Id}&ticket=${
        (identity && identity.Ticket) || ""
      }`;
    } else {
      url = `${url}?taskid=${task.Id}&ticket=${
        (identity && identity.Ticket) || ""
      }`;
    }
    return url;
  }
  async onTaskDetail(task: TaskEntity) {
    const url = await this.getTaskHandleUrl(task);
    if (url) {
      this.router
        .navigate(["open-url"], {
          queryParams: {
            url,
            titles: task && task.Name,
            tabId: this.activeTab.value,
            isOpenInAppBrowser: AppHelper.isApp(),
          },
        })
        .then((_) => {
          this.isOpenUrl = true;
        });
    }
  }
  private combineInfo(data: OrderModel) {
    if (data) {
      if (data.Orders) {
        data.Orders = data.Orders.map((order) => {
          if (order.Variables) {
            order.VariablesJsonObj = JSON.parse(order.Variables);
          }
          if (order.InsertTime) {
            if (order.InsertTime.includes("T")) {
              const [date, time] = order.InsertTime.split("T");
              order.InsertDateTime = `${date} ${time.substring(
                0,
                time.lastIndexOf(":")
              )}`;
            } else {
              order.InsertDateTime = order.InsertTime;
            }
          }
          if (order.OrderFlightTickets) {
            order.OrderFlightTickets = order.OrderFlightTickets.map((t) => {
              t.vmTicketAmount = this.getTotalAmount(order, t.Key);
              t.vmInsuranceAmount = this.getInsuranceAmount(order, t);
              // t.vmIsAllowExchange = this.isAllowExchange(order);
              // t.vmIsAllowRefund = this.isAllowRefund(order);
              if (t.OrderFlightTrips) {
                t.OrderFlightTrips = t.OrderFlightTrips.map((trip) => {
                  if (trip.TakeoffTime) {
                    if (trip.TakeoffTime.includes("T")) {
                      const [date, time] = trip.TakeoffTime.split("T");
                      trip.TakeoffDate = date;
                      trip.TakeoffShortTime = time.substring(
                        0,
                        time.lastIndexOf(":")
                      );
                    } else {
                      const m = moment(trip.TakeoffTime);
                      trip.TakeoffDate = m.format("YYYY-MM-DD");
                      trip.TakeoffShortTime = m.format("HH:mm");
                    }
                  }
                  if (trip.ArrivalTime) {
                    if (trip.ArrivalTime.includes("T")) {
                      const [date, time] = trip.ArrivalTime.split("T");
                      trip.ArrivalDate = date;
                      trip.ArrivalShortTime = time.substring(
                        0,
                        time.lastIndexOf(":")
                      );
                    } else {
                      const m = moment(trip.ArrivalTime);
                      trip.ArrivalDate = m.format("YYYY-MM-DD");
                      trip.ArrivalShortTime = m.format("HH:mm");
                    }
                  }
                  return trip;
                });
              }
              return t;
            });
          }
          order.vmIsCheckPay = this.checkPay(order);
          // order.TotalAmount = this.orderService.getOrderTotalAmount(
          //   order,
          //   this.tmc
          // );
          return order;
        });
      }
    }
    return data;
  }

  private getInsuranceAmount(
    order: OrderEntity,
    orderFlightTicket: OrderFlightTicketEntity
  ) {
    if (!order || !orderFlightTicket || !order.OrderItems) {
      return 0;
    }
    return order.OrderItems.filter(
      (it) => it.Tag == OrderItemHelper.Insurance
    ).reduce((acc, item) => (acc = AppHelper.add(acc, +item.Amount)), 0);
  }
  private transformSearchCondition(data: SearchTicketConditionModel) {
    let model = new OrderModel();
    model = {
      ...model,
      ...data,
    };
    if (data.fromDate) {
      model.StartDate = data.fromDate;
    }
    if (data.toDate) {
      model.EndDate = data.toDate || moment().format("YYYY-MM-DD");
    }
    model.Id = data.orderNumber;
    model.Status = data.orderStatus;
    model.Passenger = data.passengerName;
    model.PageIndex = data.pageIndex || 0;
    if (data.passengerName) {
      model.Orders = [
        {
          OrderPassengers: [
            {
              Name: data.passengerName,
            } as any,
          ],
        } as any,
      ];
    }
    if (data.toCity) {
      model.ToCityName = data.toCity.CityName || data.toCity.Nickname;
    }
    if (data.fromCity) {
      model.FromCityName = data.fromCity.CityName || data.fromCity.Nickname;
    }
    if (data.fromCityName) {
      model.OrderTrips = [
        {
          FromName: data.fromCityName,
        } as any,
      ];
    }
    if (data.toCityName) {
      model.OrderTrips = [
        {
          ToName: data.toCityName,
        } as any,
      ];
    }
    console.log("transformSearchCondition", model);
    return model;
  }
  async ngOnInit() {
    try {
      const sub = this.route.queryParamMap.subscribe((d) => {
        const plane = ORDER_TABS.find(
          (it) => it.value == ProductItemType.plane
        );
        let tab = plane;
        if (d && d.get("tabId")) {
          tab = ORDER_TABS.find((it) => it.value == +d.get("tabId")) || plane;
        }
        this.activeTab = this.isOpenUrl
          ? this.activeTab
          : this.activeTab || tab;
        this.titles = tab.labelEn + " Orders";
        // console.log("order-list", this.activeTab);
        this.isOpenUrl = false;
        if (d && d.get("doRefresh") == "true") {
          this.doRefresh();
        }
      });
      this.subscriptions.push(sub);
      this.subscriptions.push(this.selectDateSubscription);
      this.subscriptions.push(this.loadDataSub);
      this.doRefresh();
      this.tabs = ORDER_TABS.filter(
        (t) => t.value != ProductItemType.waitingApprovalTask
      )
        .filter((t) => t.value != ProductItemType.more && t.isDisplay)
        .map((t) => {
          const it = { ...t };
          if (this.langService.isEn) {
            it.label = t.labelEn;
          }
          it["isActive"] = t.value == this.activeTab.value;
          return it;
        });
      this.tmc = await this.tmcService.getTmc();
    } catch (e) {
      console.error(e);
    }
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
  private checkPay(order: OrderEntity) {
    if (order.Status == OrderStatusType.WaitHandle) {
      return false;
    }
    let rev =
      order.PayAmount < order.TotalAmount &&
      order.VariablesJsonObj &&
      ((order.VariablesJsonObj["TravelPayType"] as OrderTravelPayType) ==
        OrderTravelPayType.Credit ||
        (order.VariablesJsonObj["TravelPayType"] as OrderTravelPayType) ==
          OrderTravelPayType.Person) &&
      order.Status != OrderStatusType.Cancel;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderFlightTickets ||
      order.OrderFlightTickets.reduce((acc, it) => {
        if (
          it.Status == OrderFlightTicketStatusType.Booking ||
          it.Status == OrderFlightTicketStatusType.BookExchanging
        ) {
          acc++;
        }
        return acc;
      }, 0) == 0;
    if (!rev) {
      return false;
    }
    rev =
      !order.OrderTrainTickets ||
      order.OrderTrainTickets.reduce((acc, it) => {
        if (
          it.Status == OrderTrainTicketStatusType.Booking ||
          it.Status == OrderTrainTicketStatusType.BookExchanging
        ) {
          acc++;
        }
        return acc;
      }, 0) == 0;
    return rev;
  }
}
