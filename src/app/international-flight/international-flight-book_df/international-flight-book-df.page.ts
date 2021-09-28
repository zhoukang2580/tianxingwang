import { LangService } from "src/app/services/lang.service";
import {
  Component,
  OnInit,
  OnDestroy,
  ViewChildren,
  ViewChild,
  QueryList,
  AfterViewInit,
} from "@angular/core";
import {
  IInternationalFlightSearchModel,
  ITripInfo,
  IFilterCondition,
  InternationalFlightService,
  IInternationalFlightSegmentInfo,
  FlightVoyageType,
} from "../international-flight.service";
import {
  Subscription,
  Subject,
  BehaviorSubject,
  Observable,
  combineLatest,
  from,
  fromEvent,
} from "rxjs";
import { map, tap } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import {
  PassengerBookInfo,
  TmcEntity,
  TmcService,
  InitialBookDtoModel,
  TmcApprovalType,
  TravelFormEntity,
  IllegalReasonEntity,
  TravelUrlInfo,
  IBookOrderResult,
} from "src/app/tmc/tmc.service";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  StaffEntity,
  StaffApprover,
  CostCenterEntity,
  OrganizationEntity,
  HrService,
} from "src/app/hr/hr.service";
import { TaskType } from "src/app/workflow/models/TaskType";
import { InsuranceProductEntity } from "src/app/insurance/models/InsuranceProductEntity";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import {
  OrderTravelType,
  OrderTravelPayType,
} from "src/app/order/models/OrderTravelEntity";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { AppHelper } from "src/app/appHelper";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { OrderBookDto } from "src/app/order/models/OrderBookDto";
import {
  IonCheckbox,
  IonContent,
  Platform,
  PopoverController,
  ModalController,
  IonSelect,
} from "@ionic/angular";
import { RefresherComponent } from "src/app/components/refresher";
import { AddContact } from "src/app/tmc/models/AddContact";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";
import { PriceDetailComponent } from "src/app/flight/components/price-detail/price-detail.component";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { TMC_FLIGHT_OUT_NUMBER } from "../mock-data";
import { OrderFlightTicketType } from "src/app/order/models/OrderFlightTicketType";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { OrderInsuranceEntity } from "src/app/order/models/OrderInsuranceEntity";
import { SearchModel } from "src/app/travel-application/travel.service";
import { SearchCostcenterComponent } from "src/app/tmc/components/search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { SelectComponent } from "src/app/components/select/select.component";
import { OrderService } from "src/app/order/order.service";
import { StorageService } from "src/app/services/storage-service.service";
@Component({
  selector: "app-international-flight-book-df",
  templateUrl: "./international-flight-book-df.page.html",
  styleUrls: ["./international-flight-book-df.page.scss"],
})
export class InternationalFlightBookDfPage
  implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  private checkPayCount = 5;
  private checkPayCountIntervalTime = 3 * 1000;
  private checkPayCountIntervalId: any;
  isCanSkipApproval = false;
  isNotWihte = true;
  isPlaceOrderOk = true;
  FlightVoyageType = FlightVoyageType;
  searchModel: IInternationalFlightSearchModel;
  travelForm: TravelFormEntity;
  addContacts: AddContact[] = [];
  hasrequeiredoutnumber = false;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChild(IonContent, { static: true }) cnt: IonContent;
  @ViewChild(RefresherComponent) ionRefresher: RefresherComponent;
  initialBookDtoModel: InitialBookDtoModel;
  errors: any;
  isCheckingPay = false;
  isCanSave = false;
  isSubmitDisabled = false;
  isManagementCredential = false;
  orderTravelPayType: OrderTravelPayType;
  OrderTravelPayType = OrderTravelPayType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  isShowFee = false;
  totalPriceSource: Subject<number>;
  vmCombindInfos: ICombindInfo[];
  illegalReasons: any[];
  identity: IdentityEntity;
  tmc: TmcEntity;
  isDingTalk = AppHelper.isDingtalkH5();
  isRoundTrip = false;
  isself = false;
  expenseTypes: { Name: string; Tag: string; }[];
  OrderTravelType = OrderTravelType;
  PromptInformation = '';
  constructor(
    private flightService: InternationalFlightService,
    private route: ActivatedRoute,
    private identityService: IdentityService,
    private staffService: HrService,
    private tmcService: TmcService,
    private storage: StorageService,
    private plt: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    private modalCtrl: ModalController,
    private langService: LangService,
    private orderService: OrderService
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onToggleIsShowFee(el: HTMLElement, footerEl: HTMLElement) {
    this.isShowFee = !this.isShowFee;
    el.style.transform = `translate(0,-${footerEl.clientHeight || 44}px)`;
  }
  async ngOnInit() {
    this.subscriptions.push(this.subscription);
    this.subscriptions.push(
      this.flightService.getSearchModelSource().subscribe((s) => {
        this.searchModel = s;
        this.isRoundTrip = s.voyageType == FlightVoyageType.GoBack;
      })
    );
    console.log(this.searchModel, "this.searchModel");

    // 秘书和特殊角色可以跳过审批(如果有审批人)
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(async () => {
        this.errors = "";
        if (this.isManagementCredential) {
          this.refresh(false);
          this.isManagementCredential = false;
        }
        this.isCanSave = await this.identityService
          .getIdentityAsync()
          .catch((_) => null as IdentityEntity)
          .then((id) => {
            return !!(id && id.Numbers && id.Numbers["AgentId"]);
          });
        this.staffService.isSelfBookType().then((iss) => {
          this.isself = iss;
        });
      })
    );
    const sub = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource(),
    ])
      .pipe(
        map(([tmc, isSelfType, identity]) => {
          return (
            tmc.FlightApprovalType &&
            tmc.FlightApprovalType != TmcApprovalType.None &&
            !isSelfType &&
            !(identity && identity.Numbers && identity.Numbers.AgentId)
          );
        }),
        tap((can) => {
          console.log("是否可以跳过审批", can);
        })
      )
      .subscribe((is) => {
        this.isCanSkipApproval = is;
      });
    this.subscriptions.push(sub);
    this.refresh(false);
  }
  private async initOrderTravelPayTypes() {
    const cabinPaytypes: string[] = [];
    this.tmc = this.tmc || (await this.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => ({} as any));
    if (!this.initialBookDtoModel || !this.initialBookDtoModel.PayTypes) {
      return;
    }
    this.orderTravelPayType = this.tmc && this.tmc.IntFlightPayType;
    const arr1 = Object.keys(this.initialBookDtoModel.PayTypes);
    this.orderTravelPayTypes = [];
    arr1.forEach((it) => {
      if (!this.orderTravelPayTypes.find((item) => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDtoModel.PayTypes[it],
          value: +it,
        });
      }
    });
    if (cabinPaytypes.length) {
      this.orderTravelPayTypes = this.orderTravelPayTypes.filter((it) =>
        cabinPaytypes.some((cbt) => cbt == it.label)
      );
    }
    console.log("initOrderTravelPayTypes", this.orderTravelPayTypes);
  }
  getExplain(explain: string) {
    return explain && explain.replace(/\\n/g, "<br/>");
  }
  private async initializeBookDto() {
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"] || "";
    const infos = this.flightService.getBookInfos();
    bookDto.Passengers = [];
    for (let i = 0; i < infos.length; i++) {
      const info = infos[i];
      if (info.passenger) {
        const p = new PassengerDto();
        p.Credentials = info.credential;
        p.ClientId = info.id;
        p.FlightFare =
          info.bookInfo &&
          info.bookInfo.flightRoute &&
          info.bookInfo.flightRoute.selectFlightFare;
        if (i == 0 && p.FlightFare) {
          const flightRouteIds = p.FlightFare.FlightRouteIds || [];
          p.FlightRoutes = this.flightService.flightListResult.flightRoutesData
            .filter((it) => flightRouteIds.some((id) => id == it.Id))
            .map((it) => {
              const r = {
                ...it,
                flightFare: null,
                FlightSegments: [],
                fromSegment: null,
                toSegment: null,
                transferSegments: null,
              };
              return r;
            });
          const segs = this.flightService.flightListResult.FlightSegments.filter(
            (s) =>
              p.FlightRoutes.some(
                (r) =>
                  r.FlightSegmentIds &&
                  r.FlightSegmentIds.some((rsegid) => rsegid == s.Id)
              )
          );
          p.FlightSegments = segs;
        }
        const account = new AccountEntity();
        account.Id = info.passenger.AccountId;
        if (p.Credentials) {
          p.Credentials.Account = p.Credentials.Account || account;
        }
        p.Policy = info.passenger.Policy;
        p.FlightCabin = p.FlightFare as any;
        bookDto.Passengers.push(p);
      }
    }
    console.log("initializeBookDto", bookDto);
    this.initialBookDtoModel = await this.flightService.getInitializeBookDto(
      bookDto
    );
    return this.initialBookDtoModel;
  }
  ngAfterViewInit() {
    if (this.checkboxes) {
      this.checkboxes.changes.subscribe(() => {
        setTimeout(() => {
          this.calcTotalPrice();
        }, 0);
        this.checkboxes.forEach((c) => {
          c.ionChange.subscribe((_) => {
            this.calcTotalPrice();
          });
        });
      });
    }
  }
  private getTravelFormNumber(name: string) {
    if (!this.travelForm) {
      return "";
    }
    if (name == "TravelNumber") {
      return this.travelForm.TravelNumber;
    }
    if (this.travelForm.Numbers == null) {
      return "";
    }
    const one = this.travelForm.Numbers.find((n) => n.Name == name);
    if (one) {
      return one.Code;
    }
    return "";
  }
  private initPassengersBookInfo() {
    if (
      this.searchModel &&
      this.searchModel.trips &&
      this.searchModel.trips.length
    ) {
      const trips = this.searchModel.trips || [];
      const last = trips.slice(0).pop();
      if (this.searchModel && last && last.bookInfo) {
        this.flightService.setBookInfoSource(
          this.flightService.getBookInfos().map((it, idx) => {
            if (
              it.bookInfo &&
              it.bookInfo.flightRoute &&
              it.bookInfo.flightRoute.FlightSegments
            ) {
              it.bookInfo.flightRoute.FlightSegments = it.bookInfo.flightRoute.FlightSegments.map(
                (seg) => {
                  return seg;
                }
              );
            }
            it.bookInfo = {
              ...it.bookInfo,
              flightRoute: last.bookInfo.flightRoute,
            } as IInternationalFlightSegmentInfo;
            return it;
          })
        );
      }
    }
  }
  async refresh(byUser: boolean) {
    const MOCK_FLIGHT_VMCOMBINDINFO = "mock_international_flight_vmcombindinfo";
    try {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 300);
      }
      this.initPassengersBookInfo();
      // this.vmCombindInfos = TMC_FLIGHT_OUT_NUMBER;
      // if (this.vmCombindInfos) { return; }
      if (byUser) {
        const ok = await AppHelper.alert(
          "刷新将重新初始化页面，是否刷新？",
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
        if (!ok) {
          return;
        }
      }
      this.errors = "";
      this.vmCombindInfos = [];
      this.initialBookDtoModel = await this.initializeBookDto();
      if (!this.initialBookDtoModel) {
        this.errors = "网络错误";
      }
      this.tmc = this.initialBookDtoModel.Tmc;
      this.travelForm = this.initialBookDtoModel.TravelFrom;
      this.illegalReasons = (this.initialBookDtoModel.IllegalReasons || []).map(
        (it) => {
          const item = new IllegalReasonEntity();
          item.Name = it;
          return item;
        }
      );
      this.expenseTypes = this.initialBookDtoModel.ExpenseTypes || [];
      await this.initSelfBookTypeCredentials(); // 如果是个人，获取个人是证件信息
      const notWhitelistCredentials = this.flightService
        .getBookInfos()
        .filter((it) => it.isNotWhitelist);
      if (notWhitelistCredentials.length) {
        // 处理非白名单的人员证件信息
        console.log("notWhitelistCredentials", notWhitelistCredentials);
      }
      await this.initCombindInfos();
      this.initTmcOutNumberInfos();
      await this.initOrderTravelPayTypes();
      console.log("vmCombindInfos", this.vmCombindInfos);
      if (false && !environment.production) {
        this.storage.set(MOCK_FLIGHT_VMCOMBINDINFO, this.vmCombindInfos);
      }
    } catch (err) {
      this.errors = err || "please retry";
      console.error(err);
    }
  }
  checkOrderTravelType(type: OrderTravelType) {
    const Tmc = this.tmc;
    if (!Tmc || !Tmc.FlightOrderType) {
      return false;
    }
    return !!Tmc.FlightOrderType.split(",").find(
      (it) => it == OrderTravelType[type]
    );
  }

  private async initTmcOutNumberInfos() {
    const args: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[] = [];
    if (!this.vmCombindInfos) {
      return false;
    }
    const outnumbers =
      (this.initialBookDtoModel && this.initialBookDtoModel.OutNumbers) || {};
    this.vmCombindInfos.forEach((item) => {
      if (item.tmcOutNumberInfos) {
        item.tmcOutNumberInfos.forEach((it) => {
          it.labelDataList = outnumbers[it.label] || [];
          if (it.isLoadNumber) {
            if (
              it.staffNumber &&
              !args.find((n) => n.staffNumber == it.staffNumber)
            ) {
              args.push({
                staffNumber: it.staffNumber,
                staffOutNumber: it.staffOutNumber,
                name: it.value,
              });
            }
          }
        });
      }
    });
    const result = await this.tmcService.getTravelUrls(args, 'Flight');
    if (result) {
      this.vmCombindInfos.forEach((item) => {
        if (item.tmcOutNumberInfos) {
          item.tmcOutNumberInfos.forEach((info) => {
            if (info.label.toLowerCase() == "staffnumber") {
              info.value = info.staffNumber;
            }
            if (info.label.toLowerCase() == "travelnumber") {
              info.loadTravelUrlErrorMsg =
                result[info.staffNumber] && result[info.staffNumber].Message;
              info.travelUrlInfos =
                result[info.staffNumber] && result[info.staffNumber].Data;
              if (
                !info.value &&
                info.travelUrlInfos &&
                info.travelUrlInfos.length
              ) {
                info.value = info.travelUrlInfos[0].TravelNumber;
              }
            }
            info.isLoadingNumber = false;
          });
        }
      });
    }
  }
  onIllegalReason(
    reason: {
      isOtherIllegalReason: boolean;
      otherIllegalReason: string;
      illegalReason: string;
    },
    info: ICombindInfo
  ) {
    info.isOtherIllegalReason = reason.isOtherIllegalReason;
    info.illegalReason = reason.illegalReason;
    info.otherIllegalReason = reason.otherIllegalReason;
  }
  onShowFriendlyReminder(item: ICombindInfo) {
    item.showFriendlyReminder = !item.showFriendlyReminder;
  }
  async onSelectTravelNumber(
    arg: {
      tmcOutNumberInfos: ITmcOutNumberInfo[];
      tmcOutNumberInfo: ITmcOutNumberInfo;
      travelUrlInfo: TravelUrlInfo;
    },
    item: IPassengerBookInfo
  ) {
    item.tmcOutNumberInfos = arg.tmcOutNumberInfos;
    const data = arg.travelUrlInfo;
    if (data) {
      if (data.CostCenterCode) {
        item.costCenter.code = data.CostCenterCode;
      }
      if (data.CostCenterName) {
        item.costCenter.name = data.CostCenterName;
      }
      if (data.OrganizationCode) {
        item.organization.Code = data.OrganizationCode;
      }
      if (data.OrganizationName) {
        item.organization.Name = data.OrganizationName;
      }
      if (data.TravelNumber) {
        arg.tmcOutNumberInfo.value = data.TravelNumber;
      }
    }
  }
  onOpenrules(item: ICombindInfo) {
    console.log("CombineedSelectedInfo", item);
    item.openrules = !item.openrules;
  }
  private async getTmc() {
    this.tmc = await this.tmcService.getTmc();
    console.log("tmc", this.tmc);
    return this.tmc;
  }
  onOrganizationChange(
    data: {
      isOtherOrganization: boolean;
      organization: OrganizationEntity;
      otherOrganizationName: string;
    },
    item: ICombindInfo
  ) {
    if (item && data.organization) {
      item.organization = data.organization;
      item.isOtherOrganization = data.isOtherOrganization;
      item.otherOrganizationName = data.otherOrganizationName;
    }
  }
  onCostCenterChange(
    data: {
      costCenter: {
        code: string;
        name: string;
      };
      isOtherCostCenter: boolean;
      otherCostCenterName: string;
      otherCostCenterCode: string;
    },
    item: ICombindInfo
  ) {
    // console.log("oncostCenterchange", data, item);
    if (data.costCenter && item) {
      item.costCenter = data.costCenter;
      item.isOtherCostCenter = data.isOtherCostCenter;
      item.otherCostCenterCode = data.otherCostCenterCode;
      item.otherCostCenterName = data.otherCostCenterName;
    }
  }
  calcTotalPrice() {
    // console.time("总计");
    if (this.vmCombindInfos) {
      let totalPrice = this.vmCombindInfos.reduce((arr, item) => {
        if (
          item.bookInfo &&
          item.bookInfo.bookInfo &&
          item.bookInfo.bookInfo.flightRoute &&
          item.bookInfo.bookInfo.flightRoute.selectFlightFare
        ) {
          const info = item.bookInfo;
          arr = +AppHelper.add(
            arr,
            +info.bookInfo.flightRoute.selectFlightFare.SalesPrice,
            +info.bookInfo.flightRoute.selectFlightFare.Tax
          );
        }
        if (item.insuranceProducts) {
          const p1 = +item.insuranceProducts
            .filter(
              (it) =>
                it.insuranceResult &&
                it.insuranceResult.Id == item.selectedInsuranceProductId
            )
            .reduce((sum, it) => {
              sum = +AppHelper.add(+it.insuranceResult.Price, sum);
              return sum;
            }, 0);
          arr = +AppHelper.add(arr, p1);
        }
        return +arr;
      }, 0);
      // console.log("totalPrice ", totalPrice);
      const fees = this.getTotalServiceFees();
      totalPrice = +AppHelper.add(fees, totalPrice);
      this.totalPriceSource.next(totalPrice);
    }
    // console.timeEnd("总计");
  }
  private getGroupedCombindInfo(arr: ICombindInfo[], tmc: TmcEntity) {
    const group = arr.reduce((acc, item) => {
      const id =
        (item &&
          item.bookInfo.passenger &&
          item.bookInfo.passenger.AccountId) ||
        (tmc && tmc.Account && tmc.Account.Id);
      if (id) {
        if (acc[id]) {
          acc[id].push(item);
        } else {
          acc[id] = [item];
        }
      }
      return acc;
    }, {} as { [accountId: string]: ICombindInfo[] });
    return group;
  }
  getGroupedTitle(item: ICombindInfo) {
    const group = this.getGroupedCombindInfo(this.vmCombindInfos, this.tmc);
    if (group) {
      const accountId =
        item.bookInfo.passenger.AccountId ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      if (group[accountId]) {
        return group[accountId]
          .map(
            (it) =>
              `${it.bookInfo.credential.Surname}${it.bookInfo.credential.Givenname}(${it.bookInfo.credential.Number})`
          )
          .join("、");
      }
    }
  }
  private fillGroupConbindInfoApprovalInfo(arr: ICombindInfo[]) {
    const group = this.getGroupedCombindInfo(arr, this.tmc);
    let result = arr;
    result = [];
    Object.keys(group).forEach((key) => {
      if (group[key].length) {
        const last = group[key][group[key].length - 1];
        result = result.concat(
          group[key].map((it) => {
            it.appovalStaff = last.appovalStaff;
            it.notifyLanguage = last.notifyLanguage;
            it.isSkipApprove = last.isSkipApprove;
            return it;
          })
        );
      }
    });
    return result;
  }
  async bookFlight(isSave: boolean = false, event: CustomEvent) {
    this.isShowFee = false;
    event.stopPropagation();
    if (this.isSubmitDisabled) {
      return;
    }
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    let canBook = false;
    let canBook2 = false;
    const isSelf = await this.staffService.isSelfBookType();
    this.isself = isSelf;
    const arr = this.fillGroupConbindInfoApprovalInfo(this.vmCombindInfos);
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = await this.fillBookPassengers(bookDto, arr);
    if (canBook && canBook2) {
      if (isSelf && this.isRoundTrip) {
        const p1 = bookDto.Passengers.find((it) => !!it.OutNumbers);
        const p2 = bookDto.Passengers.find((it) => !it.OutNumbers);
        const p = p2 && p2.OutNumbers ? p2 : p1 && p1.OutNumbers ? p1 : null;
        if (p && p.OutNumbers) {
          bookDto.Passengers = bookDto.Passengers.map((it) => {
            it.OutNumbers = p.OutNumbers;
            return it;
          });
        }
      }
      const res: IBookOrderResult = await this.flightService
        .bookFlight(bookDto)
        .catch((e) => {
          AppHelper.alert(e);
          return null;
        });
      if (res) {
        if (res.TradeNo && res.TradeNo != "0") {
          // AppHelper.toast("下单成功!", 1400, "top");
          this.isPlaceOrderOk = true;
          this.isSubmitDisabled = true;
          let isHasTask = res.HasTasks;
          let payResult = false;
          this.flightService.removeAllBookInfos();
          let checkPayResult = false;
          const isCheckPay = res.IsCheckPay;
          if (!isSave) {
            if (isCheckPay) {
              this.isCheckingPay = true;
              checkPayResult = await this.checkPay(res.TradeNo);
              this.isCheckingPay = false;
            } else {
              payResult = true;
            }
            if (checkPayResult) {
              if (this.isself && isHasTask) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                  true
                );
              } else {
                // if (isCheckPay) {
                // payResult = await this.tmcService.payOrder(res.TradeNo);
                // }
                if (isCheckPay) {
                  const isp =
                    this.orderTravelPayType == OrderTravelPayType.Person ||
                    this.orderTravelPayType == OrderTravelPayType.Credit;
                  payResult = await this.orderService.payOrder(
                    res.TradeNo,
                    null,
                    false,
                    isp ? this.tmcService.getQuickexpressPayWay() : []
                  );
                }
              }
            } else {
              if (this.isself) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingTip(isCheckPay),
                  true
                );
              }
            }
          } else {
            if (isSave) {
              await AppHelper.alert("订单已保存!");
            } else {
              // await AppHelper.alert("下单成功!");
            }
          }
          this.goToMyOrders();
        }
      }
    }
  }
  getInsurances(i) {
    this.vmCombindInfos.map((item) => {
      return {
        insurances: i
          .filter(
            (it) =>
              it.insuranceResult &&
              it.insuranceResult.Id == item.selectedInsuranceProductId
          )
          .map((it) => {
            return {
              name: it.insuranceResult && it.insuranceResult.Name,
              price: it.insuranceResult && it.insuranceResult.Price,
            };
          }),
      };
    });
  }
  private goToMyOrders() {
    this.router.navigate(["order-list"], {
      queryParams: { tabId: ProductItemType.plane },
    });
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>((s) => {
      let loading = false;
      this.checkPayCountIntervalId = setInterval(async () => {
        if (!loading) {
          loading = true;
          const result = await this.tmcService.checkPay(tradeNo, false);
          loading = false;
          this.checkPayCount--;
          if (!result) {
            if (this.checkPayCount < 0) {
              clearInterval(this.checkPayCountIntervalId);
              s(false);
            }
          } else {
            clearInterval(this.checkPayCountIntervalId);
            s(true);
          }
        }
      }, this.checkPayCountIntervalTime);
    });
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    if (!this.addContacts || this.addContacts.length == 0) {
      return true;
    }
    bookDto.Linkmans = [];
    const showErrorMsg = (msg: string, idx: number) => {
      AppHelper.alert(`第${idx + 1}个联系人信息${msg}不能为空`);
    };
    for (let j = 0; j < this.addContacts.length; j++) {
      const man = this.addContacts[j];
      const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
      if (!man.accountId) {
        showErrorMsg("", j);
        return false;
      }
      if (!man.mobile && !man.email) {
        if (!man.mobile) {
          showErrorMsg("Mobile", j);
          return false;
        }
        if (!man.email) {
          showErrorMsg("Email", j);
          return false;
        }
      }
      if (
        !(
          man.notifyLanguage == "" ||
          man.notifyLanguage == "cn" ||
          man.notifyLanguage == "en"
        )
      ) {
        showErrorMsg(LanguageHelper.getNotifyLanguageTip(), j);
        return false;
      }

      if (!man.name) {
        showErrorMsg("Name", j);
        return false;
      }
      linkMan.Id = man.accountId;
      if (man.email) {
        linkMan.Email = man.email;
      }
      linkMan.MessageLang = man.notifyLanguage;
      if (man.mobile) {
        linkMan.Mobile = man.mobile;
      }
      linkMan.Name = man.name;
      bookDto.Linkmans.push(linkMan);
    }
    return true;
  }
  credentialCompareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
  }
  async onChangeCredential(credentialSelect: IonSelect, item: ICombindInfo) {
    await this.onModify(item);
    if (credentialSelect) {
      credentialSelect.open();
    }
  }
  onManagementCredentials() {
    this.isManagementCredential = true;
    this.router.navigate(["member-credential-management"], {
      queryParams: { addNew: true },
    });
  }

  private async fillBookPassengers(
    bookDto: OrderBookDto,
    combindInfos: ICombindInfo[]
  ) {
    const showErrorMsg = async (
      msg: string,
      item: ICombindInfo,
      ele: HTMLElement
    ) => {
      await AppHelper.alert(
        !this.langService.isCn
          ? `${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.bookInfo.credential &&
            item.bookInfo.credential.Surname +
            item.bookInfo.credential.Givenname)
          } 【${item.bookInfo.credential && item.bookInfo.credential.Number
          }】 ${msg} Information cannot be empty`
          : `${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.bookInfo.credential &&
            item.bookInfo.credential.Surname +
            item.bookInfo.credential.Givenname)
          } 【${item.bookInfo.credential && item.bookInfo.credential.Number
          }】 ${msg} 信息不能为空`
      );
      this.moveRequiredEleToViewPort(ele);
    };
    bookDto.Passengers = [];
    const trips = this.flightService.getSearchModel().trips || [];
    const flightRoutes = [];
    const lastTrip = trips.slice(0).pop().bookInfo;
    const flightRoute = lastTrip.flightRoute;
    const selectFlightFare = flightRoute.selectFlightFare;
    for (const rid of selectFlightFare.FlightRouteIds) {
      const r = selectFlightFare.flightRoutes.find((it) => it.Id == rid);
      if (r) {
        flightRoutes.push({
          ...r,
          transferSegments: null,
          fromSegment: null,
          toSegment: null,
          minPriceFlightFare: null,
          flightFares: null,
          selectFlightFare: null,
        });
      }
    }
    const isGoBack =
      this.searchModel &&
      this.searchModel.voyageType == FlightVoyageType.GoBack;
    let i = 0;
    const isSelf = await this.staffService.isSelfBookType();
    for (const combindInfo of combindInfos) {
      i++;
      if (isGoBack && i > 1 && isSelf) {
        break;
      }
      const info = combindInfo.bookInfo.bookInfo;
      console.log(combindInfo.vmCredential, "combindInfo.vmCredential111");
      if (!combindInfo.vmCredential) {
        const a = await AppHelper.alert(
          "请维护第" + i + "个旅客的证件",
          true,
          "确定",
          "取消"
        );
        if (a) {
          this.onManagementCredentials();
        }
        return;
      }
      const accountId =
        combindInfo.bookInfo.passenger.AccountId ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove
      ) {
        const ele: HTMLElement = this.getEleByAttr(
          "approvalid",
          combindInfo.id
        );
        showErrorMsg(LanguageHelper.Flight.getApproverTip(), combindInfo, ele);
        return;
      }
      const p = new PassengerDto();
      if (trips.length) {
        if (i === 1) {
          p.FlightRoutes = flightRoutes;
          p.FlightSegments = lastTrip.flightRoute.FlightSegments;
          if (
            lastTrip &&
            lastTrip.flightRoute &&
            lastTrip.flightRoute.selectFlightFare
          ) {
            const cabinCodes = lastTrip.flightRoute.selectFlightFare.CabinCodes;
            if (cabinCodes) {
              p.FlightSegments = p.FlightSegments.map((s) => {
                if (!s.CabinCode) {
                  const code = cabinCodes[s.Number];
                  if (code) {
                    s.CabinCode = code;
                  }
                }
                return s;
              });
            }
          }
        }
        if (info.flightRoute) {
          p.FlightFare = info.flightRoute.selectFlightFare;
          p.FlightCabin = p.FlightFare as any;
          p.IllegalPolicy =
            p.FlightFare && p.FlightFare.policy && p.FlightFare.policy.Message;
        }
      }
      p.ClientId = accountId;
      p.ApprovalId =
        (this.isAllowSelectApprove(combindInfo) &&
          !combindInfo.isSkipApprove &&
          combindInfo.appovalStaff &&
          (combindInfo.appovalStaff.AccountId ||
            (combindInfo.appovalStaff.Account &&
              combindInfo.appovalStaff.Account.Id))) ||
        "0";
      if (
        !(
          combindInfo.notifyLanguage == "" ||
          combindInfo.notifyLanguage == "cn" ||
          combindInfo.notifyLanguage == "en"
        )
      ) {
        const ele: HTMLElement = this.getEleByAttr(
          "notifyLanguageid",
          combindInfo.id
        );
        showErrorMsg(LanguageHelper.getNotifyLanguageTip(), combindInfo, ele);
        return false;
      }
      p.MessageLang = combindInfo.notifyLanguage;
      p.CardName = "";
      p.CardNumber = "";
      p.TicketNum = "";
      p.Credentials = new CredentialsEntity();
      p.Credentials = { ...combindInfo.vmCredential };

      const el = this.getEleByAttr(
        "credentialcompid",
        combindInfo.id
      ) as HTMLElement;
      if (!combindInfo.vmCredential.Type) {
        showErrorMsg(LanguageHelper.getCredentialTypeTip(), combindInfo, el);
        return false;
      }
      p.Credentials.Type = combindInfo.vmCredential.Type;
      p.Credentials.Gender = combindInfo.vmCredential.Gender;
      if (!combindInfo.vmCredential.Number) {
        showErrorMsg(LanguageHelper.getCredentialNumberTip(), combindInfo, el);
        return false;
      }
      p.Credentials.Number = combindInfo.vmCredential.Number;
      p.Credentials.Givenname = combindInfo.vmCredential.Givenname;
      p.Credentials.Surname = combindInfo.vmCredential.Surname;
      p.Mobile =
        (combindInfo.credentialStaffMobiles &&
          combindInfo.credentialStaffMobiles
            .filter((m) => m.checked)
            .map((m) => m.mobile)
            .join(",")) ||
        "";
      if (combindInfo.credentialStaffOtherMobile) {
        p.Mobile = `${p.Mobile
          ? p.Mobile + "," + combindInfo.credentialStaffOtherMobile
          : combindInfo.credentialStaffOtherMobile
          }`;
      }
      p.Email =
        (combindInfo.credentialStaffEmails &&
          combindInfo.credentialStaffEmails
            .filter((e) => e.checked)
            .map((m) => m.email)
            .join(",")) ||
        "";
      if (combindInfo.credentialStaffOtherEmail) {
        p.Email = `${p.Email
          ? p.Email + "," + combindInfo.credentialStaffOtherEmail
          : combindInfo.credentialStaffOtherEmail
          }`;
      }
      if (combindInfo.insuranceProducts) {
        p.InsuranceProducts = [];
        for (const it of combindInfo.insuranceProducts) {
          if (
            it.insuranceResult &&
            it.insuranceResult.Id == combindInfo.selectedInsuranceProductId
          ) {
            p.InsuranceProducts.push(it.insuranceResult);
          }
        }
      }
      p.ExpenseType = combindInfo.expenseType;
      p.OrderFlightTicketType = OrderFlightTicketType.International;
      p.IllegalReason =
        combindInfo.otherIllegalReason || combindInfo.illegalReason || "";
      if (
        !combindInfo.bookInfo.isNotWhitelist &&
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.flightRoute &&
        combindInfo.bookInfo.bookInfo.flightRoute.selectFlightFare &&
        combindInfo.bookInfo.bookInfo.flightRoute.selectFlightFare.policy &&
        combindInfo.bookInfo.bookInfo.flightRoute.selectFlightFare.policy
          .Message
      ) {
        // 只有白名单的才需要考虑差标
        const ele: HTMLElement = this.getEleByAttr(
          "illegalReasonsid",
          combindInfo.id
        );
        if (!p.IllegalReason && this.tmc.IsNeedIllegalReason) {
          showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo,
            ele
          );
          return false;
        }
      }
      if (!p.Mobile) {
        const ele: HTMLElement = this.getEleByAttr("mobileid", combindInfo.id);
        showErrorMsg(LanguageHelper.Flight.getMobileTip(), combindInfo, ele);
        return false;
      }

      p.CostCenterCode =
        combindInfo.otherCostCenterCode ||
        (combindInfo.costCenter && combindInfo.costCenter.code) ||
        "";
      p.CostCenterName =
        combindInfo.otherCostCenterName ||
        (combindInfo.costCenter && combindInfo.costCenter.name) ||
        "";
      p.OrganizationName =
        combindInfo.otherOrganizationName ||
        (combindInfo.organization && combindInfo.organization.Name);
      p.OrganizationCode = combindInfo.otherOrganizationName
        ? ""
        : (combindInfo.organization && combindInfo.organization.Code) || "";
      const exists = bookDto.Passengers.find((it) => it.ClientId == accountId);
      if (combindInfo.tmcOutNumberInfos) {
        if (!exists || !exists.OutNumbers) {
          p.OutNumbers = {};
          for (const it of combindInfo.tmcOutNumberInfos) {
            if (it.required && !it.value) {
              const el = this.getEleByAttr("outnumber", combindInfo.id);
              showErrorMsg(
                it.label + this.langService.isCn ? "必填" : " Required ",
                combindInfo,
                el
              );
              return;
            }
            if (it.value) {
              p.OutNumbers[it.key] = it.value;
            }
          }
          if (!Object.keys(p.OutNumbers).length) {
            p.OutNumbers = null;
          }
        }
      }
      if (!combindInfo.travelType) {
        showErrorMsg(
          LanguageHelper.Flight.getTravelTypeTip(),
          combindInfo,
          null
        );
        return false;
      }
      if (!this.orderTravelPayType) {
        const el = this.getEleByAttr(
          "orderTravelPayTypeid",
          "orderTravelPayTypeid"
        );
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo,
          el as any
        );
        return false;
      }
      p.Credentials.Account =
        combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
      p.Credentials.Account =
        p.Credentials.Account || combindInfo.bookInfo.credential.Account;
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = this.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      p.Policy = combindInfo.bookInfo.passenger.Policy;
      p.RuleInfo = (p.FlightFare && p.FlightFare.Explain) || "";
      bookDto.Passengers.push(p);
    }
    return true;
  }
  private getEleByAttr(attrName: string, value: string) {
    return this.cnt["el"].querySelector(
      `[${attrName}='${value}']`
    ) as HTMLElement;
  }
  private async getCredentials(accountIds: string[]) {
    const res: {
      [accountId: string]: CredentialsEntity[];
    } = await this.tmcService.getPassengerCredentials(accountIds);
    return res;
  }
  async onModify(item: ICombindInfo) {
    if (!item.credentialsRequested) {
      const res = await this.getCredentials([
        item.bookInfo.passenger.AccountId,
      ]);
      const credentials = res && res[item.bookInfo.passenger.AccountId];
      item.credentials = credentials;
    }
    item.credentials = this.filterCredentials(item.credentials);
    item.vmCredential = item.credentials[0];
    console.log("onModify", item.credentials);
  }

  filterCredentials(credentials: CredentialsEntity[]) {
    let tmp = credentials;
    tmp = [];
    if (credentials) {
      // credentials = credentials.filter((t) => t.Type != CredentialsType.IdCard 
      // &&t.Type !=CredentialsType.AlienPermanentResidenceIdCard
      // &&t.Type !=CredentialsType.Other
      // &&t.Type !=CredentialsType.ResidencePermit);
      if (this.searchModel && this.searchModel.trips) {
        const hasHKMO = this.searchModel.trips.some((t) => {
          return "HK,MO".includes(
            t.bookInfo &&
            t.bookInfo.flightRoute &&
            t.bookInfo.flightRoute.ToCountry
          );
        });
        const hasTW = this.searchModel.trips.some((t) => {
          return (
            t.bookInfo &&
            t.bookInfo.flightRoute &&
            t.bookInfo.flightRoute.ToCountry == "TW"
          );
        });
        for (const c of credentials) {
          if (!hasHKMO) {
            tmp.push(c);
          }
        }
        if (hasHKMO) {
          credentials = credentials.filter(
            (t) => t.Type == CredentialsType.Passport
              || t.Type == CredentialsType.HmPass);
        } else if (hasTW) {
          credentials = credentials.filter(
            (t) => t.Type == CredentialsType.Passport
              || t.Type == CredentialsType.TwPass);
        } else {
          credentials = credentials.filter(
            (t) => t.Type == CredentialsType.Passport);
        }
      }
    }
    return credentials;
  }
  private moveRequiredEleToViewPort(ele: any) {
    const el: HTMLElement = (ele && ele.nativeElement) || ele;
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect) {
      if (this.cnt) {
        this.cnt.scrollByPoint(0, rect.top - this.plt.height() / 2, 100);
      }
    }
    this.generateAnimation(el);
  }
  private generateAnimation(el: HTMLElement) {
    el.style.display = "block";
    setTimeout(() => {
      requestAnimationFrame(() => {
        el.style.color = "var(--ion-color-danger)";
        el.classList.add("animated");
        el.classList.toggle("shake", true);
      });
    }, 200);
    const sub = fromEvent(el, "animationend").subscribe(() => {
      el.style.display = "";
      el.style.color = "";
      el.classList.toggle("shake", false);
      sub.unsubscribe();
    });
  }
  async openApproverModal(item: ICombindInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      const [name, emmail, number] = res.Text.split("|");
      item.appovalStaff =
        item.appovalStaff ||
        ({
          Account: new AccountEntity(),
        } as any);
      item.appovalStaff.AccountId = item.appovalStaff.Account.Id = res.Value;
      item.appovalStaff.Email = item.appovalStaff.Account.Email = emmail;
      // item.appovalStaff.Mobile = item.appovalStaff.Account.Mobile = mobile;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
      item.appovalStaff.Number = number;
    }
  }

  private async initSelfBookTypeCredentials(): Promise<CredentialsEntity[]> {
    if (await this.staffService.isSelfBookType()) {
      const identity = await this.identityService.getIdentityAsync();
      const id = (identity && identity.Id) || "";
      if (!id) {
        return [];
      }
      const res = await this.flightService.getPassengerCredentials([id]);
      let credential: CredentialsEntity;
      if (res && res[id] && res[id].length) {
        credential = res[id][0];
      }
      this.vmCombindInfos = this.vmCombindInfos.map((item) => {
        if (!item.bookInfo.credential || !item.bookInfo.credential.Number) {
          item.bookInfo.credential = credential;
        }
        item.vmModal = { ...item.bookInfo };
        return item;
      });
    }
  }
  private getOneServiceFee(item: ICombindInfo) {
    return (
      (this.initialBookDtoModel &&
        this.initialBookDtoModel.ServiceFees &&
        +this.initialBookDtoModel.ServiceFees[item.bookInfo.id]) ||
      0
    );
  }
  private getTotalServiceFees() {
    let fees = 0;
    if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
      fees = Object.keys(this.initialBookDtoModel.ServiceFees).reduce(
        (acc, key, idx) => {
          if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
            if (idx == 0) {
              const fee = +this.initialBookDtoModel.ServiceFees[key];
              acc = +AppHelper.add(fee, acc);
            }
          } else {
            const fee = +this.initialBookDtoModel.ServiceFees[key];
            acc = +AppHelper.add(fee, acc);
          }
          return acc;
        },
        0
      );
    }
    if (!this.tmcService.isAgent) {
      if (this.tmc && !this.tmc.IsShowServiceFee) {
        if (
          this.orderTravelPayType != OrderTravelPayType.Person &&
          this.orderTravelPayType != OrderTravelPayType.Credit
        ) {
          fees = 0;
        }
      }
    }
    // if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
    //   return +AppHelper.div(fees, 2);
    // }
    return fees as number;
  }
  getInsuranceDetails(detail: string) {
    return detail && detail.split("\n").join("<br/>");
  }
  onShowInsuranceDetail(insurance: { showDetail: boolean }, evt: CustomEvent) {
    if (evt) {
      evt.stopImmediatePropagation();
      evt.preventDefault();
    }
    if (insurance) {
      insurance.showDetail = !insurance.showDetail;
    }
  }
  async onShowPriceDetail() {
    const isSelf = await this.staffService.isSelfBookType();
    const combindInfos = this.vmCombindInfos || [];
    const p = await this.popoverCtrl.create({
      component: PriceDetailComponent,
      cssClass: "ticket-changing",
      componentProps: {
        priceInfos: combindInfos
          .map((item) => {
            const bookInfo = item.bookInfo && item.bookInfo.bookInfo;
            return {
              id: item.bookInfo.id,
              passengerCredential: item.bookInfo && item.bookInfo.credential,
              flightRoutes:
                this.searchModel &&
                this.searchModel.trips &&
                this.searchModel.trips.map(
                  (it) => it.bookInfo && it.bookInfo.flightRoute
                ),
              tos:
                bookInfo && bookInfo.toSegment && bookInfo.toSegment.ToCityName,
              price:
                bookInfo &&
                bookInfo.flightRoute &&
                bookInfo.flightRoute.selectFlightFare &&
                bookInfo.flightRoute.selectFlightFare.SalesPrice,
              tax:
                bookInfo &&
                bookInfo.flightRoute &&
                bookInfo.flightRoute.selectFlightFare &&
                bookInfo.flightRoute.selectFlightFare.Tax,
              insurances: item.insuranceProducts
                .filter(
                  (it) =>
                    it.insuranceResult &&
                    it.insuranceResult.Id == item.selectedInsuranceProductId
                )
                .map((it) => {
                  return {
                    name: it.insuranceResult && it.insuranceResult.Name,
                    price: it.insuranceResult && it.insuranceResult.Price,
                  };
                }),
            };
          })
          .filter((it) => it.flightRoutes && it.flightRoutes.length > 0),
        fees: this.getTicketsFees(),
        isSelf,
      },
    });
    p.present();
  }

  private getTicketsFees() {
    const totalFees = this.getTotalServiceFees();
    if (!totalFees) {
      return null;
    }
    const bookInfos = this.flightService.getBookInfos();
    return bookInfos.reduce((acc, it) => {
      acc = {
        ...acc,
        [it.id]:
          this.initialBookDtoModel &&
          this.initialBookDtoModel.ServiceFees[it.id],
      };
      return acc;
    }, {});
  }
  private initTipForPass() {
    const trips = this.searchModel.trips || [];
    if (this.vmCombindInfos) {
      const hongKongMacao = "HK,MO";
      const tanWan = "TW";
      const chinaPR = "CN";
      this.vmCombindInfos.forEach((it) => {
        const country = it.vmCredential.Country || it.vmModal.passenger.Country;
        if (trips.length) {
          const isTanWa = trips.some(
            (t) =>
              t.bookInfo &&
              t.bookInfo.flightRoute &&
              t.bookInfo.flightRoute.ToCountry == tanWan
          );
          const isHongKongMacao = trips.some(
            (t) =>
              t.bookInfo &&
              t.bookInfo.flightRoute &&
              hongKongMacao.includes(t.bookInfo.flightRoute.ToCountry)
          );
          const isChinaPR = trips.some(
            (t) =>
              t.bookInfo &&
              t.bookInfo.flightRoute &&
              (t.bookInfo.flightRoute.ToCountry == chinaPR ||
                t.bookInfo.flightRoute.FromCountry == chinaPR)
          );
          if (
            it.vmCredential.Type != CredentialsType.Passport &&
            !isHongKongMacao &&
            !isTanWa
          ) {
            it.tipForPass =
              "非港澳台地区出行，请选择护照，证件信息请重新填写！";
          } else if (country == "CN") {
            if (isHongKongMacao && isTanWa) {
              it.tipForPass =
                "大陆乘客往来台湾，请使用台湾通行证;如在台湾中转/经停，请选择护照并携带后续航班行程单 // 大陆乘客往来香港或澳门，请使用港澳通行证;使用护照出行的乘客，须同时持有7天内前往第三国或地区的机票";
            } else if (isHongKongMacao) {
              it.tipForPass =
                "大陆乘客往来香港或澳门，请使用港澳通行证;使用护照出行的乘客，须同时持有7天内前往第三国或地区的机票";
            } else if (isTanWa) {
              it.tipForPass =
                "大陆乘客往来台湾，请使用台湾通行证;如在台湾中转/经停，请选择护照并携带后续航班行程单";
            }
          } else if (country == "HK" || country == "MO") {
            if (isChinaPR) {
              it.tipForPass =
                "中国香港或中国澳门乘客来往内地，建议使用回乡证出行";
            }
          } else if (country == "TW") {
            if (isChinaPR) {
              it.tipForPass = "中国台湾乘客来往内地，建议使用台胞证出行";
            }
          }
        }
      });
    }
  }
  private async initCombindInfos() {
    try {
      const accountIdTmcOutNumberInfosMap: {
        [accountId: string]: ITmcOutNumberInfo[];
      } = {} as any;
      const isSelf = await this.staffService.isSelfBookType();
      const isSelfOrisSecretary =
        (await this.staffService.isSecretaryBookType()) ||
        (await this.staffService.isSelfBookType());
      const pfs = this.flightService.getBookInfos();
      // if (
      //   this.searchModel &&
      //   this.searchModel.voyageType == FlightVoyageType.GoBack &&
      //   isSelf
      // ) {
      //   pfs = [pfs[0]];
      // }
      const accountIds = pfs.map((it) => it.passenger.AccountId);
      const id2Credentials = await this.getCredentials(accountIds);
      let i = 0;
      for (const item of pfs) {
        if (isSelf && ++i > 1) {
          continue;
        }
        const cs = this.initialBookDtoModel.Staffs.find(
          (it) => it.Account.Id == item.passenger.AccountId
        );
        const cstaff = cs && cs.CredentialStaff;
        let credentials = id2Credentials[item.passenger.AccountId];
        const arr = cstaff && cstaff.Approvers;
        let credentialStaffApprovers: {
          Tag: string;
          Type: TaskType;
          approvers: StaffApprover[];
        }[];
        if (arr) {
          arr.sort((a, b) => a.Tag && b.Tag && +a.Tag - +b.Tag);
          const tempObj = arr.reduce((obj, it) => {
            if (obj[it.Tag]) {
              obj[it.Tag].push(it);
            } else {
              obj[it.Tag] = [it];
            }
            return obj;
          }, {} as { [Tag: string]: StaffApprover[] });
          credentialStaffApprovers = Object.keys(tempObj).map((key) => {
            const it = tempObj[key][0];
            return {
              Tag: it && it.Tag,
              Type: it && it.Type,
              approvers: tempObj[key],
            };
          });
          console.log("credentialStaffApprovers", credentialStaffApprovers);
        }
        // console.log("credentials", credentials, cstaff);
        if (
          item.credential &&
          !credentials.find(
            (it) =>
              it.Number == item.credential.Number &&
              it.Type == item.credential.Type
          )
        ) {
          credentials.push(item.credential);
        }
        credentials = this.filterCredentials(credentials);
        const insuranceProducts =
          (this.initialBookDtoModel.Insurances &&
            this.initialBookDtoModel.Insurances[item.id]) ||
          [];
        const insurances = insuranceProducts.map((insurance) => {
          return {
            insuranceResult: insurance,
            disabled:
              item.passenger &&
              item.passenger.Policy &&
              !!item.passenger.Policy.FlightForceInsuranceId,
            showDetail: false,
          };
        });
        const forceInsurance = insurances.find(
          (it) =>
            (item.passenger &&
              item.passenger.Policy &&
              item.passenger.Policy.FlightForceInsuranceId) ==
            +it.insuranceResult.Id
        );
        const combineInfo: ICombindInfo = {} as ICombindInfo;
        combineInfo.isShowTravelDetail = true;
        combineInfo.selectedInsuranceProductId =
          forceInsurance &&
          forceInsurance.insuranceResult &&
          forceInsurance.insuranceResult.Id;
        combineInfo.id = AppHelper.uuid();
        combineInfo.vmCredential = item.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.vmCredential = credentials[0] || item.credential;
        combineInfo.openrules = false;
        combineInfo.credentialStaff = cstaff;
        combineInfo.isOtherIllegalReason = false;
        combineInfo.showFriendlyReminder = false;
        combineInfo.isOtherOrganization = false;
        combineInfo.notifyLanguage = "cn";
        if (this.expenseTypes && this.expenseTypes.length) {
          combineInfo.expenseType = this.expenseTypes[0].Name;
        }
        combineInfo.travelType = OrderTravelType.Business; // 默认全部因公
        combineInfo.insuranceProducts = [];
        combineInfo.credentialStaffMobiles =
          cstaff && cstaff.Account && cstaff.Account.Mobile
            ? cstaff.Account.Mobile.split(",").map((mobile, idx) => {
              return {
                checked: idx == 0,
                mobile,
              };
            })
            : [];
        combineInfo.credentialStaffEmails =
          cstaff && cstaff.Account && cstaff.Account.Email
            ? cstaff.Account.Email.split(",").map((email, idx) => {
              return {
                checked: idx == 0,
                email,
              };
            })
            : [];
        combineInfo.credentialStaffApprovers = credentialStaffApprovers;
        combineInfo.organization = {
          Code: cstaff && cstaff.Organization && cstaff.Organization.Code,
          Name: cstaff && cstaff.Organization && cstaff.Organization.Name,
        } as any;
        combineInfo.costCenter = {
          code: cstaff && cstaff.CostCenter && cstaff.CostCenter.Code,
          name: cstaff && cstaff.CostCenter && cstaff.CostCenter.Name,
        };
        combineInfo.bookInfo = item;
        combineInfo.vmModal = { ...item };
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        const accountId =
          item.passenger.AccountId ||
          (this.tmc && this.tmc.Account && this.tmc.Account.Id);
        const tmcOutNumberInfos = accountIdTmcOutNumberInfosMap[accountId];
        combineInfo.tmcOutNumberInfos =
          tmcOutNumberInfos ||
          (
            (this.tmc &&
              this.tmc.OutNumberNameArray &&
              this.tmc.OutNumberNameArray) ||
            []
          ).map((n) => {
            return {
              label: n,
              key: n,
              isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
              required:
                isSelfOrisSecretary &&
                this.tmc &&
                this.tmc.OutNumberRequiryNameArray &&
                this.tmc.OutNumberRequiryNameArray.some((name) => name == n),
              value: this.getTravelFormNumber(n),
              staffNumber: cstaff && cstaff.Number,
              staffOutNumber: cstaff && cstaff.OutNumber,
              isTravelNumber: n.toLowerCase() == "TravelNumber".toLowerCase(),
              canSelect:
                true || n.toLowerCase() == "TravelNumber".toLowerCase(),
              isDisabled:
                false &&
                !!(
                  this.travelForm &&
                  n.toLowerCase() == "TravelNumber".toLowerCase()
                ),
            } as ITmcOutNumberInfo;
          });
        if (!accountIdTmcOutNumberInfosMap[accountId]) {
          accountIdTmcOutNumberInfosMap[accountId] =
            combineInfo.tmcOutNumberInfos;
        }
        this.vmCombindInfos.push(combineInfo);
        console.log(this.vmCombindInfos, "this.vmCombindInfos");
      }
      await this.initCombineInfosShowApproveInfo();
      this.initTipForPass();
    } catch (e) {
      console.error(e);
    }
  }
  private async initCombineInfosShowApproveInfo() {
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc();
    }
    if (this.vmCombindInfos) {
      const group = this.getGroupedCombindInfo(this.vmCombindInfos, this.tmc);
      this.vmCombindInfos = [];
      Object.keys(group).forEach((key) => {
        if (group[key].length) {
          const idx = group[key].length - 1;
          group[key][idx].isShowGroupedInfo = true;
          if (
            this.initialBookDtoModel &&
            this.initialBookDtoModel.ServiceFees
          ) {
            let showTotalFees = group[key].reduce(
              (acc, it) =>
                (acc = +AppHelper.add(acc, this.getOneServiceFee(it))),
              0
            );
            // if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
            //   showTotalFees = +AppHelper.div(showTotalFees, 2);
            // }
            group[key][idx].serviceFee = showTotalFees;
          }
        }
        this.vmCombindInfos = this.vmCombindInfos.concat(group[key]);
      });
    }
  }
  onSavecredential(credential: CredentialsEntity, info: ICombindInfo) {
    if (info && credential) {
      info.vmCredential = credential;
      info.bookInfo.credential = credential;
    }
  }
  async searchCostCenter(combindInfo: ICombindInfo) {
    if (combindInfo.isOtherCostCenter) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: SearchCostcenterComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      combindInfo.costCenter = {
        code: res.Value,
        name: res.Text && res.Text.substring(res.Text.lastIndexOf("-") + 1),
      };
    }
  }
  expanseCompareFn(t1: string, t2: string) {
    return t1 && t2 ? t1 === t2 : false;
  }
  onOpenSelect(select: IonSelect) {
    if (select) {
      select.open();
    }
  }
  async onSelectIllegalReason(item: ICombindInfo) {
    if (item.isOtherIllegalReason) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: SelectComponent,
      cssClass: "vw-70",
      componentProps: {
        label: "超标原因",
        data: (this.illegalReasons || []).map((it) => {
          return {
            label: it.Name,
            value: it.Name,
          };
        }),
      },
    });
    p.present();
    const data = await p.onDidDismiss();
    if (data && data.data) {
      item.illegalReason = data.data;
    }
  }
  onToggleShowTravelDetail(item: ICombindInfo) {
    item.isShowTravelDetail = !item.isShowTravelDetail;
  }
  async searchOrganization(combindInfo: ICombindInfo) {
    if (combindInfo.isOtherOrganization) {
      return;
    }
    const modal = await this.modalCtrl.create({
      component: OrganizationComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    console.log("organization", result.data);
    if (result && result.data) {
      const res = result.data as OrganizationEntity;
      combindInfo.organization = {
        ...combindInfo.organization,
        Code: res.Code,
        Name: res.Name,
      };
    }
  }
  onToggleShowCredentialDetail(item: ICombindInfo) {
    item.isShowCredentialDetail = !item.isShowCredentialDetail;
  }
  isShowApprove() {
    const Tmc = this.initialBookDtoModel && this.initialBookDtoModel.Tmc;
    if (
      !Tmc ||
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      !Tmc.FlightApprovalType
    ) {
      return false;
    }
    if (Tmc.FlightApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      this.flightService
        .getBookInfos()
        .some(
          (it) =>
            it.bookInfo &&
            it.bookInfo.flightRoute &&
            it.bookInfo.flightRoute.selectFlightFare &&
            it.bookInfo.flightRoute.selectFlightFare.policy &&
            !!it.bookInfo.flightRoute.selectFlightFare.policy.Message
        )
    ) {
      return true;
    }
    return false;
  }
  isAllowSelectApprove(info: ICombindInfo) {
    const Tmc = this.tmc;
    const staff = info.credentialStaff;
    if (
      !Tmc ||
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      !Tmc.FlightApprovalType
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.FlightApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyFree &&
      info.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.flightRoute &&
      info.bookInfo.bookInfo.flightRoute.selectFlightFare &&
      info.bookInfo.bookInfo.flightRoute.selectFlightFare.policy &&
      info.bookInfo.bookInfo.flightRoute.selectFlightFare.policy.Message
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.flightRoute &&
      info.bookInfo.bookInfo.flightRoute.selectFlightFare &&
      info.bookInfo.bookInfo.flightRoute.selectFlightFare.policy &&
      info.bookInfo.bookInfo.flightRoute.selectFlightFare.policy.Message
    ) {
      return true;
    }
    return false;
  }
}
interface IPassengerBookInfo {
  arrivalHotelTime: string;
  creditCardInfo: {
    isShowCreditCard: boolean;
    creditCardType: string;
    creditCardNumber: string;
    creditCardCvv: string;
    creditCardExpirationDate: string;
    expirationYear: string;
    expirationMonth: string;
    years: number[];
  };
  creditCardPersionInfo: {
    credentialType: string;
    credentialNumber: string;
    name: string;
  };
  isShowApprovalInfo: boolean;
  isNotWhitelist?: boolean;
  vmCredential: CredentialsEntity;
  credential: CredentialsEntity;
  credentials: CredentialsEntity[];
  notifyLanguage: string;
  isSkipApprove: boolean;
  isCanEditCrendentails: boolean;
  isShowRoomPlanRulesDesc: boolean;
  id: string;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  bookInfo: PassengerBookInfo<IInternationalFlightSegmentInfo>;
  isOpenrules?: boolean;
  travelType: OrderTravelType;
  addContacts?: AddContact[];
  isOtherCostCenter?: boolean;
  otherCostCenterCode?: string;
  otherCostCenterName?: string;
  isOtherOrganization?: boolean;
  costCenter: { code: string; name: string };
  organization: OrganizationEntity;
  otherOrganizationName: string;
  credentialStaffMobiles: {
    checked: boolean;
    mobile: string;
  }[];
  credentialStaffOtherMobile: string;
  credentialStaffEmails: {
    checked: boolean;
    email: string;
  }[];
  credentialStaffOtherEmail: string;

  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  credentialsRequested?: boolean;
  isOtherIllegalReason?: boolean;
  isShowFriendlyReminder?: boolean;
  illegalReason?: string;
  otherIllegalReason?: string;
}
interface ICombindInfo {
  id: string;
  vmModal: PassengerBookInfo<IInternationalFlightSegmentInfo>;
  bookInfo: PassengerBookInfo<IInternationalFlightSegmentInfo>;
  passengerDto: PassengerDto;
  openrules: boolean; // 打开退改签规则
  vmCredential: CredentialsEntity;
  credentials: CredentialsEntity[];
  expenseType: string;
  credentialsRequested: boolean;
  isShowCredentialDetail: boolean;
  isShowTravelDetail: boolean;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  isSkipApprove: boolean;
  notifyLanguage: string;
  serviceFee: number;
  isShowGroupedInfo: boolean;
  credentialStaffMobiles: {
    checked: boolean;
    mobile: string;
  }[];
  credentialStaffOtherMobile: string;
  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  credentialStaffEmails: {
    checked: boolean;
    email: string;
  }[];
  credentialStaffOtherEmail: string;
  showFriendlyReminder: boolean;
  costCenters: CostCenterEntity[];
  selectedCostCenter: CostCenterEntity;
  illegalReason: any;
  otherIllegalReason: any;
  isOtherIllegalReason: boolean;
  isOtherCostCenter: boolean;
  costCenter: {
    code: string;
    name: string;
  };
  otherCostCenterName: any;
  otherCostCenterCode: any;
  isOtherOrganization: boolean;
  organization: OrganizationEntity;
  otherOrganizationName: string;
  selectedInsuranceProductId: string;
  isShowTrip?: boolean;
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    disabled: boolean;
    showDetail?: boolean;
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  isTmcOutNumberRequeired: boolean;
  travelType: OrderTravelType; // 因公、因私
  tipForPass: string;
}
