import { MemberService, MemberCredential } from "./../../member/member.service";
import { CanComponentDeactivate } from "./../../guards/candeactivate.guard";
import { StaffBookType } from "./../../tmc/models/StaffBookType";
import { StaffService } from "./../../hr/staff.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { ApiService } from "./../../services/api/api.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  FlightService,
  PassengerFlightSegments,
  TripType
} from "src/app/flight/flight.service";
import { SelectedPassengersComponent } from "./../components/selected-passengers/selected-passengers.component";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  ViewChildren,
  QueryList,
  NgZone,
  Renderer2,
  ElementRef
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
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LanguageHelper } from "src/app/languageHelper";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { Country } from "src/app/pages/select-country/select-country.page";
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
  implements OnInit, CanComponentDeactivate, AfterViewInit {
  passengerFlightSegments: PassengerFlightSegments[];
  vmKeyword: string;
  vmNewCredentialId:string;
  credentialsRemarks: { key: string; value: string }[];
  selectedCredentialId: string;
  private keyword: string;
  selectedPasengers$: Observable<number>;
  currentPage = 1;
  pageSize = 15;
  vmStaffs: StaffEntity[];
  private selectedPassenger: StaffEntity;
  vmNewCredential: MemberCredential;
  private newCredential: MemberCredential;
  loading = false;
  openclose = true;
  isCanDeactive = true;
  staffCredentails: MemberCredential[] = [];
  frequentPassengers: MemberCredential[];
  identityTypes: { key: string; value: string }[];
  passengerTypes: {
    key: string;
    value: string;
  }[];
  requestCode: "issueNationality" | "identityNationality";
  @ViewChild(IonRefresher) ionrefresher: IonRefresher;
  @ViewChild(IonInfiniteScroll) scroller: IonInfiniteScroll;
  @ViewChildren("addForm") addForm: QueryList<IonGrid>;
  constructor(
    public modalController: ModalController,
    private flightService: FlightService,
    route: ActivatedRoute,
    private navCtrl: NavController,
    private apiService: ApiService,
    private identityService: IdentityService,
    private staffService: StaffService,
    private memberService: MemberService,
    private router: Router,
    private validatorService: ValidatorService,
    private domCtrl: DomController,
    private renderer2: Renderer2,
    private ngZone: NgZone
  ) {
    this.selectedPasengers$ = flightService
      .getSelectedPasengerSource()
      .pipe(map(items => items.length));
    route.queryParamMap.subscribe(p => {
      this.vmNewCredentialId=`${AppHelper.uuid(5)}NewNotWhitelistCredentialId`;
      this.passengerFlightSegments = this.flightService.getPassengerFlightSegments();
      this.isCanDeactive = false;
      const country: Country = AppHelper.getRouteData();
      if (country && country.Code) {
        this.vmNewCredential.isModified = true;
        console.log(this.vmNewCredential, this.requestCode);
        if (this.requestCode === "issueNationality") {
          this.vmNewCredential.IssueCountry = country;
        }
        if (this.requestCode === "identityNationality") {
          this.vmNewCredential.Country = country;
        }
        AppHelper.setRouteData(null);
      }
    });
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
  async ngOnInit() {
    this.getIdentityTypes();
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
  async canAddNotWhiteListCredential() {
    // 代理和特殊可以新增证件
    const identity = await this.identityService.getIdentityAsync();
    const can =
      !!(identity&&identity.Numbers && identity.Numbers.AgentId) ||
      (await this.staffService.getStaff()).BookType == StaffBookType.All;
    console.log("can add not whitelist ", can);
    return can;
  }
  async onShow() {
    const m = await this.modalController.create({
      component: SelectedPassengersComponent
    });
    await m.present();
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
    // 代理或者特殊，显示白名单
    if (await this.canAddNotWhiteListCredential()) {
      const item = new StaffEntity();
      item.AccountId = "0";
      item.CredentialsInfo = LanguageHelper.Flight.getNotWhitelistingTip();
      staffs.unshift(item);
    }
    this.vmStaffs = staffs;
    this.loading = false;
  }
  async onSelect(s: StaffEntity) {
    this.vmStaffs = null; // 是否显示搜索列表
    this.newCredential = null;
    this.vmNewCredential = null; // 页面上显示新增此人其他证件
    this.selectedPassenger = s;
    this.selectedCredentialId = null; // 所选择的证件
    this.frequentPassengers = null; // 是否显示常旅客
    console.log("onSelect", s);
    if (s.AccountId != "0") {
      this.staffCredentails = await this.getCredentials(s.AccountId);
    } else {
      this.staffCredentails = [];
    }
    if (s.CredentialsInfo == LanguageHelper.Flight.getNotWhitelistingTip()) {
      this.staffCredentails = [];
    }
    if (await this.canAddNotWhiteListCredential()) {
      this.vmNewCredential = new MemberCredential();
      this.vmNewCredential.variables = "OtherCredential";
      this.vmNewCredential.CredentialsRemark = "客户";
      this.vmNewCredential.Type = CredentialsType.IdCard;
      this.vmNewCredential.Id = this.vmNewCredentialId;
      this.vmNewCredential.Gender = "M";
      this.vmNewCredential.IssueCountry = { Code: "CN", Name: "中国" };
      this.vmNewCredential.Country = { Code: "CN", Name: "中国" };
    }
  }
  onSelectCredential(credentialId: string) {
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
      .concat(this.frequentPassengers || [])
      .concat(this.vmNewCredential)
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
    if (selectedCredential == this.vmNewCredential) {
      this.newCredential = {
        ...this.vmNewCredential,
        Country: this.vmNewCredential.Country.Code,
        IssueCountry: this.vmNewCredential.IssueCountry.Code
      };
      const validate = await this.validateCredential(
        this.vmNewCredential,
        this.addForm && this.addForm.last && this.addForm.last["el"]
      );
      if (!validate) {
        return;
      }
    }
    const item: PassengerFlightSegments = {
      credential: selectedCredential,
      passenger: this.selectedPassenger,
      selectedInfo: []
    };
    this.flightService.addSelectedPassengers(item.passenger);
    this.flightService.addPassengerFlightSegments(item);
    this.isCanDeactive = true;
    const ok = await AppHelper.alert(
      LanguageHelper.Flight.getAddMorePassengersTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (!ok) {
      this.back();
    } else {
      this.doRefresh("");
    }
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

    if (!c.Birthday) {
      return this.checkProperty(c, "Birthday", rules, container);
    }
    this.ngZone.runOutsideAngular(() => {
      c.Birthday = moment(c.Birthday).format("YYYY-MM-DD");
    });
    console.log(c.Birthday);
    if (!c.ExpirationDate) {
      return this.checkProperty(c, "ExpirationDate", rules, container);
    }
    this.ngZone.runOutsideAngular(() => {
      c.ExpirationDate = moment(c.ExpirationDate).format("YYYY-MM-DD");
    });
    console.log(c.ExpirationDate);
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
    this.navCtrl.back();
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
      this.frequentPassengers = await this.getPassengers(accountId);
    }
    this.loading = false;
    return credentials;
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
  selectIdentityNationality() {
    this.requestCode = "identityNationality";
    this.isCanDeactive = true;
    this.router.navigate([AppHelper.getRoutePath("select-country")], {
      queryParams: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectCountryTip()
      }
    });
  }
  selectIssueNationality() {
    this.isCanDeactive = true;
    this.requestCode = "issueNationality";
    this.router.navigate([AppHelper.getRoutePath("select-country")], {
      queryParams: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectIssueCountryTip()
      }
    });
  }
}
