import {
  Country,
  SelectCountryModalComponent
} from "../../tmc/components/select-country/select-countrymodal.component";
import { LanguageHelper } from "./../../languageHelper";
import {
  IonRefresher,
  IonGrid,
  NavController,
  ModalController
} from "@ionic/angular";
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
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import * as moment from "moment";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { MemberCredential, MemberService } from "../member.service";
import { IdentityService } from "src/app/services/identity/identity.service";
@Component({
  selector: "app-member-credential-management",
  templateUrl: "./member-credential-management.page.html",
  styleUrls: ["./member-credential-management.page.scss"]
})
export class MemberCredentialManagementPage
  implements OnInit, AfterViewInit, CanComponentDeactivate {
  identityTypes: { key: string; value: string }[];
  credentials: MemberCredential[];
  newCredentials: MemberCredential[] = []; // 新增的证件
  loading = false;
  isCanDeactive = false;
  requestCode: "issueNationality" | "identityNationality";
  private currentModifyItem: MemberCredential;
  @ViewChild("f") formEle: ElementRef<HTMLFormElement>;
  @ViewChildren("modifyForm") modifyFormEles: QueryList<ElementRef<HTMLFormElement>>;
  @ViewChild(IonRefresher) refresher: IonRefresher;
  @ViewChildren("addForm") addForm: QueryList<IonGrid>;
  constructor(
    private router: Router,
    private validatorService: ValidatorService,
    private memberService: MemberService,
    private route: ActivatedRoute,
    private ngZone: NgZone,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private modalController: ModalController
  ) {
    route.queryParamMap.subscribe(p => {
      this.isCanDeactive = false;
    });
  }
  back() {
    this.navCtrl.back();
  }
  ngOnInit() {
    this.doRefresh();
    this.getIdentityTypes();
  }
  async doRefresh() {
    await this.getCredentials();
    if (this.refresher) {
      this.refresher.complete();
    }
    setTimeout(() => {
      this.initializeValidate();
    }, 1000);
  }
  compareFn(t1, t2) {
    return t1 == t2;
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
  ngAfterViewInit() {
    // console.log(this.formEle);
    this.initializeValidate();
    this.addForm.changes.subscribe(el => {
      // console.log(el);
      if (el.last) {
        this.initializeValidateAdd(el.last.el);
      }
    });
    this.modifyFormEles.changes.subscribe(_ => {
      if (this.modifyFormEles.last) {
        this.validatorService.initialize(
          "Beeant.Domain.Entities.Member.CredentialsEntity",
          "Modify",
          this.modifyFormEles.last.nativeElement
        );
      }
    })
  }
  async removeExistCredential(c: MemberCredential) {
    const comfirmDel = await AppHelper.alert(
      LanguageHelper.getConfirmDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (comfirmDel) {
      const result = await this.memberService
        .removeCredentials(c)
        .then(_ => true)
        .catch(e => {
          AppHelper.alert(e);
          return false;
        });
      // if (result) {
      // }
      await this.getCredentials();
    }
  }
  async saveModify(c: MemberCredential, el: HTMLElement) {
    const valid = await this.validateCredential(c, el);
    if (!valid) {
      return;
    }
    await this.memberService
      .modifyCredentials(c)
      .then(_ => {
        AppHelper.alert(LanguageHelper.getInfoModifySuccessTip());
      })
      .catch(e => {
        AppHelper.alert(e);
      });
    await this.getCredentials();
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
    const identity = await this.identityService.getIdentityAsync().catch(_ => null);
    if (!identity) {
      return this.credentials = [];
    }
    const credentials = await this.memberService.getCredentials(
      identity && identity.Id
    );
    this.credentials = credentials.map(c => {
      return {
        ...c,
        isModified: false,
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
    const item: MemberCredential = {
      Gender: "M",
      Type: CredentialsType.IdCard
    } as any;
    this.newCredentials.unshift(item);
  }
  initializeValidateAdd(el: HTMLFormElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
  }

  async selectIdentityNationality(item: MemberCredential) {
    this.currentModifyItem = item;
    this.requestCode = "identityNationality";
    this.isCanDeactive = true;
    await this.selectCountry();
  }
  async selectIssueNationality(item: MemberCredential) {
    this.isCanDeactive = true;
    this.currentModifyItem = item;
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
          this.currentModifyItem.IssueCountry = data.selectedItem.Code;
        }
        if (data.requestCode == "identityNationality") {
          this.currentModifyItem.Country = data.selectedItem.Code;
        }
      }
    }
  }
  removeAdd(c: MemberCredential) {
    AppHelper.alert(
      LanguageHelper.getConfirmDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    ).then(ok => {
      if (ok) {
        this.newCredentials = this.newCredentials.filter(it => it !== c);
      }
    });
  }
  async saveAdd(c: MemberCredential, container: HTMLElement) {
    const ok = await this.validateCredential(c, container);
    console.log("validateCredential", ok);
    if (ok) {
      const result = await this.memberService
        .addCredentials(c)
        .then(_ => true)
        .catch(e => {
          AppHelper.alert(e);
          return false;
        });
      if (result) {
        this.newCredentials = this.newCredentials.filter(it => it.Id !== c.Id);
        console.log(this.newCredentials);
      }
      await this.getCredentials();
    }
  }
  async validateCredential(c: MemberCredential, container: HTMLElement) {
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
    c.CheckFirstName = c.CheckFirstName || c.FirstName;
    if (!c.CheckFirstName) {
      return this.checkProperty(c, "CheckFirstName", rules, container);
    }
    c.CheckLastName = c.CheckLastName || c.LastName;
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
  togleModify(item: MemberCredential) {
    item.isModified = !item.isModified;
    this.currentModifyItem = item;
    setTimeout(() => {
      this.initializeValidate();
    }, 100);
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
