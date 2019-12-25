import { PriceDetailComponent } from "./../components/price-detail/price-detail.component";
import { PayService } from "./../../services/pay/pay.service";
import { OrderBookDto } from "./../../order/models/OrderBookDto";
import { ActivatedRoute, Router } from "@angular/router";
import { InsuranceProductEntity } from "./../../insurance/models/InsuranceProductEntity";
import { CalendarService } from "../../tmc/calendar.service";
import { FlightSegmentEntity } from "./../models/flight/FlightSegmentEntity";
import {
  NavController,
  ModalController,
  IonCheckbox,
  PopoverController,
  IonContent,
  Platform,
  IonRefresher
} from "@ionic/angular";
import {
  TmcService,
  TmcEntity,
  TmcApprovalType,
  IllegalReasonEntity,
  TravelFormEntity,
  TravelUrlInfo,
  PassengerBookInfo,
  InitialBookDtoModel,
  IBookOrderResult
} from "./../../tmc/tmc.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import {
  StaffService,
  StaffEntity,
  CostCenterEntity,
  OrganizationEntity,
  StaffApprover,
  StaffBookType
} from "./../../hr/staff.service";
import { FlightService } from "src/app/flight/flight.service";
import {
  Component,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit,
  ElementRef,
  ViewChild
} from "@angular/core";
import { Storage } from "@ionic/storage";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import * as moment from "moment";
import { DayModel } from "../../tmc/models/DayModel";
import { LanguageHelper } from "src/app/languageHelper";
import { trigger, state, style } from "@angular/animations";
import { Subject, BehaviorSubject, from, combineLatest, of } from "rxjs";
import {
  OrderTravelType,
  OrderTravelPayType
} from "../../order/models/OrderTravelEntity";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import { TripType } from "src/app/tmc/models/TripType";
import { TaskType } from "src/app/workflow/models/TaskType";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { IFlightSegmentInfo } from "../models/PassengerFlightInfo";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { map, tap } from "rxjs/operators";
import { AddContact } from "src/app/tmc/models/AddContact";
import { environment } from "src/environments/environment";
import { ITmcOutNumberInfo } from 'src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component';
import { IPassengerHotelBookInfo } from 'src/app/hotel/book/book.page';
import { AccountEntity } from 'src/app/account/models/AccountEntity';

