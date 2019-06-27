import { ApiService } from "./../../services/api/api.service";
import { Country } from "./../../pages/select-country/select-country.page";
import { LanguageHelper } from "./../../languageHelper";
import { IonRefresher, IonGrid } from "@ionic/angular";
import { Credentials, TmcService } from "./../../tmc/tmc.service";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  NgZone
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { CredentialsType } from "src/app/tmc/pipe/credential.pipe";
import * as moment from "moment";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
@Component({
  selector: "app-member-credential-management",
  templateUrl: "./member-credential-management.page.html",
  styleUrls: ["./member-credential-management.page.scss"]
})
export class MemberCredentialManagementPage
  implements OnInit, AfterViewInit, CanComponentDeactivate {
  identityTypes: { key: string; value: string }[];
  credentials: Credentials[];
  newCredentials: Credentials[] = []; // 新增的证件
  loading = false;
  isModify = false;
  isCanDeactive = false;
  requestCode: "issueNationality" | "identityNationality";
  currentModifyItem: Credentials;
  @ViewChild("f") formEle: ElementRef<HTMLFormElement>;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChildren("addForm") addForm: QueryList<IonGrid>;
  constructor(
    private router: Router,
    private validatorService: ValidatorService,
    private tmcService: TmcService,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {
    route.queryParamMap.subscribe(p => {
      this.isCanDeactive = false;
      const country: Country = AppHelper.getRouteData();
      if (country && country.Code) {
        this.currentModifyItem.isModified = true;
        console.log(this.currentModifyItem, this.requestCode);
        if (this.requestCode === "issueNationality") {
          this.currentModifyItem.IssueCountry = country.Code;
        }
        if (this.requestCode === "identityNationality") {
          this.currentModifyItem.Country = country.Code;
        }
        AppHelper.setRouteData(null);
      }
    });
  }

  ngOnInit() {
    this.doRefresh();
    this.getIdentityTypes();
  }
  doRefresh() {
    this.getCredentials();
    if (this.refresher) {
      this.refresher.complete();
    }
  }
  compareFn(t1, t2) {
    return t1 == t2;
  }
  getIdentityTypes() {
    this.identityTypes = Object.keys(CredentialsType)
      .filter(k => +k)
      .map(k => {
        // console.dir(CredentialsType[k]);
        // console.log(
        //   `key=${k},value=${
        //     CredentialsType[k]
        //   },typeof k=${typeof k},typeof value=${typeof CredentialsType[k]}`
        // );
        return {
          key: k,
          value: CredentialsType[k]
        };
      });
    console.log(this.identityTypes);
  }
  ngAfterViewInit() {
    // console.log(this.formEle);
    this.initializeValidate();
    this.addForm.changes.subscribe(el => {
      // console.log(el);
      if (el.last) {
        this.initializeValidateAdd(el.last.el);
      }
    });
  }
  async removeExistCredential(c: Credentials) {
    const comfirmDel = await AppHelper.alert(
      LanguageHelper.getDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (comfirmDel) {
      const result = await this.tmcService
        .removeCredentials(c)
        .then(_ => true)
        .catch(e => {
          AppHelper.alert(e);
          return false;
        });
      if (result) {
        await this.getCredentials();
      }
    }
  }
  async saveModify(c: Credentials, el: HTMLElement) {
    const valid = await this.validateCredential(c, el);
    if (!valid) {
      return;
    }
    this.tmcService
      .modifyCredentials(c)
      .then(_ => {
        AppHelper.alert(LanguageHelper.getInfoModifySuccessTip());
      })
      .catch(e => {
        AppHelper.alert(e);
      });
  }
  initializeValidate() {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Modify",
      this.formEle.nativeElement
    );
  }
  async getCredentials() {
    this.loading = true;
    const credentials = await this.tmcService.getCredentials();
    this.credentials = credentials.map(c => {
      return {
        isModified: false,
        ...c,
        Birthday: c.Birthday.indexOf("T")
          ? moment(c.Birthday).format("YYYY-MM-DD")
          : c.Birthday,
        ExpirationDate: c.ExpirationDate.indexOf("T")
          ? moment(c.ExpirationDate).format("YYYY-MM-DD")
          : c.ExpirationDate
      };
    });
    this.loading = false;
    console.log("credentials", this.credentials);
  }
  addCredential() {
    const item: Credentials = {} as any;
    this.newCredentials.push(item);
  }
  initializeValidateAdd(el: HTMLFormElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
  }
  selectIdentityNationality(item: Credentials) {
    this.currentModifyItem = item;
    this.requestCode = "identityNationality";
    this.isCanDeactive = true;
    this.router.navigate([AppHelper.getRoutePath("select-country")], {
      queryParams: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectCountryTip()
      }
    });
  }
  selectIssueNationality(item: Credentials) {
    this.isCanDeactive = true;
    this.currentModifyItem = item;
    this.requestCode = "issueNationality";
    this.router.navigate([AppHelper.getRoutePath("select-country")], {
      queryParams: {
        requestCode: this.requestCode,
        title: LanguageHelper.getSelectIssueCountryTip()
      }
    });
  }
  removeAdd(c: Credentials) {
    AppHelper.alert(
      LanguageHelper.getDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    ).then(ok => {
      if (ok) {
        this.newCredentials = this.newCredentials.filter(it => it !== c);
      }
    });
  }
  async saveAdd(c: Credentials, container: HTMLElement) {
    const ok = await this.validateCredential(c, container);
    console.log("validateCredential", ok);
    if (ok) {
      const result = await this.tmcService
        .addCredentials(c)
        .then(_ => true)
        .catch(e => {
          AppHelper.alert(e);
          return false;
        });
      if (result) {
        this.newCredentials = this.newCredentials.filter(it => it !== c);
        console.log(this.newCredentials);
        await this.getCredentials();
      }
    }
  }
  dataModified(c: Credentials) {
    console.log("aaaaa");
    c.isModified = true;
  }
  async validateCredential(c: Credentials, container: HTMLElement) {
    if (!c) {
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
    if (!c.Gender) {
      return this.checkProperty(c, "Gender", rules, container);
    }
    if (!c.Type) {
      return this.checkProperty(c, "Type", rules, container);
    }
    if (!c.Number) {
      return this.checkProperty(c, "Number", rules, container);
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
    if (!c.Country) {
      return this.checkProperty(c, "Country", rules, container);
    }
    if (!c.IssueCountry) {
      return this.checkProperty(c, "IssueCountry", rules, container);
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
              }, 800);
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
  togleModify(item: Credentials) {
    this.currentModifyItem = item;
    this.isModify = !this.isModify;
    this.initializeValidate();
  }
  canDeactivate() {
    if (this.isCanDeactive) {
      return true;
    }
    if (
      (this.newCredentials && this.newCredentials.length) ||
      (this.credentials && this.credentials.some(ite => !!ite["isModified"]))
    ) {
      return AppHelper.alert(
        LanguageHelper.getModifyUnSavedTip(),
        true,
        LanguageHelper.getConfirmTip(),
        LanguageHelper.getCancelTip()
      );
    }
    return true;
  }
}
