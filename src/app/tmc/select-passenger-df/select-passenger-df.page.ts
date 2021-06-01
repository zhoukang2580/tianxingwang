import { flyInOut } from "./../../animations/flyInOut";
import { InternationalHotelService } from "../../international-hotel/international-hotel.service";
import { HotelService } from "./../../hotel/hotel.service";
import { SelectCountryModalComponent } from "../components/select-country/select-countrymodal.component";
import { TrainService } from "./../../train/train.service";
import { FlightHotelTrainType, PassengerBookInfo } from "./../tmc.service";
import { CredentialsEntity } from "../models/CredentialsEntity";
import { TmcService } from "../tmc.service";
import { MemberService, MemberCredential } from "../../member/member.service";
import { CanComponentDeactivate } from "../../guards/candeactivate.guard";
import {
  HrService,
  StaffBookType,
  PolicyEntity,
} from "../../hr/hr.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "../../services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FlightService } from "src/app/flight/flight.service";
import { SelectedPassengersComponent } from "../components/selected-passengers/selected-passengers.component";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ViewChildren,
  QueryList,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import {
  IonInfiniteScroll,
  IonRefresher,
  NavController,
  ModalController,
  IonGrid,
  DomController,
  Platform,
  IonContent,
} from "@ionic/angular";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { StaffEntity } from "src/app/hr/hr.service";
import { Observable, Subscription, fromEvent } from "rxjs";
import { tap, finalize } from "rxjs/operators";
import { LanguageHelper } from "src/app/languageHelper";
import {
  CredentialPipe,
  CredentialsType,
} from "src/app/member/pipe/credential.pipe";
import { AppHelper } from "src/app/appHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { AccountEntity } from "src/app/account/models/AccountEntity";
import { CountryEntity } from "../models/CountryEntity";
import { InternationalFlightService } from "src/app/international-flight/international-flight.service";
import { RefresherComponent } from "src/app/components/refresher";
import { CredentialsComponent } from "src/app/member/components/credentials/credentials.component";
export const NOT_WHITE_LIST = "notwhitelist";
@Component({
  selector: "app-select-passenger-df",
  templateUrl: "./select-passenger-df.page.html",
  styleUrls: ["./select-passenger-df.page.scss"],
  animations: [flyInOut],
})
export class SelectPassengerDfPage
  implements OnInit, CanComponentDeactivate, AfterViewInit, OnDestroy {
  private keyword: string;
  private isOpenPageAsModal = false; // 设置是否通过modalcontroller打开
  private bookInfos: PassengerBookInfo<any>[];
  private removeitemSubscription = Subscription.EMPTY;
  private idInputEleSubscription = Subscription.EMPTY;
  private subscription = Subscription.EMPTY;
  @ViewChild(CredentialsComponent) credentialsComp: CredentialsComponent;
  @ViewChild(IonContent, { static: true }) content: IonContent;
  @ViewChild(RefresherComponent, { static: true })
  refresher: RefresherComponent;
  @ViewChild(IonInfiniteScroll, { static: true }) scroller: IonInfiniteScroll;
  @ViewChildren("addForm") addForm: QueryList<IonGrid>;
  forType: FlightHotelTrainType; // isOpenPageAsModal 传入参数
  FlightHotelTrainType = FlightHotelTrainType;
  removeitem: EventEmitter<PassengerBookInfo<any>>; // isOpenPageAsModal 传入参数
  isShow = true;
  vmKeyword: string;
  isShowNewCredential = false;
  credentialsRemarks: { key: string; value: string }[];
  selectedCredentialId: string;
  pageIndex = 1;
  pageSize = 15;
  vmStaffs: StaffEntity[];
  selectedPassenger: StaffEntity;
  subscriptions: Subscription[] = [];
  vmNewCredential: MemberCredential;
  loading = false;
  isCanDeactive = true;
  staffCredentails: MemberCredential[] = [];
  frqPassengerCredentials: MemberCredential[];
  identityTypes: { key: string; value: string }[];
  passengerTypes: {
    key: string;
    value: string;
  }[];
  bookInfos$: Observable<PassengerBookInfo<any>[]>;
  requestCode: "issueNationality" | "identityNationality";
  title = "选择旅客";
  selectedPassengerPolicy: PolicyEntity;
  filteredCredentialsTypes: CredentialsType[];
  constructor(
    public modalController: ModalController,
    private navCtrl: NavController,
    private apiService: ApiService,
    private identityService: IdentityService,
    private staffService: HrService,
    private validatorService: ValidatorService,
    private domCtrl: DomController,
    private tmcService: TmcService,
    private flightService: FlightService,
    private trainService: TrainService,
    private hotelService: HotelService,
    private interHotelService: InternationalHotelService,
    private interFlightService: InternationalFlightService,
    private route: ActivatedRoute,
    private plt: Platform
  ) {
    this.removeitem = new EventEmitter();
  }
  getIdentityTypes() {
    this.identityTypes = Object.keys(CredentialsType)
      .filter((k) => +k)
      .map((k) => {
        return {
          key: k,
          value: CredentialsType[k],
        };
      });
    console.log(this.identityTypes);
  }
  compareFn(t1, t2) {
    return t1 == t2;
  }
  ngAfterViewInit() {
    this.subscriptions.push(
      this.addForm.changes.subscribe((_) => {
        if (this.addForm.last) {
          this.initializeValidateAdd(this.addForm.last["el"]);
        }
      })
    );
  }
  ngOnDestroy() {
    this.removeitemSubscription.unsubscribe();
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.idInputEleSubscription.unsubscribe();
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe((q) => {
        if (q.get("forType")) {
          this.forType = (q.get("forType") as any) as FlightHotelTrainType;
        }
        this.getIdentityTypes();
        this.initPassengerTypes();
        this.initCredentialsRemarks();
        this.initRemoveitem();
        this.initBookInfos();
        this.initFilteredCredentialsTypes();
        this.isCanDeactive = false;
      })
    );
    this.doRefresh(null);
  }
  private initFilteredCredentialsTypes() {
    this.filteredCredentialsTypes = [];
    if (
      this.forType == FlightHotelTrainType.InternationalFlight ||
      this.forType == FlightHotelTrainType.HotelInternational
    ) {
      this.filteredCredentialsTypes = [CredentialsType.IdCard];
    }
  }
  private initRemoveitem() {
    this.removeitemSubscription = this.removeitem.subscribe(async (info) => {
      let ok = false;
      if (!this.isOpenPageAsModal) {
        ok = await AppHelper.alert(
          LanguageHelper.getConfirmDeleteTip(),
          true,
          LanguageHelper.getConfirmTip(),
          LanguageHelper.getCancelTip()
        );
      }
      if (info && ok) {
        switch (+this.forType) {
          case +FlightHotelTrainType.Flight: {
            if (!this.isOpenPageAsModal) {
              this.flightService.removePassengerBookInfo(info, true);
            }
            break;
          }
          case +FlightHotelTrainType.Train: {
            if (!this.isOpenPageAsModal) {
              this.trainService.removeBookInfo(info, true);
            }
            break;
          }
          case +FlightHotelTrainType.Hotel: {
            if (!this.isOpenPageAsModal) {
              this.hotelService.removeBookInfo(info, true);
            }
            break;
          }
          case +FlightHotelTrainType.HotelInternational: {
            if (!this.isOpenPageAsModal) {
              this.interHotelService.removeBookInfo(info, true);
            }
            break;
          }
          case +FlightHotelTrainType.InternationalFlight: {
            if (!this.isOpenPageAsModal) {
              this.interFlightService.removeBookInfo(info, true);
            }
            break;
          }
        }
      }
    });
  }
  private initBookInfos() {
    if (this.forType == FlightHotelTrainType.Flight) {
      this.bookInfos$ = this.flightService.getPassengerBookInfoSource();
    }
    if (this.forType == FlightHotelTrainType.Train) {
      this.bookInfos$ = this.trainService.getBookInfoSource();
    }
    if (this.forType == FlightHotelTrainType.Hotel) {
      this.bookInfos$ = this.hotelService.getBookInfoSource();
    }
    if (this.forType == FlightHotelTrainType.HotelInternational) {
      this.bookInfos$ = this.interHotelService.getBookInfoSource();
    }
    if (this.forType == FlightHotelTrainType.InternationalFlight) {
      this.bookInfos$ = this.interFlightService.getBookInfoSource().pipe(
        tap((it) => {
          if (it && it.length) {
            const p = it.filter((o) => o.passenger && !!o.passenger.Policy)[0];
            if (p) {
              this.selectedPassengerPolicy = p.passenger.Policy;
            }
          } else {
            this.selectedPassengerPolicy = null;
          }
        })
      );
    }
    if (this.bookInfos$) {
      this.bookInfos$ = this.bookInfos$.pipe(
        tap((infos) => {
          this.bookInfos = infos;
        })
      );
    }
  }
  private initCredentialsRemarks() {
    this.credentialsRemarks = [
      {
        key: "客户",
        value: LanguageHelper.Flight.getPassengerTypeCustomerTip(),
      },
      {
        key: "供应商",
        value: LanguageHelper.Flight.getPassengerTypeSupplierTip(),
      },
      {
        key: "员工",
        value: LanguageHelper.Flight.getPassengerTypeEmployeeTip(),
      },
      {
        key: "其它乘客类别",
        value: LanguageHelper.Flight.getPassengerTypeOtherTip(),
      },
    ];
  }
  private initPassengerTypes() {
    this.passengerTypes = [
      {
        key: "1",
        value: LanguageHelper.Flight.getPassengerTypeCustomerTip(),
      },
      {
        key: "2",
        value: LanguageHelper.Flight.getPassengerTypeSupplierTip(),
      },
      {
        key: "3",
        value: LanguageHelper.Flight.getPassengerTypeEmployeeTip(),
      },
      {
        key: "4",
        value: LanguageHelper.Flight.getPassengerTypeOtherTip(),
      },
    ];
  }
  async canAddNotWhiteListCredential() {
    // 代理和特殊可以新增证件
    if (
      (await this.staffService.isSecretaryBookType()) ||
      (await this.staffService.isSelfBookType())
    ) {
      return false;
    }
    const identity = await this.identityService.getIdentityAsync();
    const staff = await this.staffService.getStaff();
    const can =
      !!(identity && identity.Numbers && identity.Numbers.AgentId) ||
      (await this.staffService.isAllBookType());
    console.log("can add not whitelist ", can);
    return can;
  }
  async onShow() {
    const m = await this.modalController.create({
      component: SelectedPassengersComponent,
      componentProps: {
        bookInfos$: this.bookInfos$,
        removeitem: this.removeitem,
      },
    });
    await m.present();
    await m.onDidDismiss();
  }
  doRefresh(keyword) {
    this.pageIndex = 0;
    this.vmStaffs = [];
    this.keyword = keyword || "";
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.selectedPassenger = null;
    this.isShowNewCredential = false; // 页面上显示新增此人其他证件,或者是非白名单的证件
    this.vmNewCredential = null;
    this.selectedCredentialId = null; // 所选择的证件Id
    this.subscription.unsubscribe();
    this.loadMore();
  }
  onSearch(event: any) {
    this.staffCredentails = [];
    this.doRefresh((this.vmKeyword || "").trim());
  }
  loadMore() {
    this.loading = this.pageIndex == 0;
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Staff-List";
    req.Data = {
      Name: this.keyword.trim(),
      PageSize: 20,
      PageIndex: this.pageIndex,
    };
    this.subscription = this.apiService
      .getResponse<StaffEntity[]>(req)
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.loading = false;
            if (this.refresher && this.pageIndex <= 1) {
              this.refresher.complete();
              this.content.scrollToTop();
            }
          }, 200);
        })
      )
      .subscribe(
        async (r) => {
          const staffs = (r && r.Data) || [];
          if (staffs.length) {
            this.pageIndex++;
          }
          if (this.scroller) {
            this.scroller.disabled = staffs.length < 20;
          }
          // 代理或者特殊，显示可以选择非白名单
          if (this.pageIndex <= 1) {
            if (await this.canAddNotWhiteListCredential()) {
              const passenger = new StaffEntity();
              passenger.isNotWhiteList = true;
              const tmc = await this.tmcService
                .getTmc(false)
                .catch((_) => null);
              passenger.Account = new AccountEntity();
              passenger.Account.Id = tmc && tmc.Account.Id; // 所选的tmcId
              passenger.AccountId = passenger.Account.Id;
              passenger.CredentialsInfo = LanguageHelper.Flight.getNotWhitelistingTip(); // 非白名单
              staffs.unshift(passenger);
            }
          }
          if (staffs.length) {
            this.vmStaffs = this.vmStaffs || [];
            this.vmStaffs = this.vmStaffs.concat(staffs);
          }
        },
        () => {}
      );
  }
  private checkSamePolicy(s: StaffEntity) {
    const one = this.interFlightService.getBookInfos()[0];
    if (one) {
      if (
        (one.isNotWhitelist && !s.isNotWhiteList) ||
        (s.isNotWhiteList && !one.isNotWhitelist) ||
        (one.passenger.Policy &&
          one.passenger.Policy.Id != (s.Policy && s.Policy.Id))
      ) {
        return false;
      }
    }
    return true;
  }
  async onSelect(s: StaffEntity) {
    if (this.forType == FlightHotelTrainType.InternationalFlight) {
      const one = this.interFlightService.getBookInfos()[0];
      if (!this.checkSamePolicy(s)) {
        if (
          one.passenger.Policy &&
          one.passenger.Policy.Id != (s.Policy && s.Policy.Id)
        ) {
          AppHelper.toast(
            "不能选择此旅客，其差标与已选旅客差标不一致",
            1400,
            "middle"
          );
          return;
        }
      }
    }
    console.log("onSelect", s);
    this.selectedPassenger = {
      ...s,
      isNotWhiteList: s.isNotWhiteList || !s.Policy,
    };
    this.isShowNewCredential = false; // 页面上显示新增此人其他证件,或者是非白名单的证件
    this.vmNewCredential = null;
    this.selectedCredentialId = null; // 所选择的证件Id
    this.frqPassengerCredentials = null; // 是否显示常旅客
    // 白名单
    let staffCredentails: MemberCredential[] = [];
    if (!s.isNotWhiteList) {
      staffCredentails = await this.getCredentials(
        s.AccountId,
        s.OrderPassengerId
      );
      if (
        this.forType == FlightHotelTrainType.HotelInternational ||
        this.forType == FlightHotelTrainType.InternationalFlight
      ) {
        const temp = staffCredentails.filter(
          (it) =>
            it.Type == CredentialsType.Passport ||
            CredentialsType.HmPass == it.Type
        );
        const temp2 = staffCredentails.filter(
          (it) =>
            it.Type != CredentialsType.IdCard &&
            !(
              it.Type == CredentialsType.Passport ||
              CredentialsType.HmPass == it.Type
            )
        );
        this.staffCredentails = temp.concat(temp2);
      } else {
        this.staffCredentails = staffCredentails;
      }
      let first =
        this.staffCredentails.find((it) => it.Type == CredentialsType.IdCard) ||
        this.staffCredentails.length
          ? this.staffCredentails[0]
          : null;
      if (
        this.forType == FlightHotelTrainType.HotelInternational ||
        this.forType == FlightHotelTrainType.InternationalFlight
      ) {
        first = this.staffCredentails.find((it) =>
          this.interFlightService.isPassportHmTwPass(it.Type)
        );
      }
      // if (first) {
      //   this.selectedCredentialId = first.Id;
      // }
    } else {
      // 选择了非白名单，直接新增证件
      this.staffCredentails = [];
    }
    // 新增的非白名单证件或者新增旅客的其他证件
    if (await this.canAddNotWhiteListCredential()) {
      this.initNewCredential(s);
    }
    if (this.scroller) {
      this.scroller.disabled = true;
    }
    this.content.scrollToTop();
    if (
      !this.vmNewCredential &&
      (!this.staffCredentails || !this.staffCredentails.length)
    ) {
      AppHelper.alert("所选乘客尚无可用证件信息");
      return;
    }
    this.vmStaffs = null; // 是否显示搜索列表
  }
  private initNewCredential(s: StaffEntity) {
    this.vmNewCredential = new MemberCredential();
    this.vmNewCredential.isNotWhiteList = s.isNotWhiteList;
    this.vmNewCredential.variables = s.isNotWhiteList
      ? NOT_WHITE_LIST
      : "OtherCredential";
    this.vmNewCredential.Id = "0";
    if (this.staffCredentails.length == 0 || s.isNotWhiteList) {
      this.selectedCredentialId = this.vmNewCredential.Id;
    }
    this.vmNewCredential.CredentialsRemark = "客户";
    this.vmNewCredential.Type =
      this.forType == FlightHotelTrainType.HotelInternational ||
      this.forType == FlightHotelTrainType.InternationalFlight
        ? CredentialsType.Passport
        : CredentialsType.IdCard;
    this.vmNewCredential.Gender = "M";
    this.vmNewCredential.showIssueCountry = { Code: "CN", Name: "中国" };
    this.vmNewCredential.IssueCountry = "CN";
    this.vmNewCredential.showCountry = { Code: "CN", Name: "中国" };
    this.vmNewCredential.Country = "CN";
    this.isShowNewCredential = true;
  }

  onSelectCredential(credentialId: string) {
    console.log("credentialId", credentialId);
    if (this.selectedCredentialId != credentialId) {
      this.selectedCredentialId = credentialId;
    } else if (this.selectedCredentialId) {
      this.selectedCredentialId = null;
    } else {
      this.selectedCredentialId = credentialId;
    }

    // if(credentialId){

    // }
    console.log("this.selectedCredentialId", this.selectedCredentialId);
  }
  async onAddPassenger() {
    let selectedCredential: MemberCredential;
    if (!this.selectedCredentialId) {
      AppHelper.alert(
        LanguageHelper.Flight.getMustSelectOneCredentialTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      return;
    }
    selectedCredential = (this.staffCredentails || [])
      .concat(this.frqPassengerCredentials || [])
      .concat(this.vmNewCredential ? [this.vmNewCredential] : [])
      .find((c) => c.Id == this.selectedCredentialId);
    if (!selectedCredential) {
      AppHelper.alert(
        LanguageHelper.Flight.getMustSelectOneCredentialTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      return;
    }
    if (this.forType == FlightHotelTrainType.HotelInternational) {
      const isPsssportOrHmPass =
        selectedCredential.Type == CredentialsType.Passport ||
        selectedCredential.Type == CredentialsType.HmPass ||
        selectedCredential.Type == CredentialsType.TaiwanEp;
      if (!isPsssportOrHmPass) {
        await AppHelper.alert(
          "需要维护护照或者港澳台通行证",
          true,
          LanguageHelper.getConfirmTip()
        );
        return;
      }
    }
    if (
      this.vmNewCredential &&
      selectedCredential.Id == this.vmNewCredential.Id
    ) {
      const exists =
        this.bookInfos &&
        this.bookInfos.filter(
          (it) =>
            it.isNotWhitelist &&
            it.credential &&
            it.credential.Number == this.vmNewCredential.Number
        );
      if (exists && exists.length) {
        AppHelper.alert("输入的证件号和已选人员的证件号重复，请核实！");
        return;
      }
      this.vmNewCredential.Name =
        ((this.vmNewCredential.Surname && this.vmNewCredential.Surname) || "")
          .trim()
          .replace(/\s/g, "") +
        ((this.vmNewCredential.Givenname &&
          this.vmNewCredential.Givenname.trim()) ||
          "");
      const validate =
        this.credentialsComp && (await this.credentialsComp.saveAdd());
      if (!validate) {
        return;
      }
    }
    if (
      selectedCredential &&
      this.vmNewCredential &&
      selectedCredential.Id == this.vmNewCredential.Id
    ) {
      if (!selectedCredential.TypeName) {
        selectedCredential.TypeName = new CredentialPipe().transform(
          selectedCredential.Type
        );
      }
      selectedCredential = {
        ...selectedCredential,
        showCountry: {
          ...this.vmNewCredential.showCountry,
        },
        Country: this.vmNewCredential.showCountry.Code,
        showIssueCountry: {
          ...this.vmNewCredential.showIssueCountry,
        },
        IssueCountry: this.vmNewCredential.showIssueCountry.Code,
        Name: `${this.vmNewCredential.Surname}${this.vmNewCredential.Givenname}`,
      };
    }
    if (!selectedCredential.Number) {
      AppHelper.alert(
        LanguageHelper.getCredentialNumberEmptyTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
      return;
    }
    const isNotWhitelist =
      this.selectedPassenger.isNotWhiteList || !this.selectedPassenger.Policy;
    if (!selectedCredential.HideNumber) {
      selectedCredential.HideNumber = selectedCredential.Number;
    }
    const passengerBookInfo: PassengerBookInfo<any> = {
      credential: ({
        ...selectedCredential,
      } as any) as CredentialsEntity,
      isNotWhitelist,
      passenger: {
        ...this.selectedPassenger,
        Name: this.selectedPassenger.Name,
      },
    };
    const canAdd = await this.onAddPassengerBookInfo(passengerBookInfo);
    this.isCanDeactive = true;
    if (!canAdd) {
      return;
    }
    const ok = await AppHelper.alert(
      LanguageHelper.Flight.getAddMorePassengersTip(),
      true,
      `完成`,
      `继续添加`
    );
    if (ok) {
      console.log();
    }
    if (ok) {
      this.back();
    } else {
      this.doRefresh("");
    }
  }

  private async onAddPassengerBookInfo(
    passengerBookInfo: PassengerBookInfo<any>
  ) {
    if (this.forType == FlightHotelTrainType.HotelInternational) {
      if (this.interHotelService.getBookInfos().length > 0) {
        AppHelper.alert(
          LanguageHelper.Hotel.getCannotBookMoreHotelPassengerTip()
        );
        return false;
      }
      this.interHotelService.addBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.Hotel) {
      if (this.hotelService.getBookInfos().length > 0) {
        AppHelper.alert(
          LanguageHelper.Hotel.getCannotBookMoreHotelPassengerTip()
        );
        return false;
      }
      this.hotelService.addBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.Flight) {
      const can = this.flightService.getPassengerBookInfos().length < 9;
      if (!can) {
        AppHelper.alert(LanguageHelper.Flight.getCannotBookMorePassengerTip());
        return false;
      }
      this.flightService.addPassengerBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.InternationalFlight) {
      const can = this.interFlightService.getBookInfos().length < 9;
      if (!can) {
        AppHelper.alert(LanguageHelper.Flight.getCannotBookMorePassengerTip());
        return false;
      }
      const bookInfos = this.interFlightService.getBookInfos();
      this.interFlightService.addPassengerBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.Train) {
      if (this.trainService.getBookInfos().length > 4) {
        AppHelper.alert(LanguageHelper.Train.getCannotBookMorePassengerTip());
        return false;
      }
      this.trainService.addBookInfo(passengerBookInfo);
    }
    return true;
  }
  back(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    if (!this.isOpenPageAsModal) {
      this.navCtrl.pop();
    } else {
      this.modalController.getTop().then((t) => {
        if (t) {
          t.dismiss();
        }
      });
    }
  }
  async canDeactivate() {
    if (this.isCanDeactive) {
      return true;
    }
    const ok = await AppHelper.alert(
      LanguageHelper.getModifyUnSavedTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (!ok) {
      if (this.vmStaffs) {
        this.vmStaffs = [];
        this.doRefresh(this.vmKeyword);
        return false;
      }
      if (this.vmNewCredential) {
        this.vmNewCredential = null;
        this.doRefresh(this.vmKeyword);
        return false;
      }
    }
    return ok;
  }
  private async getCredentials(accountId: string, orderPassengerId: string) {
    this.loading = true;
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Staff-Credentials";
    req.Data = {
      AccountId: accountId,
      OrderPassengerId: orderPassengerId || "",
    };
    const credentials = await this.apiService
      .getPromiseData<MemberCredential[]>(req)
      .then((res) => res || [])
      .catch((_) => []);
    if (await this.canAddNotWhiteListCredential()) {
      this.frqPassengerCredentials = await this.getPassengers(accountId);
    }
    this.loading = false;
    return credentials as MemberCredential[];
    // return this.staffService.getStaffCredentials(accountId);
  }
  private async getPassengers(accountId: string): Promise<MemberCredential[]> {
    this.loading = true;
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Staff-Passengers";
    req.Data = {
      AccountId: accountId,
    };
    const passengers: any[] = await this.apiService
      .getPromiseData<
        {
          Id: string;
          Number: string;
          CredentialsType: string;
          CredentialsTypeName: string;
          SureName: string;
          GivenName: string;
          Country: string;
          IssueCountry: string;
          Birthday: string;
          ExpirationDate: string;
          Gender: string;
        }[]
      >(req)
      .then((res) => res || [])
      .catch((_) => []);
    return passengers.map((r) => ({
      ...r,
      Type: r.CredentialsType,
      TypeName: r.CredentialsTypeName,
      variables: "FrequentPassenger",
    }));
  }
  initializeValidateAdd(el: HTMLElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
  }
  async selectIdentityNationality() {
    if (this.selectedCredentialId != this.vmNewCredential.Id) {
      return;
    }
    this.requestCode = "identityNationality";
    await this.selectCountry();
  }
  async selectIssueNationality() {
    if (this.selectedCredentialId != this.vmNewCredential.Id) {
      return;
    }
    this.requestCode = "issueNationality";
    await this.selectCountry();
  }
  private async selectCountry() {
    this.isCanDeactive = true;
    const m = await this.modalController.create({
      component: SelectCountryModalComponent,
      componentProps: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectIssueCountryTip(),
      },
    });
    m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      const data = result.data as {
        requestCode: string;
        selectedItem: CountryEntity;
      };
      if (data.selectedItem) {
        if (data.requestCode == "issueNationality") {
          this.vmNewCredential.showIssueCountry = data.selectedItem;
          this.vmNewCredential.IssueCountry = data.selectedItem.Code;
        }
        if (data.requestCode == "identityNationality") {
          this.vmNewCredential.Country = data.selectedItem.Code;
          this.vmNewCredential.showCountry = data.selectedItem;
        }
      }
    }
  }
}
