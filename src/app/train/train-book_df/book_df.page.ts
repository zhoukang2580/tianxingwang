import { LangService } from "src/app/services/lang.service";
import { RefresherComponent } from "src/app/components/refresher";
import { SearchTrainModel } from "../train.service";
import { IBookOrderResult } from "../../tmc/tmc.service";
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
} from "../../hr/hr.service";
import { IdentityService } from "../../services/identity/identity.service";
import {
  TmcEntity,
  TravelFormEntity,
  IllegalReasonEntity,
  TmcApprovalType,
  TravelUrlInfo,
  TmcService,
} from "src/app/tmc/tmc.service";
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
  Input,
  Output,
  EventEmitter,
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
  IonSelect,
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
import { HrService } from "src/app/hr/hr.service";
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
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { SearchCostcenterComponent } from "src/app/tmc/components/search-costcenter/search-costcenter.component";
import { OrganizationComponent } from "src/app/tmc/components/organization/organization.component";
import { SelectComponent } from "src/app/components/select/select.component";
import { OrderService } from "src/app/order/order.service";
import { Validate12306Component } from "../components/validate12306/validate12306.component";
import { flyInOut } from "../../animations/flyInOut";
import { StorageService } from "src/app/services/storage-service.service";

@Component({
  selector: "app-train-book-df",
  templateUrl: "./book_df.page.html",
  styleUrls: ["./book_df.page.scss"],
  animations: [flyInOut],
})
export class TrainBookDfPage implements OnInit, AfterViewInit, OnDestroy {
  private checkPayCountIntervalId: any;
  private isShowInsuranceBack = false;
  private isManagentCredentails = false;
  private checkPayCount = 5;
  private checkPayCountIntervalTime = 3 * 1000;
  private subscription = Subscription.EMPTY;
  searchTrainModel: SearchTrainModel;
  isSubmitDisabled = false;
  isShowSubmitBtn = false;
  isShow12306BookBtn = true;
  isShowOtherInfo = false;
  // @Input() isOtherCostCenter: boolean;
  // @Input() otherCostCenterCode: string;
  // @Input() otherCostCenterName: string;
  // @Input() costCenter: {
  //   code: string;
  //   name: string;
  // };
  // @Output() ionChange: EventEmitter<any>;
  // @Input() isOtherOrganization: boolean;
  // @Input() organization: OrganizationEntity;
  // @Input() otherOrganizationName: string;
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
  OrderTravelPayType = OrderTravelPayType;
  addContacts: AddContact[] = [];
  isCheckingPay = false;
  isShowFee = false;
  isSelfBookType = true;
  isApproval = true;
  isPlaceOrderOk = true;
  expenseTypes: string[];
  // illegalReasons: any[];
  orderTravelPayTypes: {
    label: string;
    value: OrderTravelPayType;
    checked?: boolean;
  }[];
  CredentialsType = CredentialsType;

