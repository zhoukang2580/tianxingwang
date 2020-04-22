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
  StaffService,
} from "src/app/hr/staff.service";
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
} from "@ionic/angular";
import { RefresherComponent } from "src/app/components/refresher";
import { AddContact } from "src/app/tmc/models/AddContact";
import { LanguageHelper } from "src/app/languageHelper";
import { environment } from "src/environments/environment";
import { PriceDetailComponent } from "src/app/flight/components/price-detail/price-detail.component";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { Storage } from "@ionic/storage";
import { TMC_FLIGHT_OUT_NUMBER } from "../mock-data";
import { OrderFlightTicketType } from "src/app/order/models/OrderFlightTicketType";
@Component({
  selector: "app-flight-ticket-reserve",
  templateUrl: "./flight-ticket-reserve.page.html",
  styleUrls: ["./flight-ticket-reserve.page.scss"],
})
export class FlightTicketReservePage
  implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  private checkPayCount = 5;
  private checkPayCountIntervalTime = 3 * 1000;
  private checkPayCountIntervalId: any;
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
  isCanSkipApproval$: Observable<boolean>;
  orderTravelPayType: OrderTravelPayType;
  OrderTravelPayType = OrderTravelPayType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  totalPriceSource: Subject<number>;
  vmCombindInfos: ICombindInfo[];
  illegalReasons: any[];
  identity: IdentityEntity;
  tmc: TmcEntity;
  isDingTalk = AppHelper.isDingtalkH5();
  isRoundTrip = false;
  expenseTypes: any[];
  OrderTravelType = OrderTravelType;
  constructor(
    private flightService: InternationalFlightService,
    private route: ActivatedRoute,
    private identityService: IdentityService,
    private staffService: StaffService,
    private tmcService: TmcService,
    private storage: Storage,
    private plt: Platform,
    private popoverCtrl: PopoverController,
    private router: Router,
    private modalCtrl: ModalController
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }
  ngOnDestroy() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.errors = "";
      })
    );
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
        this.isCanSave = await this.identityService
          .getIdentityAsync()
          .catch((_) => null as IdentityEntity)
          .then((id) => {
            return !!(id && id.Numbers && id.Numbers["AgentId"]);
          });
      })
    );
    this.isCanSkipApproval$ = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource(),
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.IntFlightApprovalType != 0 &&
          tmc.IntFlightApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap((can) => {
        console.log("是否可以跳过审批", can);
      })
    );
    this.refresh(false);
  }
  private async initOrderTravelPayTypes() {
    const bookInfos = this.flightService.getBookInfos();
    const cabinPaytypes: string[] = [];
    bookInfos.forEach((info) => {
      if (
        info.bookInfo &&
        info.bookInfo.flightPolicy &&
        info.bookInfo.flightPolicy.OrderTravelPays
      ) {
        const arr0 = info.bookInfo.flightPolicy.OrderTravelPays.split(",");
        arr0.forEach((t) => {
          if (!cabinPaytypes.find((type) => type == t)) {
            cabinPaytypes.push(t);
          }
        });
      }
    });
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
    const isSelf = await this.staffService.isSelfBookType();
    infos.forEach((item) => {
      if (item.passenger) {
        const p = new PassengerDto();
        p.ClientId = item.id;
        p.FlightFare =
          item.bookInfo &&
          item.bookInfo.flightRoute &&
          item.bookInfo.flightRoute.policy &&
          item.bookInfo.flightRoute.policy.FlightFare;
        p.Credentials = item.credential;
        const account = new AccountEntity();
        account.Id = item.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        p.Policy = item.passenger.Policy;
        bookDto.Passengers.push(p);
      }
    });
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
      if (
        this.searchModel &&
        this.searchModel.trips &&
        this.searchModel.trips.some((it) => it.bookInfo)
      ) {
        if (this.searchModel.voyageType == FlightVoyageType.OneWay) {
          this.flightService.setBookInfoSource(
            this.flightService.getBookInfos().map((it, idx) => {
              if (idx == 0) {
                it.bookInfo = this.searchModel.trips[0].bookInfo;
              }
              return it;
            })
          );
        } else if (this.searchModel.voyageType == FlightVoyageType.GoBack) {
          this.flightService.setBookInfoSource(
            this.flightService.getBookInfos().map((it, idx) => {
              it.bookInfo = this.searchModel.trips[idx].bookInfo;
              return it;
            })
          );
        } else if (this.searchModel.voyageType == FlightVoyageType.MultiCity) {
          const trips = this.searchModel.trips;
          this.flightService.setBookInfoSource(
            this.flightService.getBookInfos().map((it) => {
              it.bookInfo = trips[trips.length - 1].bookInfo;
              return it;
            })
          );
        }
      }
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
      if (false && !environment.production) {
        const local = await this.storage.get(MOCK_FLIGHT_VMCOMBINDINFO);
        if (local && Array.isArray(local) && local.length) {
          this.vmCombindInfos = local;
          return local;
        }
      }
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
    const result = await this.tmcService.getTravelUrls(args);
    if (result) {
      this.vmCombindInfos.forEach((item) => {
        if (item.tmcOutNumberInfos) {
          item.tmcOutNumberInfos.forEach((info) => {
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
    console.log("oncostCenterchange", data, item);
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
          item.bookInfo.bookInfo.flightRoute.flightFare
        ) {
          const info = item.bookInfo;
          arr = AppHelper.add(
            arr,
            +info.bookInfo.flightRoute.flightFare.SalesPrice,
            +info.bookInfo.flightRoute.flightFare.Tax
          );
        }
        if (item.insuranceProducts) {
          arr += item.insuranceProducts
            .filter(
              (it) =>
                it.insuranceResult &&
                it.insuranceResult.Id == item.selectedInsuranceProductId
            )
            .reduce((sum, it) => {
              sum = AppHelper.add(+it.insuranceResult.Price, sum);
              return sum;
            }, 0);
        }
        return arr;
      }, 0);
      // console.log("totalPrice ", totalPrice);
      const fees = this.getTotalServiceFees();
      totalPrice = AppHelper.add(fees, totalPrice);
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
              `${it.bookInfo.credential.CheckName}(${it.bookInfo.credential.Number})`
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
  async bookFlight(isSave: boolean = false) {
    if (this.isSubmitDisabled) {
      return;
    }
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    let canBook = false;
    let canBook2 = false;
    const isSelf = await this.staffService.isSelfBookType();
    const arr = this.fillGroupConbindInfoApprovalInfo(this.vmCombindInfos);
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = this.fillBookPassengers(bookDto, arr);
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
        if (res.TradeNo) {
          AppHelper.toast("下单成功!", 1400, "top");
          this.isSubmitDisabled = true;
          this.flightService.removeAllBookInfos();
          if (
            !isSave &&
            isSelf &&
            this.orderTravelPayType == OrderTravelPayType.Person
          ) {
            this.isCheckingPay = true;
            const canPay = await this.checkPay(res.TradeNo);
            this.isCheckingPay = false;
            if (canPay) {
              if (res.HasTasks) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                  true
                );
              } else {
                await this.tmcService.payOrder(res.TradeNo);
              }
            } else {
              await AppHelper.alert(
                LanguageHelper.Order.getBookTicketWaitingTip(),
                true
              );
            }
          } else {
            if (isSave) {
              await AppHelper.alert("订单已保存");
            } else {
              await AppHelper.alert("下单成功!");
            }
          }
          this.goToMyOrders(ProductItemType.plane);
        }
      }
    }
  }
  private goToMyOrders(tab: ProductItemType) {
    this.router.navigate(["product-tabs"], {
      queryParams: { tabId: tab },
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
  private fillBookPassengers(
    bookDto: OrderBookDto,
    combindInfos: ICombindInfo[]
  ) {
    const showErrorMsg = (
      msg: string,
      item: ICombindInfo,
      ele: HTMLElement
    ) => {
      AppHelper.toast(
        `${
          (item.credentialStaff && item.credentialStaff.Name) ||
          (item.bookInfo.credential &&
            item.bookInfo.credential.CheckFirstName +
              item.bookInfo.credential.CheckLastName)
        } 【${
          item.bookInfo.credential && item.bookInfo.credential.Number
        }】 ${msg} 信息不能为空`,
        2000,
        "bottom"
      );
      this.moveRequiredEleToViewPort(ele);
    };
    bookDto.Passengers = [];
    let i = 0;
    const trips = this.flightService.getSearchModel().trips;
    const flightRoutes = trips
      .map((t) => t.bookInfo && t.bookInfo.flightRoute)
      .filter((it) => !!it)
      .map((r) => {
        return {
          ...r,
          FlightSegments: [],
          fromSegment: null,
          toSegment: null,
          transferSegments: [],
        };
      });
    for (const combindInfo of combindInfos) {
      i++;
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
      const info = combindInfo.bookInfo.bookInfo;
      const p = new PassengerDto();
      if (trips.length) {
        if (i === 1) {
          p.FlightRoutes = flightRoutes;
          p.FlightSegments =
            (this.flightService.flightListResult &&
              this.flightService.flightListResult.FlightSegments) ||
            [];
        }
        if (
          trips[trips.length - 1].bookInfo &&
          trips[trips.length - 1].bookInfo.flightRoute
        ) {
          p.FlightFare =
            trips[trips.length - 1].bookInfo.flightRoute.flightFare;
          p.FlightCabin = p.FlightFare as any;
          p.IllegalPolicy =
            trips[trips.length - 1].bookInfo.flightRoute.policy &&
            trips[trips.length - 1].bookInfo.flightRoute.policy.Message;
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
      if (!combindInfo.vmCredential.CheckLastName) {
        showErrorMsg(
          LanguageHelper.Flight.getCheckLastNameTip(),
          combindInfo,
          el
        );
        return false;
      }
      p.Credentials.CheckFirstName = combindInfo.vmCredential.CheckLastName;
      if (!combindInfo.vmCredential.CheckFirstName) {
        showErrorMsg(
          LanguageHelper.Flight.getCheckFirstNameTip(),
          combindInfo,
          el
        );
        return false;
      }
      p.Credentials.CheckFirstName = combindInfo.vmCredential.CheckFirstName;
      p.Mobile =
        (combindInfo.credentialStaffMobiles &&
          combindInfo.credentialStaffMobiles
            .filter((m) => m.checked)
            .map((m) => m.mobile)
            .join(",")) ||
        "";
      if (combindInfo.credentialStaffOtherMobile) {
        p.Mobile = `${
          p.Mobile
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
        p.Email = `${
          p.Email
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
        (this.tmc &&
          this.tmc.IsAllowCustomReason &&
          combindInfo.otherIllegalReason) ||
        combindInfo.illegalReason ||
        "";
      if (
        !combindInfo.bookInfo.isNotWhitelist &&
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.flightRoute &&
        combindInfo.bookInfo.bookInfo.flightRoute.flightFare &&
        combindInfo.bookInfo.bookInfo.flightRoute.policy
      ) {
        // 只有白名单的才需要考虑差标
        const ele: HTMLElement = this.getEleByAttr(
          "illegalReasonid",
          combindInfo.id
        );
        if (!p.IllegalReason) {
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
              showErrorMsg(it.label + "必填", combindInfo, el);
              return;
            }
            if (it.value) {
              p.OutNumbers[it.key] = it.value;
            }
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
      bookDto.Passengers.push(p);
    }
    return true;
  }
  private getEleByAttr(attrName: string, value: string) {
    return document.querySelector(`[${attrName}='${value}']`) as HTMLElement;
  }
  async onModify(item: ICombindInfo) {
    if (!item.credentialsRequested) {
      const res: {
        [accountId: string]: CredentialsEntity[];
      } = await this.tmcService
        .getPassengerCredentials([item.bookInfo.passenger.AccountId])
        .catch((_) => ({ [item.bookInfo.passenger.AccountId]: [] }));
      if (item.credentials.length) {
        const exist = item.credentials[0];
        const credentials = res && res[item.bookInfo.passenger.AccountId];
        item.credentialsRequested = credentials && credentials.length > 0;
        if (credentials) {
          if (credentials.length) {
            const one = credentials.find(
              (it) => it.Number == exist.Number && exist.Type == it.Type
            );
            if (one) {
              item.credentials = [
                one,
                ...credentials.filter((it) => it != one),
              ];
            } else {
              if (item.credentialsRequested) {
                item.credentials = credentials;
              }
            }
          } else {
          }
        }
      }
    }
    if (item.credentials) {
      item.credentials = item.credentials.filter((it) => !!it.Number);
    }
    console.log("onModify", item.credentials);
  }

  private moveRequiredEleToViewPort(ele: any) {
    const el: HTMLElement = ele.nativeElement || ele;
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
        (acc, key) => {
          const fee = +this.initialBookDtoModel.ServiceFees[key];
          acc = AppHelper.add(fee, acc);
          return acc;
        },
        0
      );
    }
    if (this.tmc && !this.tmc.IsShowServiceFee) {
      if (this.orderTravelPayType != OrderTravelPayType.Person) {
        fees = 0;
      }
    }
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
    const p = await this.popoverCtrl.create({
      component: PriceDetailComponent,
      cssClass: "ticket-changing",
      componentProps: {
        priceInfos:
          this.vmCombindInfos &&
          this.vmCombindInfos
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
                  bookInfo &&
                  bookInfo.toSegment &&
                  bookInfo.toSegment.ToCityName,
                price:
                  bookInfo &&
                  bookInfo.flightRoute &&
                  bookInfo.flightRoute.flightFare &&
                  bookInfo.flightRoute.flightFare.SalesPrice,
                tax:
                  bookInfo &&
                  bookInfo.flightRoute &&
                  bookInfo.flightRoute.flightFare &&
                  bookInfo.flightRoute.flightFare.Tax,
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
  private async initCombindInfos() {
    try {
      const accountIdTmcOutNumberInfosMap: {
        [accountId: string]: ITmcOutNumberInfo[];
      } = {} as any;
      const pfs = this.flightService.getBookInfos();
      for (const item of pfs) {
        const cs = this.initialBookDtoModel.Staffs.find(
          (it) => it.Account.Id == item.passenger.AccountId
        );
        const cstaff = cs && cs.CredentialStaff;
        const credentials = [];
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
        combineInfo.selectedInsuranceProductId =
          forceInsurance &&
          forceInsurance.insuranceResult &&
          forceInsurance.insuranceResult.Id;
        combineInfo.id = AppHelper.uuid();
        combineInfo.vmCredential = item.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.openrules = false;
        combineInfo.credentialStaff = cstaff;
        combineInfo.isOtherIllegalReason = false;
        combineInfo.showFriendlyReminder = false;
        combineInfo.isOtherOrganization = false;
        combineInfo.notifyLanguage = "cn";
        if (this.expenseTypes && this.expenseTypes.length) {
          combineInfo.expenseType = this.expenseTypes[0];
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
      }
      await this.initCombineInfosShowApproveInfo();
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
            const showTotalFees = group[key].reduce(
              (acc, it) =>
                (acc = AppHelper.add(acc, this.getOneServiceFee(it))),
              0
            );
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
  isShowApprove() {
    const Tmc = this.initialBookDtoModel && this.initialBookDtoModel.Tmc;
    if (
      !Tmc ||
      Tmc.IntFlightApprovalType == TmcApprovalType.None ||
      Tmc.IntFlightApprovalType == 0
    ) {
      return false;
    }
    if (Tmc.IntFlightApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.IntFlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      this.flightService
        .getBookInfos()
        .some(
          (it) =>
            it.bookInfo &&
            it.bookInfo.flightPolicy &&
            it.bookInfo.flightPolicy.Rules &&
            it.bookInfo.flightPolicy.Rules.length > 0
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
      Tmc.IntFlightApprovalType == TmcApprovalType.None ||
      Tmc.IntFlightApprovalType == 0
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.IntFlightApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.IntFlightApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }
    if (
      Tmc.IntFlightApprovalType == TmcApprovalType.ExceedPolicyFree &&
      info.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.flightRoute &&
      info.bookInfo.bookInfo.flightRoute.policy &&
      info.bookInfo.bookInfo.flightRoute.policy.Message
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.IntFlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.flightRoute &&
      info.bookInfo.bookInfo.flightRoute.policy &&
      info.bookInfo.bookInfo.flightRoute.policy.Message
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
}