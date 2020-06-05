import { RefresherComponent } from "src/app/components/refresher";
import { SearchTrainModel } from "./../train.service";
import { IBookOrderResult } from "./../../tmc/tmc.service";
import { ITrainInfo } from "../train.service";
import { CalendarService } from "../../tmc/calendar.service";
import { TrainEntity } from "../models/TrainEntity";
import { InsuranceProductEntity } from "../../insurance/models/InsuranceProductEntity";
import * as moment from "moment";
import {
  OrderTravelPayType,
  OrderTravelType,
} from "../../order/models/OrderTravelEntity";
import {
  StaffApprover,
  StaffEntity,
  OrganizationEntity,
} from "../../hr/staff.service";
import { IdentityService } from "../../services/identity/identity.service";
import {
  TmcEntity,
  TravelFormEntity,
  IllegalReasonEntity,
  TmcApprovalType,
  TravelUrlInfo,
  TmcService,
} from "src/app/tmc/tmc.service";
import { Storage } from "@ionic/storage";
import { OrderBookDto } from "../../order/models/OrderBookDto";
import { InitialBookDtoModel, PassengerBookInfo } from "../../tmc/tmc.service";
import { TrainService } from "../train.service";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  ViewChildren,
  ViewChild,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import {
  NavController,
  IonCheckbox,
  IonContent,
  IonRefresher,
  ModalController,
  PopoverController,
  Platform,
} from "@ionic/angular";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  Observable,
  of,
  from,
  combineLatest,
  Subject,
  BehaviorSubject,
  Subscription,
  fromEvent,
} from "rxjs";
import { map, tap } from "rxjs/operators";
import { StaffService } from "src/app/hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { AddContact } from "src/app/tmc/models/AddContact";
import { LanguageHelper } from "src/app/languageHelper";
import { TaskType } from "src/app/workflow/models/TaskType";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { PayService } from "src/app/services/pay/pay.service";
import { ITmcOutNumberInfo } from "src/app/tmc/components/book-tmc-outnumber/book-tmc-outnumber.component";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { OrderTrainTicketEntity } from "src/app/order/models/OrderTrainTicketEntity";
import { CredentialsType } from 'src/app/member/pipe/credential.pipe';

