import { InsuranceProductEntity } from "./../../insurance/models/InsuranceProductEntity";
import { OrderLinkmanEntity } from "./../../order/models/OrderLinkmanEntity";
import * as moment from "moment";
import {
  OrderTravelPayType,
  OrderTravelType
} from "./../../order/models/OrderTravelEntity";
import {
  StaffApprover,
  StaffEntity,
  OrganizationEntity
} from "./../../hr/staff.service";
import { IdentityService } from "./../../services/identity/identity.service";
import {
  TmcEntity,
  TravelFormEntity,
  IllegalReasonEntity,
  TmcApprovalType,
  TravelUrlInfo,
  TmcService
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
  AfterViewInit
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { PassengerDto } from "src/app/tmc/models/PassengerDto";
import { AccountEntity } from "src/app/tmc/models/AccountEntity";
import {
  NavController,
  IonCheckbox,
  IonContent,
  IonRefresher,
  ModalController,
  PopoverController
} from "@ionic/angular";
import { CredentialsEntity } from "src/app/tmc/models/CredentialsEntity";
import {
  Observable,
  of,
  from,
  combineLatest,
  Subject,
  BehaviorSubject
} from "rxjs";
import { map, tap } from "rxjs/operators";
import { StaffService } from "src/app/hr/staff.service";
import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { SearchApprovalComponent } from "src/app/tmc/components/search-approval/search-approval.component";
import { SelectTravelNumberComponent } from "src/app/tmc/components/select-travel-number-popover/select-travel-number-popover.component";
import { AddContact } from "src/app/tmc/models/AddContact";
import { LanguageHelper } from "src/app/languageHelper";
import { TaskType } from "src/app/workflow/models/TaskType";
import { OrderLinkmanDto } from "src/app/order/models/OrderLinkmanDto";
import { ProductItemType } from "src/app/tmc/models/ProductItems";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { PayService } from "src/app/services/pay/pay.service";

@Component({
  selector: "app-train-book",
  templateUrl: "./book.page.html",
  styleUrls: ["./book.page.scss"]
})
export class TrainBookPage implements OnInit, AfterViewInit {
  @ViewChildren(IonCheckbox) checkboxes: QueryList<IonCheckbox>;
  @ViewChild(IonContent) cnt: IonContent;
  @ViewChild(IonRefresher) ionRefresher: IonRefresher;
  initialBookDto: InitialBookDtoModel;
  bookInfos: PassengerBookInfo[];
  viewModel: IBookTrainViewModel = {} as any;
  error: any;
  identity: IdentityEntity;
  tmc: TmcEntity;
  totalPriceSource: Subject<number>;
  private isCheckingPay = false;
  private checkPayCountIntervalId: any;
  private orderBookDto: OrderBookDto;
  private checkPayCount = 5;
  private checkPayCountIntervalTime = 3 * 1000;
  constructor(
    private trainService: TrainService,
    private storage: Storage,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private tmcService: TmcService,
    private router: Router,
    private payService: PayService
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
  }
  back() {
    this.navCtrl.back();
  }
  private async getInitializeBookDto() {
    const mock = await this.storage.get("mock-initialBookDto-train");
    if (mock) {
      return mock;
    }
    const bookDto = new OrderBookDto();
    bookDto.TravelFormId = AppHelper.getQueryParamers()["travelFormId"] || "";
    const infos = this.trainService.getBookInfos();
    bookDto.Passengers = [];
    infos.forEach(bookInfo => {
      if (bookInfo.passenger && bookInfo.trainInfo) {
        const p = new PassengerDto();
        p.ClientId = bookInfo.id;
        p.Train = bookInfo.trainInfo.trainEntity;
        p.Train.BookSeatType = bookInfo.trainInfo.trainPolicy.SeatType;
        p.Credentials = bookInfo.credential;
        const account = new AccountEntity();
        account.Id = bookInfo.passenger.AccountId;
        p.Credentials.Account = p.Credentials.Account || account;
        bookDto.Passengers.push(p);
      }
    });
    this.initialBookDto = await this.trainService.getInitializeBookDto(bookDto);
    this.orderBookDto = bookDto;
    console.log("initializeBookDto", this.initialBookDto);
    await this.storage.set("mock-initialBookDto-train", this.initialBookDto);
    return this.initialBookDto;
  }
  ngOnInit() {
    this.doRefresh();
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
  async doRefresh() {
    try {
      if (this.ionRefresher) {
        this.ionRefresher.complete();
        this.ionRefresher.disabled = true;
        setTimeout(() => {
          this.ionRefresher.disabled = false;
        }, 300);
      }
      this.error = "";
      this.identity = await this.identityService.getIdentityAsync();
      this.bookInfos = this.trainService
        .getBookInfos()
        .filter(it => !!it.trainInfo);
      if (!this.bookInfos || !this.bookInfos.length) {
        this.bookInfos = (await this.storage.get("MOCK-TRAIN-BOOKINFO")) || [];
      } else {
        this.storage.set("MOCK-TRAIN-BOOKINFO", this.bookInfos);
      }
      this.initialBookDto = await this.getInitializeBookDto();
      if (!this.initialBookDto) {
        this.error = "初始化失败";
        return "";
      }
      this.tmc = this.initialBookDto.Tmc;
      await this.initializeViewModel();
    } catch (e) {
      console.log(e);
      this.error = e;
    }
  }
  private async initializeViewModel() {
    this.viewModel = {} as any;
    this.viewModel.bookDto = this.orderBookDto;
    this.viewModel.isCanSkipApproval$ = combineLatest([
      from(this.tmcService.getTmc()),
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentity()
    ]).pipe(
      map(([tmc, isSelfType, identity]) => {
        return (
          tmc.TrainApprovalType != 0 &&
          tmc.TrainApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap(can => {
        console.log("是否可以跳过审批", can);
      })
    );
    this.viewModel.travelForm = this.initialBookDto.TravelFrom;
    this.viewModel.illegalReasons = (
      this.initialBookDto.IllegalReasons || []
    ).map(it => {
      return {
        Name: it
      } as IllegalReasonEntity;
    });
    await this.initCombindInfos();
    await this.initSelfBookTypeCredentials();
    await this.initTmcOutNumberInfos();
    this.initOrderTravelPayTypes();
  }
  private async initCombindInfos() {
    try {
      this.viewModel.combindInfos = [];
      const bookInfos = this.trainService.getBookInfos();
      for (let i = 0; i < bookInfos.length; i++) {
        const bookInfo = bookInfos[i];
        const cs = (
          (this.initialBookDto && this.initialBookDto.Staffs) ||
          []
        ).find(it => it.Account.Id == bookInfo.passenger.AccountId);
        const cstaff = cs && cs.CredentialStaff;
        const credentials = [];
        const arr = cstaff && cstaff.Approvers && cstaff.Approvers;
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
          bookInfo.credential &&
          !credentials.find(
            it =>
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
        ).map(insurance => {
          return {
            insuranceResult: insurance,
            checked: true
          };
        });
        const combineInfo: IPassengerBookInfo = {} as any;
        combineInfo.bookInfo = bookInfo;
        combineInfo.vmCredential = bookInfo.credential;
        combineInfo.isSkipApprove = false;
        combineInfo.credentials = credentials || [];
        combineInfo.isOpenrules = false;
        combineInfo.credentialStaff = cstaff;
        combineInfo.isOtherIllegalReason = false;
        combineInfo.isShowFriendlyReminder = false;
        combineInfo.isOtherOrganization = false;
        combineInfo.notifyLanguage = "cn";
        combineInfo.travelType = OrderTravelType.Business; // 默认全部因公
        combineInfo.orderTravelPayType = this.tmc && this.tmc.FlightPayType;
        combineInfo.insuranceProducts = this.isShowInsurances(
          bookInfo.trainInfo &&
            bookInfo.trainInfo.trainEntity &&
            bookInfo.trainInfo.trainEntity.StartTime
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
        combineInfo.appovalStaff = cs && cs.DefaultApprover;
        combineInfo.tmcOutNumberInfos =
          this.tmc &&
          this.tmc.OutNumberNameArray.map(n => {
            return {
              label: n,
              key: n,
              isLoadNumber: !!(this.tmc && this.tmc.GetTravelNumberUrl),
              required:
                this.tmc &&
                this.tmc.OutNumberRequiryNameArray.some(name => name == n),
              value: this.getTravelFormNumber(n),
              staffNumber: cstaff && cstaff.Number,
              staffOutNumber: cstaff && cstaff.OutNumber,
              isTravelNumber: n == "TravelNumber",
              canSelect: n == "TravelNumber",
              isDisabled: !!(this.viewModel.travelForm && n == "TravelNumber")
            } as TmcOutNumberInfo;
          });

        combineInfo.addContacts = [];
        this.viewModel.combindInfos.push(combineInfo);
      }
    } catch (e) {
      console.error(e);
    }
  }
  async bookTrain(isSave?: boolean) {
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    let canBook = false;
    canBook = this.fillBookLinkmans(bookDto);
    canBook = this.fillBookPassengers(bookDto);
    if (canBook) {
      const res = await this.trainService.bookTrain(bookDto).catch(e => {
        AppHelper.alert(e);
        return { TradeNo: "" };
      });
      if (res) {
        if (res.TradeNo) {
          this.trainService.removeAllBookInfos();
          if (
            !isSave &&
            (await this.staffService.isSelfBookType()) &&
            bookDto.Passengers[0].TravelPayType == OrderTravelPayType.Person
          ) {
            const canPay = true || (await this.checkPay(res.TradeNo));
            if (canPay) {
              const cancelPay = await this.tmcService.payOrder(res.TradeNo);
              if (cancelPay) {
                this.router.navigate([""]); // 回到首页
              }
            } else {
              await AppHelper.alert(
                LanguageHelper.Order.getBookTicketWaitingTip()
              );
              this.goToMyOrders(ProductItemType.plane);
            }
          } else {
            await AppHelper.alert(
              LanguageHelper.Flight.getSaveBookOrderOkTip()
            );
            this.router.navigate([""]);
          }
        }
      }
    }
  }
  private async checkPay(tradeNo: string) {
    return new Promise<boolean>(s => {
      let loading = false;
      this.isCheckingPay = true;
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
              this.isCheckingPay = false;
            }
          } else {
            this.isCheckingPay = false;
            s(true);
          }
        }
      }, this.checkPayCountIntervalTime);
    });
  }

  calcTotalPrice() {
    // console.time("总计");
    if (this.viewModel && this.viewModel.combindInfos) {
      let totalPrice = this.viewModel.combindInfos.reduce((arr, item) => {
        if (
          item.bookInfo &&
          item.bookInfo.trainInfo &&
          item.bookInfo.trainInfo.trainPolicy
        ) {
          const info = item.bookInfo.trainInfo;
          const seat = info.trainEntity.Seats.find(
            it =>
              it.SeatType == info.trainPolicy.SeatType &&
              info.trainEntity.TrainNo == info.trainPolicy.TrainNo
          );

          arr = AppHelper.add(arr, +((seat && seat.SalesPrice) || 0));
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
      if (this.initialBookDto && this.initialBookDto.ServiceFees) {
        const fees = Object.keys(this.initialBookDto.ServiceFees).reduce(
          (acc, key) => {
            const fee = +this.initialBookDto.ServiceFees[key];
            acc = AppHelper.add(fee, acc);
            return acc;
          },
          0
        );
        totalPrice = AppHelper.add(fees, totalPrice);
      }
      this.totalPriceSource.next(totalPrice);
    }
    // console.timeEnd("总计");
  }
  private goToMyOrders(tab: ProductItemType) {
    this.router.navigate(["product-tabs"], {
      queryParams: { tabId: tab }
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
    const one = this.viewModel.travelForm.Numbers.find(n => n.Name == name);
    if (one) {
      return one.Code;
    }
    return "";
  }
  private async initOrderTravelPayTypes() {
    this.tmc = this.tmc || (this.tmc = await this.tmcService.getTmc());
    this.identity = await this.identityService
      .getIdentityAsync()
      .catch(_ => ({} as any));
    if (!this.viewModel) {
      return;
    }
    this.viewModel.orderTravelPayTypes = [
      {
        label: LanguageHelper.Flight.getCompanyPayTip(),
        value: OrderTravelPayType.Company
      },
      {
        label: LanguageHelper.Flight.getPersonPayTip(),
        value: OrderTravelPayType.Person
      },
      {
        label: LanguageHelper.Flight.getCreditPayTip(),
        value: OrderTravelPayType.Credit
      },
      {
        label: LanguageHelper.Flight.getBalancePayTip(),
        value: OrderTravelPayType.Balance
      }
    ].filter(t => this.checkOrderTravelPayType(t.value));
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
      this.viewModel.combindInfos = this.viewModel.combindInfos.map(item => {
        if (!item.credential || !item.credential.Number) {
          item.credential = credential;
        }
        return item;
      });
    }
  }

  getServiceFee(item: IPassengerBookInfo) {
    return (
      this.initialBookDto &&
      this.initialBookDto.ServiceFees &&
      this.initialBookDto.ServiceFees[item.id]
    );
  }
  isAllowSelectApprove(info: IPassengerBookInfo) {
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
      info.bookInfo.trainInfo &&
      info.bookInfo.trainInfo.trainPolicy &&
      info.bookInfo.trainInfo.trainPolicy.Rules &&
      info.bookInfo.trainInfo.trainPolicy.Rules.length
    ) {
      return true;
    }
    if (
      (!staff.Approvers || staff.Approvers.length == 0) &&
      Tmc.TrainApprovalType == TmcApprovalType.ExceedPolicyApprover &&
      info &&
      info.bookInfo.trainInfo &&
      info.bookInfo.trainInfo.trainPolicy &&
      info.bookInfo.trainInfo.trainPolicy.Rules &&
      info.bookInfo.trainInfo.trainPolicy.Rules.length
    ) {
      return true;
    }
    return false;
  }
  onOpenrules(item: IPassengerBookInfo) {
    console.log("CombineedSelectedInfo", item);
    item.isOpenrules = !item.isOpenrules;
  }
  private fillBookLinkmans(bookDto: OrderBookDto) {
    bookDto.Linkmans = [];
    const showErrorMsg = (msg: string, item: IPassengerBookInfo) => {
      AppHelper.alert(
        `联系人${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.credential && item.credential.Number)}信息${msg}不能为空`
      );
    };
    for (let i = 0; i < this.viewModel.combindInfos.length; i++) {
      const item = this.viewModel.combindInfos[i];
      if (item.addContacts) {
        for (let j = 0; j < item.addContacts.length; j++) {
          const man = item.addContacts[j];
          const linkMan: OrderLinkmanDto = new OrderLinkmanDto();
          if (!man.accountId) {
            showErrorMsg("", item);
            return false;
          }
          if (!man.email) {
            showErrorMsg("Email", item);
            return false;
          }
          if (
            !(
              man.notifyLanguage == "" ||
              man.notifyLanguage == "cn" ||
              man.notifyLanguage == "en"
            )
          ) {
            showErrorMsg(LanguageHelper.getNotifyLanguageTip(), item);
            return false;
          }
          if (!man.mobile) {
            showErrorMsg("Mobile", item);
            return false;
          }
          if (!man.name) {
            showErrorMsg("Name", item);
            return false;
          }
          linkMan.Id = man.accountId;
          linkMan.Email = man.email;
          linkMan.MessageLang = man.notifyLanguage;
          linkMan.Mobile = man.mobile;
          linkMan.Name = man.name;
          bookDto.Linkmans.push(linkMan);
        }
      }
    }
    return true;
  }
  private fillBookPassengers(bookDto: OrderBookDto) {
    const showErrorMsg = (msg: string, item: IPassengerBookInfo) => {
      AppHelper.alert(
        `${(item.credentialStaff && item.credentialStaff.Name) ||
          (item.credential &&
            item.credential.CheckFirstName +
              item.credential.CheckLastName)} 【${item.credential &&
          item.credential.Number}】 ${msg} 信息不能为空`
      );
    };
    bookDto.Passengers = [];
    for (let i = 0; i < this.viewModel.combindInfos.length; i++) {
      const combindInfo = this.viewModel.combindInfos[i];
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove
      ) {
        showErrorMsg(LanguageHelper.Flight.getApproverTip(), combindInfo);
        return;
      }
      const info = combindInfo.bookInfo && combindInfo.bookInfo.trainInfo;
      if (!info) {
        continue;
      }
      const p = new PassengerDto();
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
        (info.trainPolicy &&
          info.trainPolicy.Rules &&
          info.trainPolicy.Rules.join(",")) ||
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
        !combindInfo.isNotWhitelist &&
        combindInfo.bookInfo &&
        combindInfo.bookInfo.trainInfo &&
        combindInfo.bookInfo.trainInfo.trainPolicy &&
        combindInfo.bookInfo.trainInfo.trainPolicy.Rules &&
        combindInfo.bookInfo.trainInfo.trainPolicy.Rules.length
      ) {
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason) {
          showErrorMsg(
            LanguageHelper.Flight.getIllegalReasonTip(),
            combindInfo
          );
          // if (this.illegalReasonsEles) {
          //   this.moveRequiredEleToViewPort(this.illegalReasonsEles.first);
          // }
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
      if (combindInfo.tmcOutNumberInfos) {
        p.OutNumbers = {};
        combindInfo.tmcOutNumberInfos.forEach(it => {
          if (it.value) {
            p.OutNumbers[it.key] = it.value;
          }
        });
      }
      if (!combindInfo.travelType) {
        showErrorMsg(LanguageHelper.Flight.getTravelTypeTip(), combindInfo);
        return false;
      }
      if (!combindInfo.orderTravelPayType) {
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo
        );
        return false;
      }
      p.Credentials.Account =
        combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
      p.Credentials.Account =
        p.Credentials.Account || combindInfo.credential.Account;
      p.TravelType = combindInfo.travelType;
      p.TravelPayType = combindInfo.orderTravelPayType;
      p.IsSkipApprove = combindInfo.isSkipApprove;
      if (
        combindInfo.bookInfo.trainInfo &&
        combindInfo.bookInfo.trainInfo.trainEntity &&
        combindInfo.bookInfo.trainInfo.trainPolicy
      ) {
        p.Train = combindInfo.bookInfo.trainInfo.trainEntity;
        p.Train.BookSeatType =
          combindInfo.bookInfo.trainInfo.trainPolicy.SeatType;
      }
      bookDto.Passengers.push(p);
    }
    return true;
  }
  async openApproverModal(item: IPassengerBookInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchApprovalComponent
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      const [name, emmail, mobile] = res.Text.split("|");
      item.appovalStaff =
        item.appovalStaff ||
        ({
          Account: new AccountEntity()
        } as any);
      item.appovalStaff.AccountId = item.appovalStaff.Account.Id = res.Value;
      item.appovalStaff.Email = item.appovalStaff.Account.Email = emmail;
      item.appovalStaff.Mobile = item.appovalStaff.Account.Mobile = mobile;
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
    this.viewModel.combindInfos.forEach(item => {
      item.tmcOutNumberInfos.forEach(it => {
        if (true || it.isLoadNumber) {
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
    });
    const result = await this.tmcService.getTravelUrls(args);
    if (result) {
      this.viewModel.combindInfos.forEach(item =>
        item.tmcOutNumberInfos.forEach(info => {
          info.travelUrlInfos = result[info.staffNumber];
          if (
            !info.value &&
            info.travelUrlInfos &&
            info.travelUrlInfos.length
          ) {
            info.value = info.travelUrlInfos[0].TravelNumber;
          }
          info.canSelect = !!(
            info.travelUrlInfos && info.travelUrlInfos.length
          ); // && info.canSelect;
        })
      );
    }
  }
  onIllegalReason(
    reason: {
      isOtherIllegalReason: boolean;
      otherIllegalReason: string;
      illegalReason: string;
    },
    info: IPassengerBookInfo
  ) {
    info.isOtherIllegalReason = reason.isOtherIllegalReason;
    info.illegalReason = reason.illegalReason;
    info.otherIllegalReason = reason.otherIllegalReason;
  }
  checkOrderTravelPayType(payType: OrderTravelPayType) {
    const Tmc = this.viewModel && this.viewModel.tmc;
    if (!Tmc || !Tmc.TrainOrderPayType) {
      return false;
    }
    return (
      !!Tmc.TrainOrderPayType.split(",").find(
        it => it == OrderTravelPayType[payType]
      ) ||
      (payType == OrderTravelPayType.Credit &&
        this.identity &&
        this.identity.Numbers &&
        !!this.identity.Numbers.AgentId)
    );
  }
  async onModify(item: IPassengerBookInfo) {
    if (!item.credentialsRequested) {
      const res: {
        [accountId: string]: CredentialsEntity[];
      } = await this.tmcService
        .getPassengerCredentials([item.bookInfo.passenger.AccountId])
        .catch(_ => ({ [item.bookInfo.passenger.AccountId]: [] }));
      if (item.credentials.length) {
        const exist = item.credentials[0];
        const credentials = res && res[item.bookInfo.passenger.AccountId];
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
    item: IPassengerBookInfo
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
    item: IPassengerBookInfo
  ) {
    if (item && data.organization) {
      item.organization = data.organization;
      item.isOtherOrganization = data.isOtherOrganization;
      item.otherOrganizationName = data.otherOrganizationName;
    }
  }
  onContactsChange(contacts: AddContact[], info: IPassengerBookInfo) {
    if (info && contacts) {
      info.addContacts = contacts;
    }
  }
  onSavecredential(credential: CredentialsEntity, info: IPassengerBookInfo) {
    if (info && credential) {
      info.vmCredential = credential;
    }
  }
  async onSelectTravelNumber(arg: TmcOutNumberInfo, item: IPassengerBookInfo) {
    if (
      !arg.canSelect ||
      !arg.travelUrlInfos ||
      arg.travelUrlInfos.length == 0
    ) {
      return;
    }
    console.log("on select travel number", arg);
    const p = await this.popoverCtrl.create({
      component: SelectTravelNumberComponent,
      componentProps: {
        travelInfos: arg.travelUrlInfos || []
      },
      translucent: true,
      showBackdrop: true
    });
    await p.present();
    const result = await p.onDidDismiss();
    if (result && result.data) {
      const data = result.data as TravelUrlInfo;
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
          arg.value = data.TravelNumber;
        }
      }
    }
  }
  isShowApprove() {}
  private async initBookViewModel() {
    this.viewModel = this.viewModel || ({} as any);
    this.viewModel.tmc = this.initialBookDto.Tmc;
    this.viewModel.identity = await this.identityService.getIdentityAsync();
    this.viewModel.isCanSkipApproval$ = combineLatest([
      from(this.staffService.isSelfBookType()),
      this.identityService.getIdentity()
    ]).pipe(
      map(([isSelfType, identity]) => {
        const tmc = this.viewModel.tmc;
        return (
          tmc &&
          tmc.TrainApprovalType != 0 &&
          tmc.TrainApprovalType != TmcApprovalType.None &&
          !isSelfType &&
          !(identity && identity.Numbers && identity.Numbers.AgentId)
        );
      }),
      tap(can => {
        console.log("是否可以跳过审批", can);
      })
    );
    this.viewModel.travelForm = this.initialBookDto.TravelFrom;
    this.viewModel.illegalReasons = this.initialBookDto.IllegalReasons.map(
      it => {
        const reason = new IllegalReasonEntity();
        reason.Name = it;
        return reason;
      }
    );
  }
}
interface TmcOutNumberInfo {
  key: string;
  label: string;
  required: boolean;
  value: string;
  staffOutNumber: string;
  isTravelNumber: boolean;
  isLoadNumber: boolean;
  staffNumber: string;
  canSelect: boolean;
  isDisabled: boolean;
  travelUrlInfos: TravelUrlInfo[];
}
export interface IBookTrainViewModel {
  tmc: TmcEntity;
  bookDto: OrderBookDto;
  travelForm: TravelFormEntity;
  illegalReasons: IllegalReasonEntity[];
  combindInfos: IPassengerBookInfo[];
  isCanSkipApproval$: Observable<boolean>;
  identity: IdentityEntity;
  orderTravelPayTypes: { label: string; value: OrderTravelPayType }[];
}
export interface IPassengerBookInfo {
  isNotWhitelist?: boolean;
  vmCredential: CredentialsEntity;
  credential: CredentialsEntity;
  credentials: CredentialsEntity[];
  notifyLanguage: string;
  isSkipApprove: boolean;
  id: string;
  appovalStaff: StaffEntity;
  credentialStaff: StaffEntity;
  bookInfo: PassengerBookInfo;
  isOpenrules?: boolean;
  travelType: OrderTravelType;
  orderTravelPayType: OrderTravelPayType;
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
  insuranceProducts: {
    insuranceResult: InsuranceProductEntity;
    checked: boolean;
  }[];
  credentialStaffApprovers: {
    Tag: string;
    Type: TaskType;
    approvers: StaffApprover[];
  }[];
  tmcOutNumberInfos: TmcOutNumberInfo[];
  credentialsRequested?: boolean;
  isOtherIllegalReason?: boolean;
  isShowFriendlyReminder?: boolean;
  illegalReason?: string;
  otherIllegalReason?: string;
}