@Component({
  selector: "app-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"],
  animations: [
    trigger("showHide", [
      state("true", style({ display: "initial" })),
      state("false", style({ display: "none" }))
    ])
  ]
})
export class BookPage implements OnInit, AfterViewInit {
  vmCombindInfos: ICombindInfo[] = [];
  isSubmitDisabled = false;
  initialBookDtoModel: InitialBookDtoModel;
  errors: any;
  OrderTravelType = OrderTravelType;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
  }[];
  orderTravelPayType: OrderTravelPayType;
  checkPayCount = 5;
  checkPayCountIntervalTime = 3 * 1000;
  checkPayCountIntervalId: any;
  totalPriceSource: Subject<number>;
  tmc: TmcEntity;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[] = [];
  selfStaff: StaffEntity;
  identity: IdentityEntity;
  isCheckingPay: boolean;
  isCanSkipApproval$ = of(false);
  isCanSave = false;
  appoval: {
    Value: string;
    Text: string;
  };
  addContacts: AddContact[] = [];
  @ViewChildren("illegalReasonsEle", { read: ElementRef })
  illegalReasonsEles: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChild(IonContent) cnt: IonContent;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  constructor(
    private flightService: FlightService,
    private staffService: StaffService,
    private identityService: IdentityService,
    private tmcService: TmcService,
    private natCtrl: NavController,
    private modalCtrl: ModalController,
    private calendarService: CalendarService,
    private route: ActivatedRoute,
    private popoverCtrl: PopoverController,
    private plt: Platform,
    private router: Router,
    private storage: Storage
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }

  async ngOnInit() {
    this.flightService.setPassengerBookInfosSource(this.flightService.getPassengerBookInfos().filter(it => !!it.bookInfo))
    // 秘书和特殊角色可以跳过审批(如果有审批人)
    this.route.queryParamMap.subscribe(async () => {
      this.isCanSave = await this.identityService.getIdentityAsync().catch(_ => null as IdentityEntity).then(id => {
        return !!(id && id.Numbers && id.Numbers['AgentId']);
      })
      setTimeout(() => {
        this.refresh(false);
      }, 200);
    });
    this.isCanSkipApproval$ = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource()
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.FlightApprovalType != 0 &&
          tmc.FlightApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap(can => {
        console.log("是否可以跳过审批", can);
      })
    );
  }
  private async initOrderTravelPayTypes() {
    const bookInfos = this.flightService.getPassengerBookInfos();
    const cabinPaytypes: string[] = [];
    bookInfos.forEach(info => {
      if (info.bookInfo && info.bookInfo.flightPolicy && info.bookInfo.flightPolicy.OrderTravelPays) {
        const arr = info.bookInfo.flightPolicy.OrderTravelPays.split(",");
        arr.forEach(t => {
          if (!cabinPaytypes.find(type => type == t)) {
            cabinPaytypes.push(t);
          };
        })
      }
    })
    this.tmc = this.tmc || (await this.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch(_ => ({} as any));
    if (!this.initialBookDtoModel || !this.initialBookDtoModel.PayTypes) {
      return;
    }
    this.orderTravelPayType = this.tmc && this.tmc.FlightPayType;
    const arr = Object.keys(this.initialBookDtoModel.PayTypes);
    this.orderTravelPayTypes = [];
    arr.forEach(it => {
      if (!this.orderTravelPayTypes.find(item => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDtoModel.PayTypes[it],
          value: +it
        });
      }
    });
    if (cabinPaytypes.length) {
      this.orderTravelPayTypes = this.orderTravelPayTypes.filter(it => cabinPaytypes.some(cbt => cbt == it.label))
    }
    console.log("initOrderTravelPayTypes", this.orderTravelPayTypes);
  }
  private async initializeBookDto() {
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"] || "";
    const infos = this.flightService.getPassengerBookInfos();
    bookDto.Passengers = [];
    const isSelf = await this.staffService.isSelfBookType();
    infos.forEach(item => {
      if (item.passenger && item.bookInfo) {
        const p = new PassengerDto();
        p.ClientId = item.id;
        p.FlightSegment = item.bookInfo.flightSegment;
        p.FlightCabin = item.bookInfo.flightPolicy.Cabin;
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
    if (isSelf) {
      if (this.initialBookDtoModel && infos.length == 2) {
        if (this.initialBookDtoModel.ServiceFees) {
          const fees = {};
          Object.keys(this.initialBookDtoModel.ServiceFees).forEach(k => {
            infos.forEach(info => {
              fees[info.id] = +this.initialBookDtoModel.ServiceFees[k] / 2;
            });
          });
          this.initialBookDtoModel.ServiceFees = fees;
        }
      }
    }
    if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
      // 处理非白名单
      const bookInfos = this.flightService.getPassengerBookInfos();
      const notWhiteList = bookInfos.filter(it => it.isNotWhitelist);
      if (notWhiteList.length) {
        const fee = +this.initialBookDtoModel.ServiceFees[notWhiteList[0].id] / notWhiteList.length;
        notWhiteList.forEach(info => {
          this.initialBookDtoModel.ServiceFees[info.id] = `${fee}`;
        });
      }
    }
    return this.initialBookDtoModel;
  }
  ngAfterViewInit() {
    if (this.checkboxes) {
      this.checkboxes.changes.subscribe(() => {
        setTimeout(() => {
          this.calcTotalPrice();
        }, 0);
        this.checkboxes.forEach(c => {
          c.ionChange.subscribe(_ => {
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
    const one = this.travelForm.Numbers.find(n => n.Name == name);
    if (one) {
      return one.Code;
    }
    return "";
  }
  async refresh(byUser: boolean) {
    try {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 300);
      }
      if (byUser) {
        const ok = await AppHelper.alert("刷新将重新初始化页面，是否刷新？", true, LanguageHelper.getConfirmTip(), LanguageHelper.getCancelTip());
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
        it => {
          const item = new IllegalReasonEntity();
          item.Name = it;
          return item;
        }
      );
      await this.initSelfBookTypeCredentials(); // 如果是个人，获取个人是证件信息
      const notWhitelistCredentials = this.flightService
        .getPassengerBookInfos()
        .filter(it => it.isNotWhitelist);
      if (notWhitelistCredentials.length) {
        // 处理非白名单的人员证件信息
        console.log("notWhitelistCredentials", notWhitelistCredentials);
      }
      await this.initCombindInfos();
      this.initTmcOutNumberInfos();
      await this.initOrderTravelPayTypes();
      console.log("vmCombindInfos", this.vmCombindInfos);
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
      it => it == OrderTravelType[type]
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
    this.vmCombindInfos.forEach(item => {
      if (item.tmcOutNumberInfos) {
        item.tmcOutNumberInfos.forEach(it => {
          if (it.isLoadNumber) {
            if (
              it.staffNumber &&
              !args.find(n => n.staffNumber == it.staffNumber)
            ) {
              args.push({
                staffNumber: it.staffNumber,
                staffOutNumber: it.staffOutNumber,
                name: it.value
              });
            }
          }
        });
      }
    });
    const result = await this.tmcService.getTravelUrls(args);
    if (result) {
      this.vmCombindInfos.forEach(item => {
        if (item.tmcOutNumberInfos) {
          item.tmcOutNumberInfos.forEach(info => {
            info.loadTravelUrlErrorMsg = result[info.staffNumber] && result[info.staffNumber].Message;
            info.travelUrlInfos = result[info.staffNumber] && result[info.staffNumber].Data;
            if (
              !info.value &&
              info.travelUrlInfos &&
              info.travelUrlInfos.length
            ) {
              info.value = info.travelUrlInfos[0].TravelNumber;
            }
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
      tmcOutNumberInfo: ITmcOutNumberInfo,
      travelUrlInfo: TravelUrlInfo
    },
    item: IPassengerHotelBookInfo
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
        if (item.modal.bookInfo && item.modal.bookInfo.flightPolicy) {
          const info = item.modal.bookInfo;
          arr = AppHelper.add(
            arr,
            +info.flightPolicy.Cabin.SalesPrice,
            +info.flightPolicy.Cabin.Tax
          );
        }
        if (item.insuranceProducts) {
          arr += item.insuranceProducts
            .filter(it => it.checked)
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
  getMothDay(flightSegment: FlightSegmentEntity) {
    const t = flightSegment && moment(flightSegment.TakeoffTime);
    let d: DayModel;
    if (t) {
      d = this.calendarService.generateDayModel(t);
    }
    return `${t && t.format("MM月DD日")} ${d && d.dayOfWeekName} `;
  }
  getDate(s: FlightSegmentEntity) {
    if (!s) {
      return "";
    }
    const day = this.calendarService.generateDayModel(moment(s.TakeoffTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  getTripTip(info: IFlightSegmentInfo) {
    if (!info) {
      return "";
    }
    return `[${
      info.tripType == TripType.departureTrip
        ? LanguageHelper.getDepartureTip()
        : LanguageHelper.getReturnTripTip()
      }]`;
  }
  back() {
    this.natCtrl.back();
  }
  private getGroupedCombindInfo(arr: ICombindInfo[], tmc: TmcEntity) {
    const group = arr.reduce((acc, item) => {
      const id = (item.modal && item.modal.passenger && item.modal.passenger.AccountId) || tmc && tmc.Account && tmc.Account.Id;
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
  private fillGroupConbindInfoApprovalInfo(arr: ICombindInfo[]) {
    const group = this.getGroupedCombindInfo(arr, this.tmc);
    let result = arr;
    result = [];
    Object.keys(group).forEach(key => {
      if (group[key].length) {
        const last = group[key][group[key].length - 1];
        result = result.concat(group[key].map(it => {
          it.appovalStaff = last.appovalStaff;
          it.notifyLanguage = last.notifyLanguage;
          it.isSkipApprove = last.isSkipApprove;
          return it;
        }));
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
      const res: IBookOrderResult = await this.flightService.bookFlight(bookDto).catch(e => {
        AppHelper.alert(e);
        return null;
      });
      if (res) {
        if (res.TradeNo) {
          AppHelper.toast('下单成功!', 1400, "top");
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
                await AppHelper.alert(LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(), true);
              } else {
                await this.tmcService.payOrder(res.TradeNo);
              }
            } else {
              await AppHelper.alert(
                LanguageHelper.Order.getBookTicketWaitingTip(), true
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
      queryParams: { tabId: tab }
    });
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>(s => {
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
      AppHelper.alert(
        `第${idx + 1}个联系人信息${msg}不能为空`
      );
    };
    for (let j = 0; j < this.addContacts.length; j++) {
      const man = this.addContacts[j];
      const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
      if (!man.accountId) {
        showErrorMsg("", j);
        return false;
      }
      if (!man.email) {
        showErrorMsg("Email", j);
        return false;
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
      if (!man.mobile) {
        showErrorMsg("Mobile", j);
        return false;
      }
      if (!man.name) {
        showErrorMsg("Name", j);
        return false;
      }
      linkMan.Id = man.accountId;
      linkMan.Email = man.email;
      linkMan.MessageLang = man.notifyLanguage;
      linkMan.Mobile = man.mobile;
      linkMan.Name = man.name;
      bookDto.Linkmans.push(linkMan);
    }
    return true;
  }
  private fillBookPassengers(bookDto: OrderBookDto, combindInfos: ICombindInfo[]) {
    const showErrorMsg = (msg: string, item: ICombindInfo) => {
      AppHelper.alert(
        `${(item.credentialStaff && item.credentialStaff.Name) ||
        (item.modal.credential &&
          item.modal.credential.CheckFirstName +
          item.modal.credential.CheckLastName)} 【${item.modal.credential &&
          item.modal.credential.Number}】 ${msg} 信息不能为空`
      );
    };
    bookDto.Passengers = [];
    for (let i = 0; i < combindInfos.length; i++) {
      const combindInfo = combindInfos[i];
      const accountId = combindInfo.modal.passenger.AccountId || this.tmc && this.tmc.Account && this.tmc.Account.Id;
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove
      ) {
        showErrorMsg(LanguageHelper.Flight.getApproverTip(), combindInfo);
        return;
      }
      const info = combindInfo.modal.bookInfo;
      const p = new PassengerDto();
      p.ClientId = accountId;
      p.ApprovalId =
        (this.isAllowSelectApprove(combindInfo) &&
          !combindInfo.isSkipApprove &&
          (combindInfo.appovalStaff &&
            (combindInfo.appovalStaff.AccountId ||
              (combindInfo.appovalStaff.Account &&
                combindInfo.appovalStaff.Account.Id)))) ||
        "0";
      if (
        !(
          combindInfo.notifyLanguage == "" ||
          combindInfo.notifyLanguage == "cn" ||
          combindInfo.notifyLanguage == "en"
        )
      ) {
        showErrorMsg(LanguageHelper.getNotifyLanguageTip(), combindInfo);
        return false;
      }
      p.MessageLang = combindInfo.notifyLanguage;
      p.CardName = "";
      p.CardNumber = "";
      p.TicketNum = "";
      p.Credentials = new CredentialsEntity();
      p.Credentials = { ...combindInfo.vmCredential };
      if (!combindInfo.vmCredential.Type) {
        showErrorMsg(LanguageHelper.getCredentialTypeTip(), combindInfo);
        return false;
      }
      p.Credentials.Type = combindInfo.vmCredential.Type;
      p.Credentials.Gender = combindInfo.vmCredential.Gender;
      if (!combindInfo.vmCredential.Number) {
        showErrorMsg(LanguageHelper.getCredentialNumberTip(), combindInfo);
        return false;
      }
      p.Credentials.Number = combindInfo.vmCredential.Number;
      if (!combindInfo.vmCredential.CheckLastName) {
        showErrorMsg(LanguageHelper.Flight.getCheckLastNameTip(), combindInfo);
        return false;
      }
      p.Credentials.CheckFirstName = combindInfo.vmCredential.CheckLastName;
      if (!combindInfo.vmCredential.CheckFirstName) {
        showErrorMsg(LanguageHelper.Flight.getCheckFirstNameTip(), combindInfo);
        return false;
      }
      p.Credentials.CheckFirstName = combindInfo.vmCredential.CheckFirstName;
      p.IllegalPolicy =
        (info.flightPolicy &&
          info.flightPolicy.Rules &&
          info.flightPolicy.Rules.join(",")) ||
        "";
      p.Mobile =
        (combindInfo.credentialStaffMobiles &&
          combindInfo.credentialStaffMobiles
            .filter(m => m.checked)
            .map(m => m.mobile)
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
            .filter(e => e.checked)
            .map(m => m.email)
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
        for (let j = 0; j < combindInfo.insuranceProducts.length; j++) {
          const it = combindInfo.insuranceProducts[j];
          if (it.checked) {
            if (it.insuranceResult) {
              p.InsuranceProducts.push(it.insuranceResult);
            }
          }
        }
      }
      p.IllegalReason =
        (this.tmc &&
          this.tmc.IsAllowCustomReason &&
          combindInfo.otherIllegalReason) ||
        combindInfo.illegalReason ||
        "";
      if (
        !combindInfo.modal.isNotWhitelist &&
        combindInfo.modal.bookInfo &&
        combindInfo.modal.bookInfo.flightPolicy &&
        combindInfo.modal.bookInfo.flightPolicy.Rules &&
        combindInfo.modal.bookInfo.flightPolicy.Rules.length
      ) {
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason) {
          showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo
          );
          if (this.illegalReasonsEles) {
            this.moveRequiredEleToViewPort(this.illegalReasonsEles.first);
          }
          return false;
        }
      }
      if (!p.Mobile) {
        showErrorMsg(LanguageHelper.Flight.getMobileTip(), combindInfo);
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
      const exists = bookDto.Passengers.find(it => it.ClientId == accountId);
      if (combindInfo.tmcOutNumberInfos) {
        if (!exists || !exists.OutNumbers) {
          p.OutNumbers = {};
          combindInfo.tmcOutNumberInfos.forEach(it => {
            if (it.value) {
              p.OutNumbers[it.key] = it.value;
            }
          });
        }
      }
      if (!combindInfo.travelType) {
        showErrorMsg(LanguageHelper.Flight.getTravelTypeTip(), combindInfo);
        return false;
      }
      if (!this.orderTravelPayType) {
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo
        );
        return false;
      }
      p.Credentials.Account =
        combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
      p.Credentials.Account =
        p.Credentials.Account || combindInfo.modal.credential.Account;
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = this.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      p.FlightSegment = combindInfo.modal.bookInfo.flightSegment;
      p.FlightCabin = combindInfo.modal.bookInfo.flightPolicy.Cabin;
      if (p.FlightCabin) {
        p.FlightCabin.InsuranceProducts = p.InsuranceProducts;
        p.InsuranceProducts = null;
      }
      p.Policy = combindInfo.modal.passenger.Policy;
      bookDto.Passengers.push(p);
    }
    return true;
  }
  async onModify(item: ICombindInfo) {
    if (!item.credentialsRequested) {
      const res: {
        [accountId: string]: CredentialsEntity[];
      } = await this.tmcService
        .getPassengerCredentials([item.modal.passenger.AccountId])
        .catch(_ => ({ [item.modal.passenger.AccountId]: [] }));
      if (item.credentials.length) {
        const exist = item.credentials[0];
        const credentials = res && res[item.modal.passenger.AccountId];
        item.credentialsRequested = credentials && credentials.length > 0;
        if (credentials) {
          if (credentials.length) {
            const one = credentials.find(
              it => it.Number == exist.Number && exist.Type == it.Type
            );
            if (one) {
              item.credentials = [one, ...credentials.filter(it => it != one)];
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
      item.credentials = item.credentials.filter(it => !!it.Number);
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
  }
  async openApproverModal(item: ICombindInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent
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
          Account: new AccountEntity()
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
      this.vmCombindInfos = this.vmCombindInfos.map(item => {
        if (!item.modal.credential || !item.modal.credential.Number) {
          item.modal.credential = credential;
        }
        item.vmModal = { ...item.modal };
        return item;
      });
    }
  }
  private getServiceFee(item: ICombindInfo) {
    return (
      this.initialBookDtoModel &&
      this.initialBookDtoModel.ServiceFees &&
      + this.initialBookDtoModel.ServiceFees[item.modal.id]
    ) || 0;
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
  async onShowPriceDetail() {
    const isSelf = await this.staffService.isSelfBookType();
    const p = await this.popoverCtrl.create({
      component: PriceDetailComponent,
      cssClass: "ticket-changing",
      componentProps: {
        priceInfos:
          this.vmCombindInfos &&
          this.vmCombindInfos
            .map(item => {
              const bookInfo = item.modal && item.modal.bookInfo;
              return {
                id: item.modal.id,
                passengerCredential: item.modal && item.modal.credential,
                from:
                  bookInfo &&
                  bookInfo.flightSegment &&
                  bookInfo.flightSegment.FromCityName,
                to:
                  bookInfo &&
                  bookInfo.flightSegment &&
                  bookInfo.flightSegment.ToCityName,
                price:
                  bookInfo &&
                  bookInfo.flightPolicy &&
                  bookInfo.flightPolicy.Cabin &&
                  bookInfo.flightPolicy.Cabin.SalesPrice,
                tax:
                  bookInfo &&
                  bookInfo.flightSegment &&
                  bookInfo.flightSegment.Tax,
                insurances: item.insuranceProducts
                  .filter(it => it.checked)
                  .map(it => {
                    return {
                      name: it.insuranceResult && it.insuranceResult.Name,
                      price: it.insuranceResult && it.insuranceResult.Price
                    };
                  })
              };
            })
            .filter(it => !!it.from),
        fees: this.getTicketsFees(),
        isSelf
      }
    });
    p.present();
  }
  private getTicketsFees() {
    const totalFees = this.getTotalServiceFees();
    if (!totalFees) {
      return null;
    }
    const bookInfos = this.flightService.getPassengerBookInfos();
    return bookInfos.reduce((acc, it) => {
      acc = { ...acc, [it.id]: this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees[it.id] };
      return acc;
    }, {})
  }
  private async initCombindInfos() {
    try {
      const accountIdTmcOutNumberInfosMap: { [accountId: string]: ITmcOutNumberInfo[] } = {} as any;
      const pfs = this.flightService.getPassengerBookInfos().filter(it => !!it.bookInfo);
      for (let i = 0; i < pfs.length; i++) {
        const item = pfs[i];
        const cs = this.initialBookDtoModel.Staffs.find(
          it => it.Account.Id == item.passenger.AccountId
        );
        const cstaff = cs && cs.CredentialStaff;
        const credentials = [];
        const arr = cstaff && cstaff.Approvers && cstaff.Approvers.map(it => {
          it.RealName = it.Account && it.Account.RealName || "";
          return it;
        });
        let credentialStaffApprovers: {
          Tag: string;
          Type: TaskType;
          approvers: StaffApprover[];
        }[];
        if (arr) {
          arr.sort((a, b) => a.Tag && b.Tag && +a.Tag - +b.Tag);
          const tempObj = arr.reduce(
            (obj, it) => {
              if (obj[it.Tag]) {
                obj[it.Tag].push(it);
              } else {
                obj[it.Tag] = [it];
              }
              return obj;
            },
            {} as { [Tag: string]: StaffApprover[] }
          );
          credentialStaffApprovers = Object.keys(tempObj).map(key => {
            const it = tempObj[key][0];
            return {
              Tag: it && it.Tag,
              Type: it && it.Type,
              approvers: tempObj[key]
            };
          });
          console.log("credentialStaffApprovers", credentialStaffApprovers);
        }
        // console.log("credentials", credentials, cstaff);
        if (
          item.credential &&
          !credentials.find(
            it =>
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

        const insurances = insuranceProducts.map(insurance => {
          return {
            insuranceResult: insurance,
            checked:
              (item.passenger &&
                item.passenger.Policy &&
                item.passenger.Policy.FlightIsForceInsurance) ||
              insuranceProducts.length == 1
          };
        });
        const combineInfo: ICombindInfo = {} as ICombindInfo;
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
        combineInfo.travelType = OrderTravelType.Business; // 默认全部因公
        combineInfo.insuranceProducts = this.isShowInsurances(
          item.bookInfo &&
          item.bookInfo.flightSegment &&
          item.bookInfo.flightSegment.TakeoffTime
        )
          ? insurances
          : [];
        combineInfo.credentialStaffMobiles =
          cstaff && cstaff.Account && cstaff.Account.Mobile
            ? cstaff.Account.Mobile.split(",").map((mobile, idx) => {
              return {
                checked: idx == 0,
                mobile
              };
            })
            : [];
        combineInfo.credentialStaffEmails =
          cstaff && cstaff.Account && cstaff.Account.Email
            ? cstaff.Account.Email.split(",").map((email, idx) => {
              return {
                checked: idx == 0,
                email
              };
            })
            : [];
        combineInfo.credentialStaffApprovers = credentialStaffApprovers;
        combineInfo.organization = {
          Code: cstaff && cstaff.Organization && cstaff.Organization.Code,
          Name: cstaff && cstaff.Organization && cstaff.Organization.Name
        } as any;
        combineInfo.costCenter = {
          code: cstaff && cstaff.CostCenter && cstaff.CostCenter.Code,
          name: cstaff && cstaff.CostCenter && cstaff.CostCenter.Name
        };
        combineInfo.modal = item;
        combineInfo.vmModal = { ...item };
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        const accountId = item.passenger.AccountId || this.tmc && this.tmc.Account && this.tmc.Account.Id;
        const tmcOutNumberInfos = accountIdTmcOutNumberInfosMap[accountId];
        combineInfo.tmcOutNumberInfos = tmcOutNumberInfos ||
          (this.tmc &&
            this.tmc.OutNumberNameArray &&
            this.tmc.OutNumberNameArray || []).map(n => {
              return {
                label: n,
                key: n,
                isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
                required:
                  this.tmc && this.tmc.OutNumberRequiryNameArray &&
                  this.tmc.OutNumberRequiryNameArray.some(name => name == n),
                value: this.getTravelFormNumber(n),
                staffNumber: cstaff && cstaff.Number,
                staffOutNumber: cstaff && cstaff.OutNumber,
                isTravelNumber: n.toLowerCase() == "TravelNumber".toLowerCase(),
                canSelect: n.toLowerCase() == "TravelNumber".toLowerCase(),
                isDisabled: !!(this.travelForm && n.toLowerCase() == "TravelNumber".toLowerCase())
              } as ITmcOutNumberInfo;
            })
        if (!accountIdTmcOutNumberInfosMap[accountId]) {
          accountIdTmcOutNumberInfosMap[accountId] = combineInfo.tmcOutNumberInfos;
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
      Object.keys(group).forEach(key => {
        if (group[key].length) {
          const idx = group[key].length - 1;
          group[key][idx].isShowGroupedInfo = true;
          if (this.initialBookDtoModel && this.initialBookDtoModel.ServiceFees) {
            const showTotalFees = group[key]
              .reduce(
                (acc, it) => (acc = AppHelper.add(acc, this.getServiceFee(it)))
                , 0);
            group[key][idx].serviceFee = showTotalFees;
          }
        }
        this.vmCombindInfos = this.vmCombindInfos.concat(group[key]);
      })
    }
  }
  private isShowInsurances(takeoffTime: string) {
    if (takeoffTime) {
      return +moment(takeoffTime) > +moment(moment().add(2, "hours"));
    }
    return true;
  }
  onSavecredential(credential: CredentialsEntity, info: ICombindInfo) {
    if (info && credential) {
      info.vmCredential = credential;
    }
  }
  onContactsChange(contacts: AddContact[]) {
    if (contacts) {
      this.addContacts = contacts;
    }
  }

  isShowApprove() {
    const Tmc = this.initialBookDtoModel && this.initialBookDtoModel.Tmc;
    if (
      !Tmc ||
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      Tmc.FlightApprovalType == 0
    ) {
      return false;
    }
    if (Tmc.FlightApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      this.flightService
        .getPassengerBookInfos()
        .some(
          it =>
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
      Tmc.FlightApprovalType == TmcApprovalType.None ||
      Tmc.FlightApprovalType == 0
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
      info.modal.bookInfo &&
      info.modal.bookInfo.flightPolicy &&
      info.modal.bookInfo.flightPolicy.Rules &&
      info.modal.bookInfo.flightPolicy.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.FlightApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.modal.bookInfo &&
      info.modal.bookInfo.flightPolicy &&
      info.modal.bookInfo.flightPolicy.Rules &&
      info.modal.bookInfo.flightPolicy.Rules.length
    ) {
      return true;
    }
    return false;
  }
}


interface ICombindInfo {
  id: string;
  vmModal: PassengerBookInfo<IFlightSegmentInfo>;
  modal: PassengerBookInfo<IFlightSegmentInfo>;
  passengerDto: PassengerDto;
  openrules: boolean; // 打开退改签规则
  vmCredential: CredentialsEntity;
  credentials: CredentialsEntity[];
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
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    checked: boolean;
  }[];
  tmcOutNumberInfos: ITmcOutNumberInfo[];
  travelType: OrderTravelType; // 因公、因私
}
