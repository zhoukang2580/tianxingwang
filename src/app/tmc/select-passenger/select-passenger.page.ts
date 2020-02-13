import { InternationalHotelService } from "./../../hotel-international/international-hotel.service";
import { HotelService } from "./../../hotel/hotel.service";
import { SelectCountryModalComponent } from "../components/select-country/select-countrymodal.component";
import { TrainService } from "./../../train/train.service";
import { FlightHotelTrainType, PassengerBookInfo } from "./../tmc.service";
import { CredentialsEntity } from "../models/CredentialsEntity";
import { TmcService } from "../tmc.service";
import { MemberService, MemberCredential } from "../../member/member.service";
import { CanComponentDeactivate } from "../../guards/candeactivate.guard";
import { StaffService, StaffBookType } from "../../hr/staff.service";
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
  OnDestroy
} from "@angular/core";
import {
  IonInfiniteScroll,
  IonRefresher,
  NavController,
  ModalController,
  IonGrid,
  DomController,
  IonToolbar
} from "@ionic/angular";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { StaffEntity } from "src/app/hr/staff.service";
import { Observable, Subscription, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { LanguageHelper } from "src/app/languageHelper";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { Country } from "src/app/tmc/components/select-country/select-countrymodal.component";
import { AppHelper } from "src/app/appHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";
import * as moment from "moment";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { AccountEntity } from "src/app/account/models/AccountEntity";
export const NOT_WHITE_LIST = "notwhitelist";
@Component({
  selector: "app-select-passenger",
  templateUrl: "./select-passenger.page.html",
  styleUrls: ["./select-passenger.page.scss"],
  animations: [
    trigger("openclose", [
      state("true", style({ height: "*", opacity: "1" })),
      state("false", style({ height: "0", opacity: "0" })),
      transition("true<=>false", animate("200ms"))
    ])
  ]
})
export class SelectPassengerPage
  implements OnInit, CanComponentDeactivate, AfterViewInit, OnDestroy {
  private keyword: string;
  private isOpenPageAsModal = false; // 设置是否通过modalcontroller打开
  private forType: FlightHotelTrainType; // isOpenPageAsModal 传入参数
  private bookInfos: PassengerBookInfo<any>[];
  removeitem: EventEmitter<PassengerBookInfo<any>>; // isOpenPageAsModal 传入参数
  isShow = true;
  vmKeyword: string;
  isShowNewCredential = false;
  credentialsRemarks: { key: string; value: string }[];
  selectedCredentialId: string;
  selectedPasengersNumber$: Observable<number> = of(0);
  currentPage = 1;
  pageSize = 15;
  vmStaffs: StaffEntity[];
  selectedPassenger: StaffEntity;
  removeitemSubscription = Subscription.EMPTY;
  canAddMoreSubscription = Subscription.EMPTY;
  vmNewCredential: MemberCredential;
  loading = false;
  openclose = true;
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
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChildren("addForm") addForm: QueryList<IonGrid>;
  title = "选择旅客";
  constructor(
    public modalController: ModalController,
    private navCtrl: NavController,
    private apiService: ApiService,
    private identityService: IdentityService,
    private staffService: StaffService,
    private validatorService: ValidatorService,
    private domCtrl: DomController,
    private tmcService: TmcService,
    private flightService: FlightService,
    private trainService: TrainService,
    private hotelService: HotelService,
    private interHotelService: InternationalHotelService,
    private route: ActivatedRoute
  ) {
    this.removeitem = new EventEmitter();
  }
  getIdentityTypes() {
    this.identityTypes = Object.keys(CredentialsType)
      .filter(k => +k)
      .map(k => {
        return {
          key: k,
          value: CredentialsType[k]
        };
      });
    console.log(this.identityTypes);
  }
  compareFn(t1, t2) {
    return t1 == t2;
  }
  ngAfterViewInit() {
    this.addForm.changes.subscribe(_ => {
      console.log("this.addForm.changes ", this.addForm.last);
      if (this.addForm.last) {
        this.initializeValidateAdd(this.addForm.last["el"]);
      }
    });
  }
  ngOnDestroy() {
    this.removeitemSubscription.unsubscribe();
  }
  async ngOnInit() {
    this.route.queryParamMap.subscribe(_ => {
      if (_.get("forType")) {
        this.forType = (_.get("forType") as any) as FlightHotelTrainType;
      }
      this.getIdentityTypes();
      this.initPassengerTypes();
      this.initCredentialsRemarks();
      this.initRemoveitem();
      this.initBookInfos();
      if (this.bookInfos$) {
        this.selectedPasengersNumber$ = this.bookInfos$.pipe(
          tap(infos => {
            this.bookInfos = infos;
          }),
          map(infos => infos.length)
        );
      }
      this.isCanDeactive = false;
    });
  }
  private initRemoveitem() {
    this.removeitemSubscription = this.removeitem.subscribe(async info => {
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
    if (this.bookInfos$) {
      this.bookInfos$ = this.bookInfos$.pipe(
        tap(infos => {
          this.bookInfos = infos;
          console.log(
            "bookinfos",
            this.bookInfos &&
              this.bookInfos.map(
                it => it.passenger && it.passenger.Policy && it.passenger.Policy
              )
          );
        })
      );
    }
  }
  private initCredentialsRemarks() {
    this.credentialsRemarks = [
      {
        key: "客户",
        value: LanguageHelper.Flight.getPassengerTypeCustomerTip()
      },
      {
        key: "供应商",
        value: LanguageHelper.Flight.getPassengerTypeSupplierTip()
      },
      {
        key: "员工",
        value: LanguageHelper.Flight.getPassengerTypeEmployeeTip()
      },
      {
        key: "其它乘客类别",
        value: LanguageHelper.Flight.getPassengerTypeOtherTip()
      }
    ];
  }
  private initPassengerTypes() {
    this.passengerTypes = [
      {
        key: "1",
        value: LanguageHelper.Flight.getPassengerTypeCustomerTip()
      },
      {
        key: "2",
        value: LanguageHelper.Flight.getPassengerTypeSupplierTip()
      },
      {
        key: "3",
        value: LanguageHelper.Flight.getPassengerTypeEmployeeTip()
      },
      {
        key: "4",
        value: LanguageHelper.Flight.getPassengerTypeOtherTip()
      }
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
      (staff && staff.BookType) == StaffBookType.All;
    console.log("can add not whitelist ", can);
    return can;
  }
  async onShow() {
    const m = await this.modalController.create({
      component: SelectedPassengersComponent,
      componentProps: {
        bookInfos$: this.bookInfos$,
        removeitem: this.removeitem
      }
    });
    await m.present();
    await m.onDidDismiss();
  }
  doRefresh(keyword) {
    this.domCtrl.write(_ => {
      this.openclose = true;
    });
    this.currentPage = 1;
    this.vmStaffs = [];
    this.keyword = keyword || "";
    if (this.scroller) {
      this.scroller.disabled = false;
    }
    this.selectedPassenger = null;
    this.isShowNewCredential = false; // 页面上显示新增此人其他证件,或者是非白名单的证件
    this.vmNewCredential = null;
    this.selectedCredentialId = null; // 所选择的证件Id
    this.loadMore();
  }
  onSearch(event: any) {
    console.log("onSearch", event);
    this.loading = true;
    this.staffCredentails = [];
    this.doRefresh((this.vmKeyword || "").trim());
  }
  private async loadMore() {
    this.loading = true;
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Staff-List";
    req.Data = {
      Name: this.keyword.trim()
    };
    const staffs: StaffEntity[] = await this.apiService
      .getPromiseData<StaffEntity[]>(req)
      .then(res => res || [])
      .catch(_ => []);
    if (this.ionrefresher) {
      this.ionrefresher.complete();
    }
    // 代理或者特殊，显示可以选择非白名单
    if (await this.canAddNotWhiteListCredential()) {
      const passenger = new StaffEntity();
      passenger.isNotWhiteList = true;
      const tmc = await this.tmcService.getTmc(false).catch(_ => null);
      passenger.Account = new AccountEntity();
      passenger.Account.Id = tmc && tmc.Account.Id; // 所选的tmcId
      passenger.AccountId = passenger.Account.Id;
      passenger.CredentialsInfo = LanguageHelper.Flight.getNotWhitelistingTip(); // 非白名单
      staffs.unshift(passenger);
    }
    this.vmStaffs = staffs;
    this.loading = false;
  }
  async onSelect(s: StaffEntity) {
    console.log("onSelect", s);
    this.selectedPassenger = s;
    this.vmStaffs = null; // 是否显示搜索列表
    this.isShowNewCredential = false; // 页面上显示新增此人其他证件,或者是非白名单的证件
    this.vmNewCredential = null;
    this.selectedCredentialId = null; // 所选择的证件Id
    this.frqPassengerCredentials = null; // 是否显示常旅客
    // 白名单
    if (!s.isNotWhiteList) {
      this.staffCredentails = await this.getCredentials(s.AccountId);
      const first =
        this.staffCredentails.find(it => it.Type == CredentialsType.IdCard) ||
        this.staffCredentails.length
          ? this.staffCredentails[0]
          : null;
      if (first) {
        this.selectedCredentialId = first.Id;
      }
    } else {
      // 选择了非白名单，直接新增证件
      this.staffCredentails = [];
    }
    // 新增的非白名单证件或者新增旅客的其他证件
    if (await this.canAddNotWhiteListCredential()) {
      this.initNewCredential(s);
    }
  }
  private initNewCredential(s: StaffEntity) {
    this.vmNewCredential = new MemberCredential();
    this.vmNewCredential.isNotWhiteList = s.isNotWhiteList;
    this.vmNewCredential.variables = s.isNotWhiteList
      ? NOT_WHITE_LIST
      : "OtherCredential";
    this.vmNewCredential.Id = this.getNewCredentialId();
    if (this.staffCredentails.length == 0 || s.isNotWhiteList) {
      this.selectedCredentialId = this.vmNewCredential.Id;
    }
    this.vmNewCredential.CredentialsRemark = "客户";
    this.vmNewCredential.Type = CredentialsType.IdCard;
    this.vmNewCredential.Gender = "M";
    this.vmNewCredential.IssueCountry = { Code: "CN", Name: "中国" };
    this.vmNewCredential.Country = { Code: "CN", Name: "中国" };
    this.isShowNewCredential = true;
  }
  private getNewCredentialId() {
    const uuid = AppHelper.uuid();
    const id = uuid
      .substr(0, 8)
      .split("")
      .map(i => {
        return +i || +i === 0 ? i : i.charCodeAt(0);
      })
      .join("");
    const id2 = uuid.match(/\d+/g) ? uuid.match(/\d+/g).join("") : "";
    return id2 || id;
  }
  onSelectCredential(credentialId: string) {
    console.log("onSelectCredential", credentialId);
    this.selectedCredentialId = credentialId;
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
      .find(c => c.Id == this.selectedCredentialId);
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
        selectedCredential.Type == CredentialsType.HmPass;
      if (!isPsssportOrHmPass) {
        const ok = await AppHelper.alert(
          "当前选择的证件不是护照或者港澳台通行证，是否继续？",
          true,
          LanguageHelper.getYesTip(),
          LanguageHelper.getNegativeTip()
        );
        if (!ok) {
          return;
        }
      }
    }
    if (
      this.vmNewCredential &&
      selectedCredential.Id == this.vmNewCredential.Id
    ) {
      selectedCredential.CheckFirstName =
        selectedCredential.CheckFirstName || this.vmNewCredential.FirstName;
      selectedCredential.CheckLastName =
        selectedCredential.CheckLastName || this.vmNewCredential.LastName;
      const validate = await this.validateCredential(
        selectedCredential,
        this.addForm && this.addForm.last && this.addForm.last["el"]
      );
      if (!validate) {
        return;
      }
    }
    if (
      selectedCredential &&
      this.vmNewCredential &&
      selectedCredential.Id == this.vmNewCredential.Id
    ) {
      selectedCredential = {
        ...selectedCredential,
        Country: this.vmNewCredential.Country.Code,
        IssueCountry: this.vmNewCredential.IssueCountry.Code
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
    const passengerBookInfo: PassengerBookInfo<any> = {
      credential: ({
        ...selectedCredential,
        CheckName: `${selectedCredential.CheckFirstName}${selectedCredential.CheckLastName}`
      } as any) as CredentialsEntity,
      isNotWhitelist: this.selectedPassenger.isNotWhiteList,
      passenger: {
        ...this.selectedPassenger,
        Name:
          this.selectedPassenger.Name ||
          `${selectedCredential.CheckFirstName}${selectedCredential.CheckLastName}`
      }
    };
    const canAdd = await this.onAddPassengerBookInfo(passengerBookInfo);
    this.isCanDeactive = true;
    if (!canAdd) {
      return;
    }
    const ok = await AppHelper.alert(
      LanguageHelper.Flight.getAddMorePassengersTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (ok) {
      this.back();
    } else {
      this.doRefresh("");
    }
  }
  private checkNewCredentialId(
    passengerBookInfo: PassengerBookInfo<any>,
    bookInfos: PassengerBookInfo<any>[]
  ) {
    const action = () => {
      const one = bookInfos.find(
        item =>
          item.isNotWhitelist &&
          item.credential.Id == passengerBookInfo.credential.Id
      );
      if (one) {
        passengerBookInfo.credential.Id = this.getNewCredentialId();
        action();
      }
    };
    action();
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
      const bookInfos = this.interHotelService.getBookInfos();
      this.checkNewCredentialId(passengerBookInfo, bookInfos);
      this.interHotelService.addBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.Hotel) {
      if (this.hotelService.getBookInfos().length > 0) {
        AppHelper.alert(
          LanguageHelper.Hotel.getCannotBookMoreHotelPassengerTip()
        );
        return false;
      }
      const bookInfos = this.hotelService.getBookInfos();
      this.checkNewCredentialId(passengerBookInfo, bookInfos);
      this.hotelService.addBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.Flight) {
      const can = this.flightService.getPassengerBookInfos().length < 9;
      if (!can) {
        AppHelper.alert(LanguageHelper.Flight.getCannotBookMorePassengerTip());
        return false;
      }
      const bookInfos = this.flightService.getPassengerBookInfos();
      this.checkNewCredentialId(passengerBookInfo, bookInfos);
      this.flightService.addPassengerBookInfo(passengerBookInfo);
    }
    if (this.forType == FlightHotelTrainType.Train) {
      if (this.trainService.getBookInfos().length > 4) {
        AppHelper.alert(LanguageHelper.Train.getCannotBookMorePassengerTip());
        return false;
      }
      const bookInfos = this.trainService.getBookInfos();
      this.checkNewCredentialId(passengerBookInfo, bookInfos);
      this.trainService.addBookInfo(passengerBookInfo);
    }
    return true;
  }
  async validateCredential(c: MemberCredential, container: HTMLElement) {
    if (!c || !container) {
      return Promise.resolve(false);
    }
    const info = await this.validatorService
      .get("Beeant.Domain.Entities.Member.CredentialsEntity", "Add")
      .catch(e => {
        AppHelper.alert(e);
        return { rule: [] };
      });
    console.log(info);
    if (!info || !info.rule) {
      AppHelper.alert(LanguageHelper.getValidateRulesEmptyTip());
      return true;
    }
    const rules = info.rule;
    if (!c.Type) {
      return this.checkProperty(c, "Type", rules, container);
    }
    if (!c.Number) {
      return this.checkProperty(c, "Number", rules, container);
    }
    if (!c.FirstName) {
      return this.checkProperty(c, "FirstName", rules, container);
    }
    if (!c.LastName) {
      return this.checkProperty(c, "LastName", rules, container);
    }
    if (!c.CheckFirstName) {
      return this.checkProperty(c, "CheckFirstName", rules, container);
    }
    if (!c.CheckLastName) {
      return this.checkProperty(c, "CheckLastName", rules, container);
    }
    if (!c.Country) {
      return this.checkProperty(c, "Country", rules, container);
    }
    if (!c.IssueCountry) {
      return this.checkProperty(c, "IssueCountry", rules, container);
    }
    if (!c.Gender) {
      return this.checkProperty(c, "Gender", rules, container);
    }

    // if (!c.Birthday) {
    //   return this.checkProperty(c, "Birthday", rules, container);
    // }
    // c.Birthday = moment(c.Birthday).format("YYYY-MM-DD");
    // console.log(c.Birthday);
    // if (!c.ExpirationDate) {
    //   return this.checkProperty(c, "ExpirationDate", rules, container);
    // }
    // c.ExpirationDate = moment(c.ExpirationDate).format("YYYY-MM-DD");
    // console.log(c.ExpirationDate);
    if (!c.CredentialsRemark) {
      return this.checkProperty(c, "CredentialsRemark", rules, container);
    }
    return true;
  }
  private checkProperty(
    obj: any,
    pro: string,
    rules: { Name: string; Message }[],
    container: HTMLElement
  ) {
    try {
      if (!obj) {
        return false;
      }
      if (pro == "CredentialsRemark" && !obj[pro]) {
        AppHelper.alert(
          LanguageHelper.Flight.getMustSelectPassengerTypeTip(),
          true
        );
        return false;
      }
      if (!obj[pro]) {
        const rule = rules.find(
          it => it.Name.toLowerCase() == pro.toLowerCase()
        );
        const input = container.querySelector(
          `input[ValidateName=${pro}]`
        ) as HTMLInputElement;
        console.log(`input[ValidateName=${pro}]`, input);

        if (rule) {
          AppHelper.alert(rule.Message, true).then(_ => {
            if (input) {
              setTimeout(() => {
                input.focus();
              }, 300);
            }
          });
        }
        return false;
      }
      return true;
    } catch (e) {
      AppHelper.alert(e);
      return false;
    }
  }
  back() {
    if (!this.isOpenPageAsModal) {
      this.navCtrl.pop();
    } else {
      this.modalController.getTop().then(t => {
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
    return await AppHelper.alert(
      LanguageHelper.getModifyUnSavedTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
  }
  private async getCredentials(accountId: string) {
    this.loading = true;
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Staff-Credentials";
    req.Data = {
      AccountId: accountId
    };
    const credentials = await this.apiService
      .getPromiseData<MemberCredential[]>(req)
      .then(res => res || [])
      .catch(_ => []);
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
      AccountId: accountId
    };
    const passengers: any[] = await this.apiService
      .getPromiseData<
        {
          Id: string;
          Number: string;
          CredentialsType: string;
          CredentialsTypeName: string;
          FirstName: string;
          LastName: string;
          CheckName: string;
          CheckFirstName: string;
          CheckLastName: string;
          Country: string;
          IssueCountry: string;
          Birthday: string;
          ExpirationDate: string;
          Gender: string;
        }[]
      >(req)
      .then(res => res || [])
      .catch(_ => []);
    return passengers.map(r => ({
      ...r,
      Type: r.CredentialsType,
      TypeName: r.CredentialsTypeName,
      variables: "FrequentPassenger"
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
        title: LanguageHelper.getSelectIssueCountryTip()
      }
    });
    m.present();
    const result = await m.onDidDismiss();
    if (result && result.data) {
      const data = result.data as {
        requestCode: string;
        selectedItem: Country;
      };
      if (data.selectedItem) {
        if (data.requestCode == "issueNationality") {
          this.vmNewCredential.IssueCountry = data.selectedItem;
        }
        if (data.requestCode == "identityNationality") {
          this.vmNewCredential.Country = data.selectedItem;
        }
      }
    }
  }
}
