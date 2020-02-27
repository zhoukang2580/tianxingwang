import { MyCalendarComponent } from "./../../components/my-calendar/my-calendar.component";
import { Subscription, fromEvent } from "rxjs";
import {
  Country,
  SelectCountryModalComponent
} from "../../tmc/components/select-country/select-countrymodal.component";
import { LanguageHelper } from "./../../languageHelper";
import {
  IonRefresher,
  IonGrid,
  NavController,
  ModalController,
  Platform,
  IonSelect
} from "@ionic/angular";
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  NgZone,
  OnDestroy
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import * as moment from "moment";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { MemberCredential, MemberService } from "../member.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RefresherComponent } from "src/app/components/refresher";
@Component({
  selector: "app-member-credential-management",
  templateUrl: "./member-credential-management.page.html",
  styleUrls: ["./member-credential-management.page.scss"]
})
export class MemberCredentialManagementPage
  implements OnInit, AfterViewInit, CanComponentDeactivate, OnDestroy {
  private timemoutid;
  private subscriptions: Subscription[] = [];
  private subscription = Subscription.EMPTY;
  identityTypes: { key: string; value: string }[];
  credentials: MemberCredential[];
  modifyCredential: MemberCredential; // 新增的证件
  loading = false;
  isCanDeactive = false;
  requestCode:
    | "issueNationality"
    | "identityNationality"
    | "birthDate"
    | "expireDate";
  isModify = false;
  @ViewChild("form") formEle: ElementRef<HTMLFormElement>;
  @ViewChildren("credentialItem") credentialItem: QueryList<
    ElementRef<HTMLElement>
  >;
  @ViewChild(RefresherComponent)
  refresher: RefresherComponent;
  @ViewChildren("addForm") addFormEles: QueryList<ElementRef<HTMLElement>>;
  constructor(
    private router: Router,
    private validatorService: ValidatorService,
    private memberService: MemberService,
    route: ActivatedRoute,
    private plt: Platform,
    private ngZone: NgZone,
    private identityService: IdentityService,
    private navCtrl: NavController,
    private modalController: ModalController
  ) {
    route.queryParamMap.subscribe(p => {
      this.isCanDeactive = false;
      if (this.modifyCredential) {
        if (p.get("date")) {
          let date: string = p.get("date");
          date = date.replace(/-/g, "/");
          if (this.requestCode == "birthDate") {
            this.modifyCredential.Birthday = date;
          }
          if (this.requestCode == "expireDate") {
            this.modifyCredential.ExpirationDate = date;
          }
          this.requestCode = null;
        }
      }
    });
  }
  back() {
    this.navCtrl.back();
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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
  onIdTypeChange() {
    if (
      this.addFormEles &&
      this.addFormEles.last &&
      this.addFormEles.last.nativeElement
    ) {
      const idInputEle = this.addFormEles.last.nativeElement.querySelector(
        "input[name='Number']"
      ) as HTMLInputElement;
      this.changeBirthByIdNumber(idInputEle);
    }
  }
  async onSaveCredential(c: MemberCredential) {
    if (c) {
      if (c.isAdd) {
        this.saveAdd(
          c,
          this.addFormEles &&
            this.addFormEles.last &&
            this.addFormEles.last.nativeElement
        );
      } else {
        this.saveModify(
          c,
          this.addFormEles &&
            this.addFormEles.last &&
            this.addFormEles.last.nativeElement
        );
      }
    }
  }
  onRemoveCredential(c: MemberCredential) {
    if (c && c.isAdd) {
      this.removeAdd(c);
    } else {
      this.removeExistCredential(c);
    }
  }
  onSelectIdType(ele: IonSelect) {
    // console.log(ele);
    this.subscription.unsubscribe();
    ele.open();
    this.subscription = ele.ionChange.subscribe(_ => {
      this.onIdTypeChange();
    });
    this.subscriptions.push(this.subscription);
  }
  private async onSelectDate() {
    let d: { date: string };
    const m = await this.modalController.create({
      component: MyCalendarComponent
    });
    m.present();
    const data = await m.onDidDismiss();
    if (data && data.data) {
      d = data.data;
    }
    return d;
  }
  async onSelectBirthDate() {
    // const d = await this.onSelectDate();
    // if (d) {
    //   this.modifyCredential.Birthday = d.date;
    // }
    this.isCanDeactive = true;
    const path = this.getCurUrl();
    this.requestCode = "birthDate";
    this.router.navigate(["open-my-calendar"], {
      queryParams: { backRouteUrl: path }
    });
  }
  async onSelectExpireDate() {
    // const d = await this.onSelectDate();
    // if (d) {
    //   this.modifyCredential.ExpirationDate = d.date;
    // }
    this.isCanDeactive = true;
    const path = this.getCurUrl();
    this.requestCode = "expireDate";
    this.router.navigate(["open-my-calendar"], {
      queryParams: { backRouteUrl: path }
    });
  }
  private getCurUrl() {
    const path = this.router.url.includes("#")
      ? this.router.url.substr(0, this.router.url.indexOf("#"))
      : this.router.url;
    return path;
  }
  private changeBirthByIdNumber(idInputEle: HTMLInputElement) {
    if (!idInputEle) {
      return;
    }
    const value = idInputEle.value.trim();
    if (value) {
      const one = this.modifyCredential;
      if (one && one.Type == CredentialsType.IdCard) {
        const b = this.getBirthByIdNumber(value);
        if (b) {
          const str = `${b.substr(0, 4)}-${b.substr(4, 2)}-${b.substr(6, 2)}`;
          one.Birthday = this.plt.is("ios") ? str.replace(/-/g, "/") : str;
        } else {
          // one.Birthday = null;
        }
      }
    }
  }
  private onIdNumberInputChange(idInputEle: HTMLInputElement) {
    if (!idInputEle) {
      return;
    }
    const sub0 = fromEvent(idInputEle, "blur").subscribe(evt => {
      this.changeBirthByIdNumber(idInputEle);
    });
    this.subscriptions.push(sub0);
  }
  private initInputChanges(
    container: HTMLElement,
    credential: MemberCredential
  ) {
    console.log("newCredentials 找到当前要修改的某个", credential);
    const idInputEle =
      container &&
      (container.querySelector("input[name='Number']") as HTMLInputElement);
    this.onIdNumberInputChange(idInputEle);
    const inputFirstNameEle =
      container &&
      (container.querySelector(
        "input[name='FirstName']"
      ) as HTMLIonInputElement);
    const inputLastNameEle =
      container &&
      (container.querySelector(
        "input[name='LastName']"
      ) as HTMLIonInputElement);
    if (credential) {
      if (inputFirstNameEle) {
        inputFirstNameEle.oninput = _ => {
          credential.CheckFirstName = inputFirstNameEle.value as string;
        };
      }
      if (inputLastNameEle) {
        inputLastNameEle.oninput = _ => {
          credential.CheckLastName = inputLastNameEle.value as string;
        };
      }
    }
  }
  private focusout() {
    // 软键盘关闭事件
    if (this.timemoutid) {
      clearTimeout(this.timemoutid);
    }
    this.timemoutid = setTimeout(function() {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
      }); // =======当键盘收起的时候让页面回到原始位置
    }, 200);
  }
  private focusin() {
    // 软键盘弹起事件
    if (this.timemoutid) {
      clearTimeout(this.timemoutid);
    }
  }
  private getBirthByIdNumber(idNumber: string = "") {
    if (idNumber && idNumber.length == 18) {
      return idNumber.substr(6, 8);
    }
    return "";
  }
  ngAfterViewInit() {
    // console.log(this.formEle);
    this.initializeValidate();
    const sub = this.addFormEles.changes.subscribe(_ => {
      // console.log(el);
      if (this.addFormEles.last && this.addFormEles.last.nativeElement) {
        if (this.modifyCredential) {
          const one = this.modifyCredential;
          this.initInputChanges(this.addFormEles.last.nativeElement, one);
        }
        this.initializeValidateAdd(this.addFormEles.last.nativeElement);
      }
    });
    this.subscriptions.push(sub);
    setTimeout(() => {
      const container = this.formEle.nativeElement;
      if (container) {
        if (this.credentials && this.modifyCredential) {
          const one = this.credentials.find(
            it => it.Id == this.modifyCredential.Id
          );
          this.initInputChanges(container.nativeElement, one);
        }
        this.validatorService.initialize(
          "Beeant.Domain.Entities.Member.CredentialsEntity",
          "Modify",
          container.nativeElement
        );
      }
    }, 200);
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
  private async tipMessage(c: MemberCredential) {
    c.FirstName = c.FirstName && c.FirstName.toUpperCase();
    c.LastName = c.LastName && c.LastName.toUpperCase();
    c.CheckFirstName = c.CheckFirstName && c.CheckFirstName.toUpperCase();
    c.CheckLastName = c.CheckLastName && c.CheckLastName.toUpperCase();
    c.Number = c.Number && c.Number.toUpperCase();
    const ok = await AppHelper.alert(
      `请确认您的证件姓名：${c.FirstName}${c.LastName},您的登机名：${c.CheckFirstName}${c.CheckLastName},证件号码：${c.Number}`,
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    return ok;
  }
  async saveModify(c: MemberCredential, el: HTMLElement) {
    const valid = await this.validateCredential(c, el);
    const ok = await this.tipMessage(c);
    if (!valid) {
      return;
    }
    if (!ok) {
      return;
    }
    await this.memberService
      .modifyCredentials(c)
      .then(_ => {
        if (_.Message) {
          AppHelper.alert(_.Message);
        }
        return true;
      })
      .catch(e => {
        AppHelper.alert(e);
      });
    await this.getCredentials();
    this.modifyCredential = null;
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
    const identity = await this.identityService
      .getIdentityAsync()
      .catch(_ => null);
    if (!identity) {
      return (this.credentials = []);
    }
    const credentials = await this.memberService.getCredentials(
      identity && identity.Id
    );
    this.credentials = credentials.map(c => {
      return {
        ...c,
        isModified: false,
        Birthday: c.Birthday.indexOf("T")
          ? moment(c.Birthday).format("YYYY/MM/DD")
          : c.Birthday,
        ExpirationDate: c.ExpirationDate.indexOf("T")
          ? moment(c.ExpirationDate).format("YYYY/MM/DD")
          : c.ExpirationDate
      };
    });
    this.loading = false;
    console.log("credentials", this.credentials);
  }
  async onAddCredential() {
    const item: MemberCredential = {
      Gender: "M",
      Type: CredentialsType.IdCard,
      Id: AppHelper.uuid(),
      isAdd: true
    } as any;
    if (this.modifyCredential) {
      const ok = await AppHelper.alert("放弃当前修改？", true, "确定", "取消");
      if (!ok) {
        return;
      }
    }
    this.modifyCredential = item;
  }
  initializeValidateAdd(el: HTMLElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
  }

  async selectIdentityNationality(item: MemberCredential, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.modifyCredential = item;
    this.requestCode = "identityNationality";
    this.isCanDeactive = true;
    await this.selectCountry();
  }
  async selectIssueNationality(item: MemberCredential, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.isCanDeactive = true;
    this.modifyCredential = item;
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
          this.modifyCredential.IssueCountry = data.selectedItem.Code;
        }
        if (data.requestCode == "identityNationality") {
          this.modifyCredential.Country = data.selectedItem.Code;
        }
      }
    }
  }
  async removeAdd(c: MemberCredential) {
    const ok = await AppHelper.alert(
      LanguageHelper.getConfirmDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (ok) {
      this.modifyCredential = null;
    }
  }
  async saveAdd(c: MemberCredential, container: HTMLElement) {
    let ok = await this.validateCredential(c, container);
    if (!ok) {
      return;
    }
    ok = await this.tipMessage(c);
    console.log("validateCredential", ok);
    if (!ok) {
      return;
    }
    c.Id = "0";
    const result = await this.memberService
      .addCredentials(c)
      .then(_ => true)
      .catch(e => {
        AppHelper.alert(e);
        return false;
      });
    if (!result) {
      return;
    }
    await this.getCredentials();
    this.modifyCredential = null;
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
      c.Birthday = moment(c.Birthday).format("YYYY/MM/DD");
    });
    console.log(c.Birthday);
    if (!c.ExpirationDate) {
      return this.checkProperty(c, "ExpirationDate", rules, container);
    }
    this.ngZone.runOutsideAngular(() => {
      c.ExpirationDate = moment(c.ExpirationDate).format("YYYY/MM/DD");
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
    this.modifyCredential = { ...item };
    if (this.credentials) {
      this.credentials = this.credentials.map(it => {
        it.isModified = it.Id == item.Id;
        return it;
      });
    }
    setTimeout(() => {
      this.initializeValidate();
    }, 100);
  }
  canDeactivate() {
    if (this.isCanDeactive) {
      return true;
    }
    if (
      this.modifyCredential ||
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