  combindInfos: ITrainPassengerBookInfo[];
  isShowCostCenter = true;
  isShowOrganizations = true;
  constructor(
    private trainService: TrainService,
    private storage: StorageService,
    private navCtrl: NavController,
    private identityService: IdentityService,
    private staffService: HrService,
    private modalCtrl: ModalController,
    private tmcService: TmcService,
    private router: Router,
    private calendarService: CalendarService,
    private plt: Platform,
    private langService: LangService,
    private popoverCtrl: PopoverController,
    private orderService: OrderService
  ) {
    this.totalPriceSource = new BehaviorSubject(0);
    // this.ionChange = new EventEmitter();
  }
  back() {
    this.navCtrl.pop();
  }
  async doRefresh(byUser: boolean) {
    this.isShow12306BookBtn = !this.isExchangeBook();
    this.staffService.isSelfBookType().then((is) => {
      this.isSelfBookType = is;
    });
    try {
      this.isShowSubmitBtn = this.isExchangeBook();
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
      this.tmcService.checkIfHasCostCenter().then((has) => {
        this.isShowCostCenter = has;
      });
      this.tmcService.checkIfHasOrganizations().then((has) => {
        this.isShowOrganizations = has;
      });
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
      console.log(this.viewModel.combindInfos, "this.viewModel.combindInfos");
    } catch (e) {
      console.log(e);
      this.error = e;
    }
  }
  private isExchangeBook() {
    const bookInfos = this.trainService
      .getBookInfos()
      .filter((it) => !!it.bookInfo);
    const exchangeInfo = bookInfos.find((it) => !!it.exchangeInfo);
    const exchange = exchangeInfo && exchangeInfo.exchangeInfo;
    const ticket = exchange && exchange.ticket;
    return !!ticket;
  }
  private async getInitializeBookDto() {
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
  expanseCompareFn(t1: string, t2: string) {
    return t1 && t2 ? t1 === t2 : false;
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
          tmc.TrainApprovalType &&
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
  onManagementCredentials(item: ITrainPassengerBookInfo) {
    item.credentialsRequested = false;
    this.isManagentCredentails = true;
    this.router.navigate([AppHelper.getRoutePath("member-credential-list")]);
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

  async onSelectIllegalReason(item: ITrainPassengerBookInfo) {
    if (item.isOtherIllegalReason) {
      return;
    }
    const p = await this.popoverCtrl.create({
      component: SelectComponent,
      cssClass: "vw-70",
      componentProps: {
        label: "超标原因",
        data: ((this.viewModel && this.viewModel.illegalReasons) || []).map(
          (it) => {
            return {
              label: it.Name,
              value: it.Name,
            };
          }
        ),
      },
    });
    p.present();
    const data = await p.onDidDismiss();
    if (data && data.data) {
      item.illegalReason = data.data;
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
        const cstaff =
          bookInfo.passenger.AccountId == this.tmc.Account.Id
            ? bookInfo.credential.Staff
            : cs && cs.CredentialStaff;
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
              !!bookInfo.passenger.Policy.TrainForceInsuranceId &&
              this.tmc.TrainMandatoryBuyInsurance,
            showDetail: false,
          };
        });
        const combineInfo: ITrainPassengerBookInfo = {} as any;
        combineInfo.isShowTravelInfo = true;
        const forceInsurance = insurances.find((it) => it.disabled);
        combineInfo.selectedInsuranceProductId =
          forceInsurance && forceInsurance.insuranceResult.Id;
        if (this.viewModel.expenseTypes && this.viewModel.expenseTypes.length) {
          combineInfo.expenseType = this.viewModel.expenseTypes[0].Name;
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
        combineInfo.insuranceProducts = insurances;
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

  async onChangeCredential(
    credentialSelect: IonSelect,
    item: ITrainPassengerBookInfo
  ) {
    await this.onModify(item);
    if (credentialSelect) {
      credentialSelect.open();
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

  async searchCostCenter(combindInfo: ITrainPassengerBookInfo) {
    const modal = await this.modalCtrl.create({
      component: SearchCostcenterComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    if (result && result.data) {
      const res = result.data as { Text: string; Value: string };
      combindInfo.costCenter = combindInfo.costCenter || ({} as any);
      combindInfo.costCenter.code = res.Value;
      combindInfo.costCenter.name =
        res.Text && res.Text.substring(res.Text.lastIndexOf("-") + 1);
    }
  }

  onOpenSelect(select: IonSelect) {
    if (select) {
      select.open();
    }
  }
  async searchOrganization(combindInfo: ITrainPassengerBookInfo) {
    const modal = await this.modalCtrl.create({
      component: OrganizationComponent,
    });
    modal.backdropDismiss = false;
    await modal.present();
    const result = await modal.onDidDismiss();
    console.log("organization", result.data);
    if (result && result.data) {
      const res = result.data as OrganizationEntity;
      if (!combindInfo.organization) {
        combindInfo.organization = {} as any;
      }
      combindInfo.organization.Code = res.Code;
      combindInfo.organization.Name = res.Name;
    }
  }
  private async showBindTip() {
    const tip1 = `12306官方规定已通过核验的常用乘客在添加后30天内不可删除；每个账号最多添加15个(含本人)常用乘客！`;
    const exchangeInfo = this.trainService
      .getBookInfos()
      .find((it) => !!it.exchangeInfo);
    const isExchangeBook =
      exchangeInfo &&
      exchangeInfo.exchangeInfo &&
      !!exchangeInfo.exchangeInfo.ticket;
    if (!this.isSelfBookType) {
      if (!isExchangeBook) {
        await AppHelper.alert(tip1, true);
      }
    }
  }
  async bookTrainBy12306(
    event: CustomEvent,
    isNamePasswordValidateFail = false
  ) {
    this.bookTrain(false, event, true, isNamePasswordValidateFail);
  }
  private async checkAndBind12306(isNamePasswordValidateFail: boolean) {
    await this.showBindTip();
    if (this.initialBookDto && this.initialBookDto.AccountNumber12306) {
      if (this.initialBookDto.AccountNumber12306.IsIdentity) {
        return true;
      }
    }
    return this.validate12306(isNamePasswordValidateFail);
  }
  async onValidate12306() {
    try {
      await this.showBindTip();
      const ok = await this.validate12306(false);
      if (ok) {
        this.initialBookDto.AccountNumber12306 =
          await this.trainService.getBindAccountNumber();
      }
    } catch (e) {
      console.error(e);
      AppHelper.alert(e);
    }
  }
  private async reloadAccount12306Number() {
    if (this.initialBookDto) {
      const accountNumber12306 = await this.trainService.getBindAccountNumber();
      // 除了普通角色，其他角色后台可能不进行验证，所以，后台加载不到这个验证的账号信息
      if (accountNumber12306 && accountNumber12306.Name) {
        this.initialBookDto.AccountNumber12306 = accountNumber12306;
      }
      if (this.isSelfBookType) {
        // 如果在验证界面退出了验证状态
        if (!accountNumber12306 || !accountNumber12306.Name) {
          this.initialBookDto.AccountNumber12306 = accountNumber12306;
        }
      }
    }
  }
  private async validate12306(isNamePasswordValidateFail: boolean) {
    try {
      if (this.initialBookDto && !this.initialBookDto.AccountNumber12306) {
        this.initialBookDto.AccountNumber12306 =
          await this.trainService.getBindAccountNumber();
      }
      const an = this.initialBookDto.AccountNumber12306;
      const m = await AppHelper.modalController.create({
        component: Validate12306Component,
        componentProps: {
          name: an && an.Name,
          password: an && an.Number,
          isNamePasswordValidateFail,
        },
      });
      m.present();
      const res = await m.onDidDismiss();
      this.reloadAccount12306Number();
      if (res && res.data) {
        if (this.initialBookDto) {
          // 以传入的为准
          this.initialBookDto.AccountNumber12306 = {
            Name: res.data.Name,
            Number: res.data.Number,
          };
        }
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  }
  async bookTrain(
    isSave: boolean = false,
    event: CustomEvent,
    is12306Book: boolean = true,
    isNamePasswordValidateFail = false
  ) {
    const exchangeInfo = this.trainService
      .getBookInfos()
      .find((it) => !!it.exchangeInfo);
    const isExchangeBook =
      exchangeInfo &&
      exchangeInfo.exchangeInfo &&
      !!exchangeInfo.exchangeInfo.ticket;
    const tip2 = `您尚未验证12306账户,可能导致无法线上退改签,则需登陆乘车人12306账户或至火车站退改签`;
    const tip3 = `您当前不是12306官方预订,可能导致无法线上退改签,则需登陆乘车人12306账户或至火车站退改签`;
    this.isShowFee = false;
    const bookDto: OrderBookDto = new OrderBookDto();
    bookDto.IsFromOffline = isSave;
    event.stopPropagation();
    if (this.isSubmitDisabled) {
      return;
    }
    let isCancel = false;
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
    if (canBook && canBook2) {
      let isOfficialBooked = false;
      if (this.initialBookDto && !this.initialBookDto.AccountNumber12306) {
        this.initialBookDto.AccountNumber12306 =
          await this.trainService.getBindAccountNumber();
      }
      if (
        !is12306Book &&
        !this.isExchangeBook() &&
        this.initialBookDto &&
        (!this.initialBookDto.AccountNumber12306 ||
          !this.initialBookDto.AccountNumber12306.IsIdentity)
      ) {
        if (!isExchangeBook) {
          isCancel = await AppHelper.alert(tip2, true, "取消", "验证12306");
          if (isCancel) {
            return;
          }
          isOfficialBooked = !isCancel;
          if (isOfficialBooked) {
            this.bookTrainBy12306(event);
            return;
          }
        }
      }
      if (is12306Book && !this.isExchangeBook()) {
        isOfficialBooked = await this.checkAndBind12306(
          isNamePasswordValidateFail
        );
        if (!isOfficialBooked) {
          if (!isExchangeBook) {
            isCancel = await AppHelper.alert(
              tip2,
              true,
              "取消",
              "重新验证12306"
            );
            if (isCancel) {
              return;
            }
            isOfficialBooked = !isCancel;
            if (isOfficialBooked) {
              this.bookTrainBy12306(event);
              return;
            }
          }
        }
        if (this.initialBookDto && this.initialBookDto.AccountNumber12306) {
          this.initialBookDto.AccountNumber12306.IsIdentity = isOfficialBooked;
        }
      }
      bookDto.IsOfficialBooked = isOfficialBooked;
      if (!bookDto.IsOfficialBooked) {
        if (!is12306Book) {
          if (!isExchangeBook) {
            if (!isCancel) {
              isCancel = await AppHelper.alert(tip3, true, "取消", "12306预订");
              if (isCancel) {
                return;
              }
              if (!isCancel) {
                this.bookTrainBy12306(event);
                return;
              }
            }
          }
        }
      }
      if (bookDto.IsOfficialBooked) {
        if (this.initialBookDto && this.initialBookDto.AccountNumber12306) {
          bookDto.AccountNumber = this.initialBookDto.AccountNumber12306;
        }
      }
      this.isSubmitDisabled = true;
      let res: IBookOrderResult;
      if (exchangeInfo && exchangeInfo.exchangeInfo) {
        res = await this.trainService.exchangeBook(bookDto).catch((e) => {
          this.isSubmitDisabled = false;
          AppHelper.alert(e);
          return null;
        });
      } else {
        await this.trainService
          .bookTrain(bookDto)
          .then((r) => {
            if (r.Status) {
              res = r.Data;
            } else {
              this.isSubmitDisabled = false;
              if (r.Code == "MessageCodeValidate") {
                AppHelper.alert(r.Message).then((ok) => {
                  if (
                    this.initialBookDto &&
                    this.initialBookDto.AccountNumber12306
                  ) {
                    this.initialBookDto.AccountNumber12306.IsIdentity = false;
                  }
                  this.bookTrainBy12306(event, true);
                });
                return;
              }
              if (r.Code == "TrainCheckPassenger") {
                const msg: string = r.Message;
                const ok = this.checkTrainCheckPassenger(msg);
                if (ok) {
                  return;
                }
              }
              AppHelper.alert(r.Message);
            }
          })
          .catch((e) => {
            console.error(e);
            this.isSubmitDisabled = false;
            const msg: string = e;
            const ok = this.checkTrainCheckPassenger(msg);
            res = null;
            if (ok) {
              return;
            }
            return null;
          });
      }
      if (res) {
        if (res.TradeNo && res.TradeNo != "0") {
          this.isPlaceOrderOk = true;
          let isHasTask = res.HasTasks;
          let payResult = false;
          this.trainService.removeAllBookInfos();
          let checkPayResult = false;
          const isCheckPay = res.IsCheckPay;
          const isSelf = await this.staffService.isSelfBookType();
          if (!isSave) {
            if (isCheckPay) {
              this.isCheckingPay = true;
              checkPayResult = await this.checkPay(res.TradeNo);
              this.isCheckingPay = false;
            } else {
              payResult = !(
                this.viewModel.orderTravelPayType ==
                  OrderTravelPayType.Person ||
                this.viewModel.orderTravelPayType == OrderTravelPayType.Credit
              );
            }
            if (checkPayResult) {
              if (isSelf && isHasTask) {
                await AppHelper.alert(
                  LanguageHelper.Order.getBookTicketWaitingApprovToPayTip(),
                  true
                );
              } else {
                // if (isCheckPay) {
                //   payResult = await this.tmcService.payOrder(res.TradeNo);
                // }
                if (isCheckPay) {
                  const isp =
                    this.viewModel.orderTravelPayType ==
                      OrderTravelPayType.Person ||
                    this.viewModel.orderTravelPayType ==
                      OrderTravelPayType.Credit;
                  payResult = await this.orderService.payOrder(
                    res.TradeNo,
                    null,
                    false,
                    isp ? this.tmcService.getQuickexpressPayWay() : []
                  );
                }
              }
            } else {
              if (isSelf && isCheckPay) {
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
          this.goToMyOrders({
            isHasTask: isHasTask,
            payResult,
            isCheckPay:
              isCheckPay ||
              this.viewModel.orderTravelPayType == OrderTravelPayType.Person ||
              this.viewModel.orderTravelPayType == OrderTravelPayType.Credit,
          });
        }
      }
    }
  }
  private checkTrainCheckPassenger(msg: string) {
    if (msg && /\d{11}-/.test(msg)) {
      let vcode = "";
      const tips = msg
        .split("/")
        .filter((it) => !!it)
        .map((it) => {
          const [phone, code] = it.split("-");
          vcode = code;
          return `使用手机号${phone},发送验证码${code}到12306进行手机身份验证(验证码30分钟内有效)`;
        })
        .join("\r\n");
      if (AppHelper.isApp()) {
        AppHelper.alert(tips, true, "用本机号码发送", "取消").then((ok) => {
          if (ok) {
            this.onSendSms(vcode);
          }
        });
      } else {
        AppHelper.alert(tips);
      }
      return true;
    }
    return false;
  }
  private onSendSms(vcode: string) {
    const a = document.createElement("a");
    a.href = `sms:12306${
      AppHelper.platform.is("ios") ? "&" : "?"
    }body=${vcode}`;
    a.click();
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
    if (!this.tmcService.isAgent) {
      if (this.tmc && !this.tmc.IsShowServiceFee) {
        if (
          this.viewModel &&
          this.viewModel.orderTravelPayType != OrderTravelPayType.Person &&
          this.viewModel.orderTravelPayType != OrderTravelPayType.Credit
        ) {
          fees = 0;
        }
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
      let totalPrice = 0;
      for (const item of this.viewModel.combindInfos) {
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
          totalPrice = AppHelper.add(
            totalPrice,
            +((seat && seat.SalesPrice) || 0)
          );
        }
        if (!exchange) {
          if (item.insuranceProducts) {
            const psum = item.insuranceProducts.find(
              (it) => it.insuranceResult.Id == item.selectedInsuranceProductId
            );
            if (psum) {
              totalPrice = +AppHelper.add(
                +totalPrice,
                +psum.insuranceResult.Price
              );
            }
          }
        }
      }
      // console.log("totalPrice ", totalPrice);
      let fees = this.getTotalServiceFees();
      if (fees && exchange) {
        fees = +(this.tmc && this.tmc.TrainExchangeOnlineFee) || 0;
      }
      totalPrice = +AppHelper.add(fees, totalPrice);
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
  private async goToMyOrders(data: {
    isHasTask: boolean;
    payResult: boolean;
    isCheckPay: boolean;
  }) {
    // this.router.navigate(["order-list"], {
    //   // isbackhome:true，是防止 android 通过物理返回键返回当前页面
    //   queryParams: { tabId: tab, fromRoute: "bookflight", isBackHome: true },
    // });
    try {
      const m = this.trainService.getSearchTrainModel();
      // const cities = await this.flightService.getStationsAsync();
      // const city = m.toCity;
      const toCity = this.trainService.getSearchTrainModel().toCity;
      if (toCity && !toCity.CityCode) {
        const cities = await this.trainService.getStationsAsync();
        const c = cities.find((it) => it.Code == toCity.Code);
        if (c) {
          toCity.CityCode = c.CityCode;
        }
      }
      // const c = cities.find(it => it.Code == (city && city.Code));
      this.router.navigate(["checkout-success"], {
        queryParams: {
          tabId: ProductItemType.train,
          cityCode: toCity && toCity.CityCode,
          cityName: toCity && toCity.CityName,
          isApproval: data.isHasTask,
          payResult: data.payResult,
          isCheckPay: data.isCheckPay,
          date: m.Date,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
  // private isShowInsurances(takeoffTime: string) {
  //   if (takeoffTime) {
  //     return +moment(takeoffTime) > +moment(moment().add(2, "hours"));
  //   }
  //   return true;
  // }
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
        this.viewModel.orderTravelPayType =
          +exchangeInfo.ticket.Order.VariablesJsonObj["TravelPayType"];
        this.orderTravelPayTypes = this.orderTravelPayTypes.map((it) => {
          it.checked =
            +it.value ==
            +exchangeInfo.ticket.Order.VariablesJsonObj["TravelPayType"];
          return it;
        });
      }
    }
    this.viewModel.orderTravelPayType = this.getDefaultPayType(
      this.tmc && this.tmc.TrainPayType
    );
  }
  private getDefaultPayType(tmcPayType: number) {
    const one = (this.orderTravelPayTypes || []).find(
      (it) => it.value == tmcPayType
    );
    const key = Object.keys(OrderTravelPayType).find(
      (k) => OrderTravelPayType[k] == (one && one.value)
    );
    const orderTravelPayType = key && OrderTravelPayType[key];

    console.log(
      "initOrderTravelPayTypes",
      this.orderTravelPayTypes,
      orderTravelPayType
    );
    if (orderTravelPayType) {
      one.checked = true;
    }
    return orderTravelPayType;
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
    const time = day.date.substring(5).replace("-", "月");
    return `${time}日  ${day.dayOfWeekName}`;
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
    if (info.bookInfo && info.bookInfo.exchangeInfo) {
      // 改签不需要添加审批人
      return false;
    }
    if (
      !Tmc ||
      Tmc.TrainApprovalType == TmcApprovalType.None ||
      !Tmc.TrainApprovalType
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
    const showErrorMsg = async (
      msg: string,
      item: ITrainPassengerBookInfo,
      ele: HTMLElement
    ) => {
      // console.log(this.viewModel.illegalReasons?.length);
      await AppHelper.alert(
        this.langService.isCn
          ? `${
              (item.credentialStaff && item.credentialStaff.Name) ||
              (item.bookInfo.credential &&
                item.bookInfo.credential.Surname +
                  item.bookInfo.credential.Givenname)
            } 【${
              item.bookInfo.credential && item.bookInfo.credential.HideNumber
            }】 ${msg} 信息不能为空`
          : `${
              (item.credentialStaff && item.credentialStaff.Name) ||
              (item.bookInfo.credential &&
                item.bookInfo.credential.Surname +
                  item.bookInfo.credential.Givenname)
            } 【${
              item.bookInfo.credential && item.bookInfo.credential.HideNumber
            }】 ${msg} ${
              this.langService.isEn
                ? "Information cannot be empty"
                : "信息不能为空"
            }`
      );
      this.moveRequiredEleToViewPort(ele);
    };
    bookDto.Passengers = [];
    for (const combindInfo of this.viewModel.combindInfos) {
      if (
        this.isAllowSelectApprove(combindInfo) &&
        !combindInfo.appovalStaff &&
        !combindInfo.isSkipApprove &&
        combindInfo.isShowGroupedInfo
      ) {
        const ele: HTMLElement = this.getEleByAttr(
          "approverid",
          combindInfo.id
        );
        if (!combindInfo.isShowTravelInfo) {
          combindInfo.isShowTravelInfo = true;
        }
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
          if (it.insuranceResult.Id == combindInfo.selectedInsuranceProductId) {
            p.InsuranceProducts.push(it.insuranceResult);
          }
        }
      }

      p.ExpenseType = combindInfo.expenseType;
      p.IllegalReason =
        combindInfo.otherIllegalReason || combindInfo.illegalReason || "";
      if (
        !combindInfo.isNotWhitelist &&
        combindInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo &&
        combindInfo.bookInfo.bookInfo.trainPolicy &&
        combindInfo.bookInfo.bookInfo.trainPolicy.Rules &&
        combindInfo.bookInfo.bookInfo.trainPolicy.Rules.length
      ) {
        // 只有白名单的才需要考虑差标
        if (!p.IllegalReason && this.tmc.IsNeedIllegalReason) {
          // 只有白名单的才需要考虑差标
          const ele: HTMLElement = this.getEleByAttr(
            "illegalReasonsid",
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
        // if (!p.IllegalReason) {
        //   this.showErrorMsg(
        //     LanguageHelper.Flight.getIllegalReasonTip(),
        //     combindInfo,
        //     this.getEleByAttr("illegalReasonsid", combindInfo.id)
        //   );
        //   return false;
        // }
      }
      if (!p.Mobile) {
        this.isShowOtherInfo = true;
        // this.isShowTravelInfo = true;
        const ele: HTMLElement = this.getEleByAttr("mobileid", combindInfo.id);
        setTimeout(() => {
          showErrorMsg(LanguageHelper.Flight.getMobileTip(), combindInfo, ele);
        }, 1000);
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
      if (this.viewModel && !this.viewModel.orderTravelPayType) {
        const el = this.getEleByAttr(
          "orderTravelPayTypeid",
          "orderTravelPayTypeid"
        );
        if (!this.orderTravelPayTypes || !this.orderTravelPayTypes.length) {
          const tip = this.langService.isEn
            ? "Payment method is not set, please contact customer service."
            : "没有可选择的支付方式或支付方式已经被关闭，请联系客服。";
          AppHelper.alert(tip);
          this.moveRequiredEleToViewPort(el);
          return false;
        }
        showErrorMsg(
          LanguageHelper.Flight.getrOderTravelPayTypeTip(),
          combindInfo,
          el as any
        );
        return false;
      }
      if (
        combindInfo.credentialStaff &&
        combindInfo.credentialStaff.Account &&
        combindInfo.credentialStaff.Account.Id &&
        combindInfo.credentialStaff.Account.Id != "0"
      ) {
        p.Credentials.Account =
          combindInfo.credentialStaff && combindInfo.credentialStaff.Account;
        p.Credentials.Account =
          p.Credentials.Account || combindInfo.credential.Account;
      }
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
      if (p.InsuranceProducts.length) {
        if (!p.Train) {
          p.Train = {} as any;
        }
        p.Train.InsuranceProducts = p.InsuranceProducts;
        p.InsuranceProducts = [];
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
            group[key][idx].showGroupedServiceFee = showTotalFees;
            if (group[key].length) {
              group[key].forEach((it) => {
                it.serviceFee = this.getOneServiceFee(it);
              });
            }
          }
        }
        this.viewModel.combindInfos = this.viewModel.combindInfos.concat(
          group[key]
        );
      });
      const whitelist = this.viewModel.combindInfos
        .filter((it) => !it.bookInfo.isNotWhitelist)
        .map((it) => {
          // 白名单全部显示
          it.isShowGroupedInfo = true;
          return it;
        });
      const notWhiteList = this.viewModel.combindInfos.filter(
        (it) => it.bookInfo.isNotWhitelist
      );
      notWhiteList.forEach((it, idx) => {
        // 非白名单只在最后一个显示出差信息中的通知语言，跳过审批和审批人
        it.isShowGroupedInfo = idx == notWhiteList.length - 1;
      });
      this.viewModel.combindInfos = whitelist.concat(notWhiteList);
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
    const result = await this.tmcService.getTravelUrls(args, "Train");
    if (result) {
      this.viewModel.combindInfos.forEach((item) =>
        item.tmcOutNumberInfos.forEach((info) => {
          if (info.label.toLowerCase() == "staffnumber") {
            info.value = info.staffNumber;
          }
          if (info.label.toLowerCase() == "travelnumber") {
            info.loadTravelUrlErrorMsg =
              result[info.staffNumber] && result[info.staffNumber].Message;
            info.travelUrlInfos =
              result[info.staffNumber] && result[info.staffNumber].Data;
            // if (
            //   !info.value &&
            //   info.travelUrlInfos &&
            //   info.travelUrlInfos.length
            // ) {
            //   info.value = info.travelUrlInfos[0].TravelNumber;
            // }
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
      item.credentials = item.credentials.filter(
        (it) =>
          it.Type != CredentialsType.HmPass &&
          it.Type != CredentialsType.TwPass &&
          it.Type != CredentialsType.TaiwanEp
      );
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
  credentialCompareFn(t1: CredentialsEntity, t2: CredentialsEntity) {
    return (
      (t1 && t2 && t1 == t2) || (t1.Type == t2.Type && t1.Number == t2.Number)
    );
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
      !Tmc.FlightApprovalType
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
  expenseTypes: { Name: string; Tag: string }[];
  combindInfos: ITrainPassengerBookInfo[];
  isCanSkipApproval$: Observable<boolean>;
  identity: IdentityEntity;
}
interface ITrainPassengerBookInfo {
  isShowGroupedInfo?: boolean;
  isShowTravelInfo: boolean;
  showGroupedServiceFee: number;
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
  // selectedInsuranceProduct: InsuranceProductEntity;
  selectedInsuranceProductId: string;
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