@Component({
  selector: "app-train-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"],
})
export class TrainBookPage implements OnInit, AfterViewInit, OnDestroy {
  private checkPayCountIntervalId: any;
  private isShowInsuranceBack = false;
  private checkPayCount = 5;
  private checkPayCountIntervalTime = 3 * 1000;
  private subscription = Subscription.EMPTY;
  searchTrainModel: SearchTrainModel;
  isSubmitDisabled = false;
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChild(IonContent) cnt: IonContent;
  @ViewChild(RefresherComponent) ionRefresher: RefresherComponent;
  initialBookDto: InitialBookDtoModel;
  bookInfos: PassengerBookInfo<ITrainInfo>[];
  viewModel: IBookTrainViewModel = {} as any;
  error: any;
  identity: IdentityEntity;
  tmc: TmcEntity;
  totalPriceSource: Subject<number>;
  isCanSave$ = of(false);
  OrderTravelPayType= OrderTravelPayType;
  addContacts: AddContact[] = [];
  isCheckingPay = false;
  isShowFee = false;
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
    checked?: boolean;
  }[];
  CredentialsType=CredentialsType;
  constructor(
    private trainService: TrainService,
    private storage: Storage,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private tmcService: TmcService,
    private router: Router,
    private calendarService: CalendarService,
    private plt: Platform
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }
  back() {
    this.navCtrl.pop();
  }
  async doRefresh(byUser: boolean) {
    try {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 300);
      }
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
      this.error = "";
      this.identity = await this.identityService.getIdentityAsync();
      this.bookInfos = this.trainService
        .getBookInfos()
        .filter((it) => !!it.bookInfo);
      this.initialBookDto = await this.getInitializeBookDto();
      if (!this.initialBookDto) {
        this.error = "初始化失败";
        return "";
      }
      this.tmc = this.initialBookDto.Tmc;
      await this.initializeViewModel();
      console.log(this.viewModel.combindInfos,"this.viewModel.combindInfos");
      
    } catch (e) {
      console.log(e);
      this.error = e;
    }
  }
  private async getInitializeBookDto() {
    // const mock = await this.storage.get("mock-initialBookDto-train");
    // if (mock) {
    //   return mock;
    // }
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"] || "";
    const infos = this.trainService.getBookInfos();
    bookDto.Passengers = [];
    infos.forEach((bookInfo) => {
      if (bookInfo.passenger && bookInfo.bookInfo) {
        const p = new PassengerDto();
        p.ClientId = bookInfo.id;
        p.Train = bookInfo.bookInfo.trainEntity;
        p.Train.BookSeatType = bookInfo.bookInfo.trainPolicy.SeatType;
        p.Credentials = bookInfo.credential;
        const account = new AccountEntity();
        account.Id = bookInfo.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        p.Policy = bookInfo.passenger.Policy;
        bookDto.Passengers.push(p);
      }
    });
    console.log("initializeBookDto", bookDto);
    this.initialBookDto = await this.trainService.getInitializeBookDto(bookDto);
    console.log("initializeBookDto", this.initialBookDto);
    await this.storage.set("mock-initialBookDto-train", this.initialBookDto);
    return this.initialBookDto;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngOnInit() {
    this.trainService.setBookInfoSource(
      this.trainService.getBookInfos().filter((it) => !!it.bookInfo)
    );
    this.doRefresh(false);
    this.isCanSave$ = this.identityService
      .getIdentitySource()
      .pipe(map((id) => id && id.Numbers && id.Numbers["AgentId"]));
    this.subscription = this.trainService
      .getSearchTrainModelSource()
      .subscribe((s) => {
        this.searchTrainModel = s;
      });
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
  onSeatPicker(seat: string, item: PassengerBookInfo<ITrainInfo>) {
    if (item.bookInfo) {
      item.bookInfo.pickSeat = seat || "";
      if (item.bookInfo.trainEntity) {
        item.bookInfo.trainEntity.BookSeatLocation = seat || "";
      }
      this.trainService.setBookInfoSource(
        this.trainService.getBookInfos().map((it) => {
          if (it.id == item.id) {
            if (it.bookInfo && it.bookInfo.trainEntity) {
              it.bookInfo.trainEntity.BookSeatLocation = seat || "";
            }
          }
          return it;
        })
      );
    }
  }
  private async initializeViewModel() {
    this.viewModel = {} as any;
    this.viewModel.isCanSkipApproval$ = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentitySource(),
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.TrainApprovalType != 0 &&
          tmc.TrainApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap((can) => {
        console.log("是否可以跳过审批", can);
      })
    );
    this.viewModel.travelForm = this.initialBookDto.TravelFrom;
    this.viewModel.expenseTypes = this.initialBookDto.ExpenseTypes;
    this.viewModel.illegalReasons = (
      this.initialBookDto.IllegalReasons || []
    ).map((it) => {
      return {
        Name: it,
      } as IllegalReasonEntity;
    });
    await this.initCombindInfos();
    await this.initCombineInfosShowApproveInfo();
    await this.initSelfBookTypeCredentials();
    this.initTmcOutNumberInfos();
    await this.initOrderTravelPayTypes();
    console.log("viewModel", this.viewModel);
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
  private async initCombindInfos() {
    try {
      this.viewModel.combindInfos = [];
      const isSelfOrisSecretary =
        (await this.staffService.isSecretaryBookType()) ||
        (await this.staffService.isSelfBookType());
      const bookInfos = this.trainService.getBookInfos();
      const exchangeInfo = bookInfos.find((it) => !!it.exchangeInfo);
      const exchange = exchangeInfo && exchangeInfo.exchangeInfo;
      const ticket = exchange && exchange.ticket;
      let notityLang = "cn";
      if (ticket && ticket.Passenger) {
        ticket.Passenger.VariablesJsonObj =
          ticket.Passenger.VariablesJsonObj ||
          JSON.parse(ticket.Passenger.Variables);
        if (ticket.Passenger.VariablesJsonObj["MessageLang"]) {
          notityLang = ticket.Passenger.VariablesJsonObj["MessageLang"];
        }
      }
      const accountIdTmcOutNumberInfosMap: {
        [accountId: string]: ITmcOutNumberInfo[];
      } = {} as any;
      for (const bookInfo of bookInfos) {
        const cs = (
          (this.initialBookDto && this.initialBookDto.Staffs) ||
          []
        ).find((it) => it.Account.Id == bookInfo.passenger.AccountId);
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
          bookInfo.credential &&
          !credentials.find(
            (it) =>
              it.Number == bookInfo.credential.Number &&
              it.Type == bookInfo.credential.Type
          )
        ) {
          credentials.push(bookInfo.credential);
        }
        const insurances = (
          (this.initialBookDto.Insurances &&
            this.initialBookDto.Insurances[bookInfo.id]) ||
          []
        ).map((insurance) => {
          return {
            insuranceResult: insurance,
            disabled:
              bookInfo &&
              bookInfo.passenger &&
              bookInfo.passenger.Policy &&
              !!bookInfo.passenger.Policy.TrainForceInsuranceId,
            showDetail: false,
          };
        });
        const combineInfo: ITrainPassengerBookInfo = {} as any;
        const forceInsurance = insurances.find((it) => it.disabled);
        combineInfo.selectedInsuranceProduct =
          forceInsurance && forceInsurance.insuranceResult;
        if (this.viewModel.expenseTypes && this.viewModel.expenseTypes.length) {
          combineInfo.expenseType = this.viewModel.expenseTypes[0];
        }
        combineInfo.credential = bookInfo.credential;
        combineInfo.id = bookInfo.id;
        combineInfo.bookInfo = bookInfo;
        combineInfo.vmCredential = bookInfo.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.isOpenrules = false;
        combineInfo.credentialStaff = cstaff;
        combineInfo.isOtherIllegalReason = false;
        combineInfo.isShowFriendlyReminder = false;
        combineInfo.isOtherOrganization = false;
        combineInfo.notifyLanguage = notityLang;
        combineInfo.travelType = OrderTravelType.Business; // 默认全部因公
        combineInfo.insuranceProducts = this.isShowInsurances(
          bookInfo.bookInfo &&
            bookInfo.bookInfo.trainEntity &&
            bookInfo.bookInfo.trainEntity.StartTime
        )
          ? insurances
          : [];

        combineInfo.credentialStaffMobiles =
          cstaff && cstaff.Account && cstaff.Account.Mobile
            ? cstaff.Account.Mobile.split(",").map((mobile, idx) => {
                return {
                  checked: idx == 0,
                  mobile,
                };
              })
            : [];
        if (this.searchTrainModel && this.searchTrainModel.isExchange) {
          if (
            !combineInfo.credentialStaffMobiles.length &&
            bookInfo.passenger &&
            bookInfo.passenger.Mobile
          ) {
            combineInfo.credentialStaffMobiles = [
              { checked: true, mobile: bookInfo.passenger.Mobile },
            ];
          }
        }
        combineInfo.credentialStaffEmails =
          cstaff && cstaff.Account && cstaff.Account.Email
            ? cstaff.Account.Email.split(",").map((email, idx) => {
                return {
                  checked: idx == 0,
                  email,
                };
              })
            : [];
        if (this.searchTrainModel && this.searchTrainModel.isExchange) {
          if (
            !combineInfo.credentialStaffEmails.length &&
            bookInfo.passenger &&
            bookInfo.passenger.Mobile
          ) {
            combineInfo.credentialStaffEmails = [
              { checked: true, email: bookInfo.passenger.Email },
            ];
          }
        }
        combineInfo.credentialStaffApprovers = credentialStaffApprovers;
        combineInfo.organization = {
          Code: cstaff && cstaff.Organization && cstaff.Organization.Code,
          Name: cstaff && cstaff.Organization && cstaff.Organization.Name,
        } as any;
        combineInfo.costCenter = {
          code: cstaff && cstaff.CostCenter && cstaff.CostCenter.Code,
          name: cstaff && cstaff.CostCenter && cstaff.CostCenter.Name,
        };
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        const accountId =
          bookInfo.passenger.AccountId ||
          (this.tmc && this.tmc.Account && this.tmc.Account.Id);
        const tmcOutNumberInfos = accountIdTmcOutNumberInfosMap[accountId];
        combineInfo.tmcOutNumberInfos =
          tmcOutNumberInfos ||
          (this.tmc &&
            this.tmc.OutNumberNameArray &&
            this.tmc.OutNumberNameArray.map((n) => {
              return {
                label: n,
                key: n,
                isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
                required:
                  (!this.searchTrainModel ||
                    !this.searchTrainModel.isExchange) &&
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
                    this.viewModel.travelForm &&
                    n.toLowerCase() == "TravelNumber".toLowerCase()
                  ),
              } as ITmcOutNumberInfo;
            })) ||
          [];
        if (!accountIdTmcOutNumberInfosMap[accountId]) {
          accountIdTmcOutNumberInfosMap[accountId] =
            combineInfo.tmcOutNumberInfos;
        }
        this.viewModel.combindInfos.push(combineInfo);
      }
    } catch (e) {
      console.error(e);
    }
  }
  getGroupedTitle(item: ITrainPassengerBookInfo) {
    const group = this.getGroupedCombindInfo(
      this.viewModel.combindInfos,
      this.tmc
    );
    if (group) {
      const accountId =
        (item.bookInfo &&
          item.bookInfo.passenger &&
          item.bookInfo.passenger.AccountId) ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      if (group[accountId]) {
        return group[accountId]
          .map((it) => `${it.credential.Name}(${it.credential.Number})`)
          .join("、");
      }
    }
  }
  async bookTrain(isSave: boolean = false, event: CustomEvent) {
    this.isShowFee = false;
    event.stopPropagation();
    if (this.isSubmitDisabled) {
      return;
    }
    const exchangeInfo = this.trainService
      .getBookInfos()
      .find((it) => !!it.exchangeInfo);
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    let canBook = false;
    let canBook2 = false;
    this.viewModel.combindInfos = this.fillGroupConbindInfoApprovalInfo(
      this.viewModel.combindInfos
    );
    canBook = this.fillBookLinkmans(bookDto);
    canBook2 = this.fillBookPassengers(bookDto);
    if (
      exchangeInfo &&
      exchangeInfo.exchangeInfo &&
      exchangeInfo.exchangeInfo.ticket
    ) {
      bookDto.TicketId = exchangeInfo.exchangeInfo.ticket.Id;
    }
    const exchangeTip = "改签申请提交成功";
    if (canBook && canBook2) {
      let res: IBookOrderResult;
      if (exchangeInfo && exchangeInfo.exchangeInfo) {
        res = await this.trainService.exchangeBook(bookDto).catch((e) => {
          AppHelper.alert(e);
          return null;
        });
      } else {
        res = await this.trainService.bookTrain(bookDto).catch((e) => {
          const msg: string = e;
          if (msg && /\d{11}-/.test(msg)) {
            const tips = msg
              .split("/")
              .filter((it) => !!it)
              .map((it) => {
                const [phone, code] = it.split("-");
                return `使用手机号${phone},发送验证码${code}到12306进行手机身份验证(验证码30分钟内有效)`;
              })
              .join("\r\n");
            AppHelper.alert(tips);
            return;
          }
          AppHelper.alert(e);
          return null;
        });
      }
      if (res) {
        if (res.TradeNo) {
          AppHelper.toast(
            exchangeInfo && exchangeInfo.exchangeInfo
              ? exchangeTip
              : "下单成功!",
            1400,
            "top"
          );
          this.isSubmitDisabled = true;
          const isSelf = await this.staffService.isSelfBookType();
          if (
            !isSave &&
            isSelf &&
            this.viewModel.orderTravelPayType == OrderTravelPayType.Person
          ) {
            this.isCheckingPay = true;
            const canPay = await this.checkPay(res.TradeNo);
            this.isCheckingPay = false;
            if (canPay) {
              if (res.HasTasks) {
                await AppHelper.alert(
                  exchangeInfo && exchangeInfo.exchangeInfo
                    ? res.Message || exchangeTip
                    : LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
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
              await AppHelper.alert("订单已保存", true);
            } else {
              await AppHelper.alert(
                exchangeInfo && exchangeInfo.exchangeInfo
                  ? res.Message || exchangeTip
                  : "下单成功",
                true
              );
            }
          }
          this.trainService.removeAllBookInfos();
          this.viewModel.combindInfos = [];
          this.trainService.setSearchTrainModelSource({
            ...this.trainService.getSearchTrainModel(),
            isExchange: false,
            isLocked: false,
          });
          const isExchange = exchangeInfo && !!exchangeInfo.exchangeInfo;
          this.goToMyOrders(ProductItemType.train, isExchange);
        }
      }
    }
  }
  private getTotalServiceFees() {
    let fees = 0;
    if (this.initialBookDto && this.initialBookDto.ServiceFees) {
      fees = Object.keys(this.initialBookDto.ServiceFees).reduce((acc, key) => {
        const fee = +this.initialBookDto.ServiceFees[key];
        acc = AppHelper.add(fee, acc);
        return acc;
      }, 0);
    }
    if (this.tmc && !this.tmc.IsShowServiceFee) {
      if (
        this.viewModel &&
        this.viewModel.orderTravelPayType != OrderTravelPayType.Person&&
        this.viewModel.orderTravelPayType != OrderTravelPayType.Credit
      ) {
        fees = 0;
      }
    }
    return fees as number;
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>((s) => {
      let loading = false;
      if (this.checkPayCountIntervalId) {
        clearInterval(this.checkPayCountIntervalId);
      }
      this.checkPayCountIntervalId = setInterval(async () => {
        if (!loading) {
          loading = true;
          const result = await this.tmcService.checkPay(tradeNo);
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

  calcTotalPrice() {
    const exchange = this.trainService
      .getBookInfos()
      .find((it) => !!it.exchangeInfo);
    console.log(
      "this.viewModel.orderTravelPayType",
      this.viewModel.orderTravelPayType
    );
    if (this.viewModel && this.viewModel.combindInfos) {
      let totalPrice = this.viewModel.combindInfos.reduce((arr, item) => {
        if (
          item.bookInfo &&
          item.bookInfo.bookInfo &&
          item.bookInfo.bookInfo.trainPolicy
        ) {
          const info = item.bookInfo.bookInfo;
          const seat = info.trainEntity.Seats.find(
            (it) =>
              it.SeatType == info.trainPolicy.SeatType &&
              info.trainEntity.TrainNo == info.trainPolicy.TrainNo
          );

          arr = AppHelper.add(arr, +((seat && seat.SalesPrice) || 0));
        }
        if (!exchange) {
          if (item.insuranceProducts) {
            arr += item.insuranceProducts
              .filter(
                (it) => it.insuranceResult == item.selectedInsuranceProduct
              )
              .reduce((sum, it) => {
                sum = AppHelper.add(+it.insuranceResult.Price, sum);
                return sum;
              }, 0);
          }
        }
        return arr;
      }, 0);
      // console.log("totalPrice ", totalPrice);
      let fees = this.getTotalServiceFees();
      if (fees && exchange) {
        fees = +(this.tmc && this.tmc.TrainExchangeOnlineFee) || 0;
      }
      totalPrice = AppHelper.add(fees, totalPrice);
      const info = this.trainService
        .getBookInfos()
        .find((it) => !!it.exchangeInfo);
      if (info && info.exchangeInfo) {
        const ticket = info.exchangeInfo.ticket as OrderTrainTicketEntity;
        const insurnanceAmount = info.exchangeInfo.insurnanceAmount;
        if (ticket) {
          totalPrice += -ticket.TicketPrice;
        } else {
          totalPrice += +insurnanceAmount;
        }
      }
      this.totalPriceSource.next(totalPrice);
    }
    // console.timeEnd("总计");
  }
  private goToMyOrders(tab: ProductItemType, isExchange = false) {
    this.router.navigate(["product-tabs"], {
      queryParams: { tabId: tab, doRefresh: isExchange },
    });
  }
  private isShowInsurances(takeoffTime: string) {
    if (takeoffTime) {
      return +moment(takeoffTime) > +moment(moment().add(2, "hours"));
    }
    return true;
  }
  private getTravelFormNumber(name: string) {
    if (!this.viewModel || !this.viewModel.travelForm) {
      return "";
    }
    if (name == "TravelNumber") {
      return this.viewModel.travelForm.TravelNumber;
    }
    if (this.viewModel.travelForm.Numbers == null) {
      return "";
    }
    const one = this.viewModel.travelForm.Numbers.find((n) => n.Name == name);
    if (one) {
      return one.Code;
    }
    return "";
  }
  private async initOrderTravelPayTypes() {
    // console.log("initOrderTravelPayTypes", this.initialBookDto);
    this.orderTravelPayTypes = [];
    this.tmc = this.tmc || (await this.tmcService.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => ({} as any));
    if (
      !this.initialBookDto ||
      !this.initialBookDto.PayTypes ||
      !this.viewModel
    ) {
      return;
    }
    this.viewModel.orderTravelPayType = this.tmc && this.tmc.TrainPayType;
    const arr = Object.keys(this.initialBookDto.PayTypes);
    arr.forEach((it) => {
      if (!this.orderTravelPayTypes.find((item) => item.value == +it)) {
        this.orderTravelPayTypes.push({
          label: this.initialBookDto.PayTypes[it],
          value: +it,
          checked: +it == +this.tmc.TrainPayType,
        });
      }
    });
    this.orderTravelPayTypes = this.orderTravelPayTypes.map((it) => {
      it.checked = +it.value == +this.tmc.TrainPayType;
      return it;
    });
    const info = this.trainService
      .getBookInfos()
      .find((it) => !!it.exchangeInfo);
    const exchangeInfo = info && info.exchangeInfo;
    if (
      exchangeInfo &&
      exchangeInfo.ticket &&
      exchangeInfo.ticket.Order &&
      exchangeInfo.ticket.Order.Variables
    ) {
      exchangeInfo.ticket.Order.VariablesJsonObj =
        exchangeInfo.ticket.Order.VariablesJsonObj ||
        JSON.parse(exchangeInfo.ticket.Order.Variables);
      if (exchangeInfo.ticket.Order.VariablesJsonObj["TravelPayType"]) {
        this.viewModel.orderTravelPayType = +exchangeInfo.ticket.Order
          .VariablesJsonObj["TravelPayType"];
        this.orderTravelPayTypes = this.orderTravelPayTypes.map((it) => {
          it.checked =
            +it.value ==
            +exchangeInfo.ticket.Order.VariablesJsonObj["TravelPayType"];
          return it;
        });
      }
    }
    console.log(
      "initOrderTravelPayTypes",
      this.orderTravelPayTypes,
      `viewModel.orderTravelPayType=${this.viewModel.orderTravelPayType}`
    );
  }
  onOrderTravelPayTypeSelect(pt: { value: number }) {
    this.orderTravelPayTypes = this.orderTravelPayTypes.map((it) => {
      it.checked = +it.value == pt.value;
      return it;
    });
  }
  private async initSelfBookTypeCredentials(): Promise<CredentialsEntity[]> {
    if (await this.staffService.isSelfBookType()) {
      const identity = await this.identityService.getIdentityAsync();
      const id = (identity && identity.Id) || "";
      if (!id) {
        return [];
      }
      const res = await this.trainService.getPassengerCredentials([id]);
      let credential: CredentialsEntity;
      if (res && res[id] && res[id].length) {
        credential = res[id][0];
      }
      this.viewModel.combindInfos = this.viewModel.combindInfos.map((item) => {
        if (!item.credential || !item.credential.Number) {
          item.credential = credential;
        }
        return item;
      });
    }
  }
  getDate(train: TrainEntity) {
    if (!train) {
      return "";
    }
    const day = this.calendarService.generateDayModel(moment(train.StartTime));
    return `${day.date} ${day.dayOfWeekName}`;
  }
  private getOneServiceFee(item: ITrainPassengerBookInfo) {
    let fee =
      (this.initialBookDto &&
        this.initialBookDto.ServiceFees &&
        +this.initialBookDto.ServiceFees[item.id]) ||
      0;
    // console.log(item.id, fee, this.initialBookDto);
    if (this.searchTrainModel && this.searchTrainModel.isExchange) {
      fee = this.tmc && +this.tmc.TrainExchangeOnlineFee;
    }
    return fee || 0;
  }
  isAllowSelectApprove(info: ITrainPassengerBookInfo) {
    const Tmc = this.initialBookDto.Tmc;
    const staff = info.credentialStaff;
    if (
      !Tmc ||
      Tmc.TrainApprovalType == TmcApprovalType.None ||
      Tmc.TrainApprovalType == 0
    ) {
      return false;
    }
    if (!staff) {
      return true;
    }
    if (Tmc.TrainApprovalType == TmcApprovalType.Free) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.TrainApprovalType == TmcApprovalType.Approver
    ) {
      return true;
    }
    if (
      Tmc.TrainApprovalType == TmcApprovalType.ExceedPolicyFree &&
      info.bookInfo &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.trainPolicy &&
      info.bookInfo.bookInfo.trainPolicy.Rules &&
      info.bookInfo.bookInfo.trainPolicy.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.TrainApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.bookInfo.bookInfo &&
      info.bookInfo.bookInfo.trainPolicy &&
      info.bookInfo.bookInfo.trainPolicy.Rules &&
      info.bookInfo.bookInfo.trainPolicy.Rules.length
    ) {
      return true;
    }
    return false;
  }
  onOpenrules(item: ITrainPassengerBookInfo) {
    console.log("CombineedSelectedInfo", item);
    item.isOpenrules = !item.isOpenrules;
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
  private getEleByAttr(attrName: string, value: string) {
    return this.cnt["el"].querySelector(
      `[${attrName}='${value}']`
    ) as HTMLElement;
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
  private fillBookPassengers(bookDto: OrderBookDto) {
    const showErrorMsg = (
      msg: string,
      item: ITrainPassengerBookInfo,
      ele: HTMLElement
    ) => {
      AppHelper.toast(
        `${
          (item.credentialStaff && item.credentialStaff.Name) ||
          (item.bookInfo.credential &&
            item.bookInfo.credential.Surname +
              item.bookInfo.credential.Givenname)
        } 【${
          item.bookInfo.credential && item.bookInfo.credential.Number
        }】 ${msg} 信息不能为空`,
        2000,
        "bottom"
      );
      this.moveRequiredEleToViewPort(ele);
    };
    bookDto.Passengers = [];
    for (const combindInfo of this.viewModel.combindInfos) {
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
      const info = combindInfo.bookInfo && combindInfo.bookInfo.bookInfo;
      if (!info) {
        continue;
      }
      const accountId =
        combindInfo.bookInfo.passenger.AccountId ||
        (this.tmc && this.tmc.Account && this.tmc.Account.Id);
      const p = new PassengerDto();
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
      p.Credentials.Type = combindInfo.vmCredential.Type;
      p.Credentials.Gender = combindInfo.vmCredential.Gender;
      p.Credentials.Number = combindInfo.vmCredential.Number;
      p.Credentials.Surname = combindInfo.vmCredential.Surname;
      p.Credentials.Givenname = combindInfo.vmCredential.Givenname;
      p.IllegalPolicy =
        (info.trainPolicy &&
          info.trainPolicy.Rules &&
          info.trainPolicy.Rules.join(",")) ||
        "";
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
          if (it.insuranceResult == combindInfo.selectedInsuranceProduct) {
            p.InsuranceProducts.push(it.insuranceResult);
          }
        }
      }
      p.ExpenseType = combindInfo.expenseType;
      p.IllegalReason =
        (this.tmc &&
          this.tmc.IsAllowCustomReason &&
          combindInfo.otherIllegalReason) ||
        combindInfo.illegalReason ||
        "";
      if (
        !combindInfo.isNotWhitelist &&
        combindInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.trainPolicy &&
        combindInfo.bookInfo.bookInfo.trainPolicy.Rules &&
        combindInfo.bookInfo.bookInfo.trainPolicy.Rules.length
      ) {
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason) {
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
              const el = this.getEleByAttr("outnumber", "outnumber");
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
      if (this.viewModel && !this.viewModel.orderTravelPayType) {
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
        p.Credentials.Account || combindInfo.credential.Account;
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = this.viewModel.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      if (
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.trainEntity &&
        combindInfo.bookInfo.bookInfo.trainPolicy
      ) {
        p.Train = combindInfo.bookInfo.bookInfo.trainEntity;
        if (
          p.Train &&
          p.Train.BookSeatLocation &&
          !p.Train.BookSeatLocation.startsWith("1")
        ) {
          p.Train.BookSeatLocation = `1${p.Train.BookSeatLocation}`;
        }
        p.Train.BookSeatType =
          combindInfo.bookInfo.bookInfo.trainPolicy.SeatType;
      }
      if (combindInfo.bookInfo) {
        p.Policy = combindInfo.bookInfo.passenger.Policy;
      }
      bookDto.Passengers.push(p);
    }
    return true;
  }
  private getGroupedCombindInfo(
    arr: ITrainPassengerBookInfo[],
    tmc: TmcEntity
  ) {
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
    }, {} as { [accountId: string]: ITrainPassengerBookInfo[] });
    return group;
  }
  private fillGroupConbindInfoApprovalInfo(arr: ITrainPassengerBookInfo[]) {
    const group = this.getGroupedCombindInfo(arr, this.tmc);
    let result = arr;
    result = [];
    Object.keys(group).forEach((key) => {
      if (group[key].length) {
        const idx = group[key].length - 1;
        const last = group[key][idx];
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
  private async initCombineInfosShowApproveInfo() {
    if (!this.tmc) {
      this.tmc = await this.tmcService.getTmc();
    }
    if (this.viewModel && this.viewModel.combindInfos) {
      const group = this.getGroupedCombindInfo(
        this.viewModel.combindInfos,
        this.tmc
      );
      this.viewModel.combindInfos = [];
      Object.keys(group).forEach((key) => {
        if (group[key].length) {
          const idx = group[key].length - 1;
          group[key][idx].isShowGroupedInfo = true;
          if (this.initialBookDto && this.initialBookDto.ServiceFees) {
            const showTotalFees = group[key].reduce(
              (acc, it) =>
                (acc = AppHelper.add(acc, this.getOneServiceFee(it))),
              0
            );
            group[key][idx].serviceFee = showTotalFees;
          }
        }
        this.viewModel.combindInfos = this.viewModel.combindInfos.concat(
          group[key]
        );
      });
    }
  }
  async openApproverModal(item: ITrainPassengerBookInfo) {
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
      item.appovalStaff.Number = number;
      item.appovalStaff.Name = item.appovalStaff.Account.Name = name;
    }
  }
  private async initTmcOutNumberInfos() {
    const args: {
      staffNumber: string;
      staffOutNumber: string;
      name: string;
    }[] = [];
    if (!this.viewModel || !this.viewModel.combindInfos) {
      return false;
    }
    const outnumbers =
      (this.initialBookDto && this.initialBookDto.OutNumbers) || {};

    this.viewModel.combindInfos.forEach((item) => {
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
    });
    this.viewModel.combindInfos.forEach((item) => {
      item.tmcOutNumberInfos.forEach((info) => {
        info.isLoadingNumber = true;
      });
    });
    const result = await this.tmcService.getTravelUrls(args);
    if (result) {
      this.viewModel.combindInfos.forEach((item) =>
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
        })
      );
    } else {
      this.viewModel.combindInfos.forEach((item) => {
        item.tmcOutNumberInfos.forEach((info) => {
          info.isLoadingNumber = false;
        });
      });
    }
  }
  onIllegalReason(
    reason: {
      isOtherIllegalReason: boolean;
      otherIllegalReason: string;
      illegalReason: string;
    },
    info: ITrainPassengerBookInfo
  ) {
    info.isOtherIllegalReason = reason.isOtherIllegalReason;
    info.illegalReason = reason.illegalReason;
    info.otherIllegalReason = reason.otherIllegalReason;
  }
  async onModify(item: ITrainPassengerBookInfo) {
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
    item: ITrainPassengerBookInfo
  ) {
    console.log("oncostCenterchange", data, item);
    if (data.costCenter && item) {
      item.costCenter = data.costCenter;
      item.isOtherCostCenter = data.isOtherCostCenter;
      item.otherCostCenterCode = data.otherCostCenterCode;
      item.otherCostCenterName = data.otherCostCenterName;
    }
  }
  onOrganizationChange(
    data: {
      isOtherOrganization: boolean;
      organization: OrganizationEntity;
      otherOrganizationName: string;
    },
    item: ITrainPassengerBookInfo
  ) {
    if (item && data.organization) {
      item.organization = data.organization;
      item.isOtherOrganization = data.isOtherOrganization;
      item.otherOrganizationName = data.otherOrganizationName;
    }
  }
  onContactsChange(contacts: AddContact[]) {
    if (contacts) {
      this.addContacts = contacts;
    }
  }
  onSavecredential(
    credential: CredentialsEntity,
    info: ITrainPassengerBookInfo
  ) {
    if (info && credential) {
      info.vmCredential = credential;
    }
  }
  async onSelectTravelNumber(
    arg: {
      tmcOutNumberInfos: ITmcOutNumberInfo[];
      tmcOutNumberInfo: ITmcOutNumberInfo;
      travelUrlInfo: TravelUrlInfo;
    },
    item: ITrainPassengerBookInfo
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
  onShowProductDetail(insurance: InsuranceProductEntity, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (!insurance || !insurance.DetailUrl) {
      return;
    }
    this.isShowInsuranceBack = true;
    this.router.navigate([AppHelper.getRoutePath("open-url")], {
      queryParams: { url: insurance.DetailUrl, title: insurance.Name },
    });
  }
  getInsuranceDetails(detail: string) {
    return detail && detail.split("\n").join("<br/>");
  }
  isShowApprove(combindInfo: PassengerBookInfo<ITrainInfo>) {
    const Tmc = this.tmc;
    if (
      !Tmc ||
      Tmc.TrainApprovalType == TmcApprovalType.None ||
      Tmc.FlightApprovalType == 0
    ) {
      return false;
    }
    if (Tmc.TrainApprovalType == TmcApprovalType.Approver) {
      return true;
    }
    if (
      Tmc.TrainApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      combindInfo &&
      combindInfo.bookInfo &&
      combindInfo.bookInfo.trainPolicy &&
      combindInfo.bookInfo.trainPolicy.Rules
    ) {
      return true;
    }
    return false;
  }
}
export interface IBookTrainViewModel {
  tmc: TmcEntity;
  orderTravelPayType: OrderTravelPayType;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[];
  expenseTypes: string[];
  combindInfos: ITrainPassengerBookInfo[];
  isCanSkipApproval$: Observable<boolean>;
  identity: IdentityEntity;
}
interface ITrainPassengerBookInfo {
  isShowGroupedInfo?: boolean;
  serviceFee: number;
  isNotWhitelist?: boolean;
  vmCredential: CredentialsEntity;
  credential: CredentialsEntity;
  credentials: CredentialsEntity[];
  notifyLanguage: string;
  isSkipApprove: boolean;
  id: string;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  bookInfo: PassengerBookInfo<ITrainInfo>;
  isOpenrules?: boolean;
  travelType: OrderTravelType;
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
  selectedInsuranceProduct: InsuranceProductEntity;
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    disabled: boolean;
    showDetail: boolean;
  }[];
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
  expenseType: string;
  otherIllegalReason?: string;
}
