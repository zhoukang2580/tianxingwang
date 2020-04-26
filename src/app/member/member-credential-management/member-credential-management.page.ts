import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { MyCalendarComponent } from "./../../components/my-calendar/my-calendar.component";
import { Subscription, fromEvent } from "rxjs";
import { SelectCountryModalComponent } from "../../tmc/components/select-country/select-countrymodal.component";
import { LanguageHelper } from "./../../languageHelper";
import {
  IonRefresher,
  IonGrid,
  NavController,
  ModalController,
  Platform,
  IonSelect,
  IonDatetime,
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
  OnDestroy,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { MemberCredential, MemberService } from "../member.service";
import { CalendarService } from "src/app/tmc/calendar.service";
import { TmcService } from "src/app/tmc/tmc.service";
import { CountryEntity } from "src/app/tmc/models/CountryEntity";
@Component({
  selector: "app-member-credential-management",
  templateUrl: "./member-credential-management.page.html",
  styleUrls: ["./member-credential-management.page.scss"],
})
export class MemberCredentialManagementPage
  implements OnInit, AfterViewInit, CanComponentDeactivate, OnDestroy {
  private timemoutid;
  private subscriptions: Subscription[] = [];
  private countries: CountryEntity[];
  private subscription = Subscription.EMPTY;
  private idInputEleSubscription = Subscription.EMPTY;
  maxYear = new Date().getFullYear() + 80;
  CredentialsType = CredentialsType;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild(IonDatetime) datetimeComp: IonDatetime;
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
  @ViewChild("form", { static: true }) formEle: ElementRef<HTMLFormElement>;
  @ViewChild("idInput") idInputEl: ElementRef<HTMLInputElement>;
  @ViewChildren("credentialItem") credentialItem: QueryList<
    ElementRef<HTMLElement>
  >;
  @ViewChildren("addForm") addFormEles: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private router: Router,
    private validatorService: ValidatorService,
    private memberService: MemberService,
    private calendarService: CalendarService,
    route: ActivatedRoute,
    private plt: Platform,
    private ngZone: NgZone,
    private modalController: ModalController,
    private tmcService: TmcService
  ) {
    this.subscriptions.push(
      route.queryParamMap.subscribe((p) => {
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
              this.modifyCredential.isLongPeriodOfTime = false;
              this.modifyCredential.longPeriodOfTime = "";
            }
            this.requestCode = null;
          }
        }
        if (p.get("data")) {
          this.credentials = [JSON.parse(p.get("data"))];
          if (this.credentials.length) {
            this.credentials = this.credentials.map((c) => {
              if (
                this.calendarService.getMoment(0, c.ExpirationDate).year() -
                  new Date().getFullYear() >=
                70
              ) {
                c.isLongPeriodOfTime = true;
                c.longPeriodOfTime = "长期有效";
              }
              return c;
            });
          }
        }
        if (p.get("addNew")) {
          const isAddNew = p.get("addNew") == "true";
          if (isAddNew) {
            this.onAddCredential();
          }
        }
      })
    );
  }
  private back() {
    this.backBtn.backToPrePage();
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    this.tmcService.getCountries().then((cs) => {
      this.countries = cs;
    });
    this.getIdentityTypes();
  }
  compareFn(t1, t2) {
    return t1 == t2;
  }
  private getIdentityTypes() {
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
  getCountryName(code: string) {
    const country =
      this.countries && this.countries.find((it) => it.Code == code);
    return country && country.Name;
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
      setTimeout(() => {
        this.onNameChange();
      }, 100);
    }
  }
  async onSaveCredential(c: MemberCredential) {
    if (c) {
      if (c.isAdd) {
        await this.saveAdd(
          c,
          this.addFormEles &&
            this.addFormEles.last &&
            this.addFormEles.last.nativeElement
        );
      } else {
        await this.saveModify(
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
      this.onRemoveExistCredential(c);
    }
  }
  onSelectIdType(ele: IonSelect) {
    // console.log(ele);
    this.subscription.unsubscribe();
    ele.open();
    this.subscription = ele.ionChange.subscribe((_) => {
      this.onIdTypeChange();
      this.onNameChange();
      if (this.modifyCredential) {
        if (this.modifyCredential.Type != CredentialsType.IdCard) {
          this.modifyCredential.isLongPeriodOfTime = false;
          this.modifyCredential.longPeriodOfTime = "";
        }
      }
    });
    this.subscriptions.push(this.subscription);
  }
  private async onSelectDate() {
    let d: { date: string };
    const m = await this.modalController.create({
      component: MyCalendarComponent,
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
    // this.isCanDeactive = true;
    // const path = this.getCurUrl();
    // this.requestCode = "birthDate";
    // this.router.navigate(["open-my-calendar"], {
    //   queryParams: { backRouteUrl: path }
    // });
    if (this.datetimeComp) {
      this.datetimeComp.value = "";
      this.datetimeComp.open();
      const sub = this.datetimeComp.ionChange.subscribe((d: CustomEvent) => {
        const value = d.detail.value;
        if (value) {
          this.modifyCredential.Birthday = this.calendarService.getFormatedDate(
            value.substr(0, 10)
          );
          console.log(" Birthday ", this.modifyCredential.Birthday);
        }
        setTimeout(() => {
          sub.unsubscribe();
        }, 100);
      });
    }
  }
  async onSelectExpireDate() {
    if (this.datetimeComp) {
      this.datetimeComp.value = "";
      this.datetimeComp.open();
      const sub = this.datetimeComp.ionChange.subscribe((d: CustomEvent) => {
        const value: string = d.detail.value;
        if (value) {
          this.modifyCredential.ExpirationDate = this.calendarService.getFormatedDate(
            value.substr(0, 10)
          );
          console.log(" ExpirationDate ", this.modifyCredential.ExpirationDate);
        }
        setTimeout(() => {
          sub.unsubscribe();
        }, 100);
      });
    }
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
    this.idInputEleSubscription.unsubscribe();
    idInputEle.onfocus = () => {
      if (idInputEle.classList.contains("validctrlerror")) {
        idInputEle.value = "";
      }
    };
    this.idInputEleSubscription = fromEvent(idInputEle, "blur").subscribe(
      (evt) => {
        setTimeout(() => {
          this.validateIdNumber(idInputEle);
          this.onNameChange();
          this.changeBirthByIdNumber(idInputEle);
        }, 0);
      }
    );
    this.subscriptions.push(this.idInputEleSubscription);
  }
  private isIdNubmerValidate(value: string) {
    if (!value) {
      return false;
    }
    return value.length == 18 && !AppHelper.includeHanz(value);
  }
  private validateIdNumber(inputEl: HTMLInputElement) {
    if (
      inputEl &&
      this.modifyCredential &&
      this.modifyCredential.Type == CredentialsType.IdCard
    ) {
      const value = inputEl.value;
      this.addMessageTipEl(
        inputEl,
        !this.isIdNubmerValidate(value),
        "请填写正确的18位身份证号码"
      );
    }
  }
  private onNameChange() {
    let container: HTMLElement = this.formEle && this.formEle.nativeElement;
    if (this.modifyCredential) {
      container =
        this.addFormEles &&
        this.addFormEles.last &&
        this.addFormEles.last.nativeElement;
    }
    const surnameEl: HTMLInputElement = container.querySelector(
      "input[name='Surname']"
    );
    const givennameEl: HTMLInputElement = container.querySelector(
      "input[name='Givenname']"
    );
    if (this.modifyCredential) {
      console.log(
        !AppHelper.includeHanz(surnameEl && surnameEl.value),
        surnameEl.value,
        surnameEl.placeholder,
        "222222222"
      );
      if (this.modifyCredential.Type == CredentialsType.IdCard) {
        this.addMessageTipEl(
          surnameEl,
          !AppHelper.includeHanz(surnameEl && surnameEl.value),
          surnameEl.placeholder
        );
        this.addMessageTipEl(
          givennameEl,
          !AppHelper.includeHanz(givennameEl && givennameEl.value),
          givennameEl.placeholder
        );
      } else {
        this.addMessageTipEl(
          surnameEl,
          AppHelper.includeHanz(surnameEl && surnameEl.value),
          surnameEl.placeholder
        );
        this.addMessageTipEl(
          givennameEl,
          AppHelper.includeHanz(givennameEl && givennameEl.value),
          givennameEl.placeholder
        );
      }
    }
  }
  private addMessageTipEl(el: HTMLElement, isShow: boolean, msg = "") {
    requestAnimationFrame(() => {
      let errorTipEl = el.parentElement.querySelector(".idnumbervalidate");
      if (!errorTipEl) {
        errorTipEl = document.createElement("span");
        errorTipEl.classList.add("idnumbervalidate");
        el.insertAdjacentElement("afterend", errorTipEl);
      }
      if (isShow) {
        el.classList.remove("validctrlsucess");
        el.classList.add("validctrlerror");
        errorTipEl.classList.remove("validsucessmess");
        errorTipEl.classList.add("validerrormess");
        errorTipEl.textContent = msg;
      } else {
        el.classList.remove("validctrlerror");
        errorTipEl.textContent = "";
        errorTipEl.classList.remove("validerrormess");
        errorTipEl.classList.add("validsucessmess");
      }
    });
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
    const inputSurnameEle =
      container &&
      (container.querySelector(
        "input[name='Surname']"
      ) as HTMLIonInputElement);
    const inputGivennameEle =
      container &&
      (container.querySelector(
        "input[name='Givenname']"
      ) as HTMLIonInputElement);
    if (credential) {
      if (inputSurnameEle) {
        inputSurnameEle.oninput = (_) => {
          // credential.CheckFirstName = inputFirstNameEle.value as string;
          this.onNameChange();
        };
        inputSurnameEle.onblur = () => {
          this.onNameChange();
        };
      }
      if (inputGivennameEle) {
        inputGivennameEle.oninput = (_) => {
          // credential.CheckLastName = inputLastNameEle.value as string;
          this.onNameChange();
        };
        inputGivennameEle.onblur = () => {
          this.onNameChange();
        };
      }
    }
  }
  private focusout() {
    // 软键盘关闭事件
    if (this.timemoutid) {
      clearTimeout(this.timemoutid);
    }
    this.timemoutid = setTimeout(function () {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
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
    setTimeout(() => {
      if (this.modifyCredential) {
        const one = this.modifyCredential;
        this.initInputChanges(this.addFormEles.last.nativeElement, one);
      }
      this.initializeValidate();
    }, 1000);
    const sub = this.addFormEles.changes.subscribe((_) => {
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
            (it) => it.Id == this.modifyCredential.Id
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
  async onRemoveExistCredential(c: MemberCredential) {
    const comfirmDel = await AppHelper.alert(
      LanguageHelper.getConfirmDeleteTip(),
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    if (comfirmDel) {
      const result = await this.memberService
        .removeCredentials(c)
        .then((_) => true)
        .catch((e) => {
          AppHelper.alert(e);
          return false;
        });
      if (result) {
        this.back();
      }
    }
  }
  private async confirmTipMessage(c: MemberCredential) {
    c.Surname = c.Surname && c.Surname.toUpperCase();
    c.Givenname = c.Givenname && c.Givenname.toUpperCase();
    // c.CheckFirstName = c.CheckFirstName && c.CheckFirstName.toUpperCase();
    // c.CheckLastName = c.CheckLastName && c.CheckLastName.toUpperCase();
    c.Number = c.Number && c.Number.toUpperCase();
    const ok = await AppHelper.alert(
      `请确认您的证件姓名：${c.Surname}${c.Givenname},证件号码：${c.Number}`,
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    return ok;
  }
  async saveModify(c: MemberCredential, el: HTMLElement) {
    const valid = await this.validateCredential(c, el);
    if (!valid) {
      return;
    }
    const ok = await this.confirmTipMessage(c);
    if (!ok) {
      return;
    }
    const res = await this.memberService
      .modifyCredentials(c)
      .then((_) => {
        if (_.Message) {
          AppHelper.alert(_.Message);
        }
        return true;
      })
      .catch((e) => {
        AppHelper.alert(e);
      });
    this.modifyCredential = null;
    if (res) {
      this.isCanDeactive = true;
      this.back();
    }
  }
  private initializeValidate() {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Modify",
      this.formEle.nativeElement
    );
  }

  async onAddCredential() {
    const item: MemberCredential = {
      Gender: "M",
      Type: CredentialsType.IdCard,
      Id: AppHelper.uuid(),
      isAdd: true,
      IssueCountry: "CN",
      Country: "CN",
    } as MemberCredential;
    if (this.modifyCredential) {
      const ok = await AppHelper.alert("放弃当前修改？", true, "确定", "取消");
      if (!ok) {
        return;
      }
    }
    this.modifyCredential = item;
  }
  private initializeValidateAdd(el: HTMLElement) {
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
  onSetLongTime(c: MemberCredential, evt: CustomEvent) {
    evt.stopPropagation();
    c.isLongPeriodOfTime = true;
    c.longPeriodOfTime = "长期有效";
    c.ExpirationDate = this.calendarService.getFormatedDate(
      this.calendarService.getMoment(100 * 365, c.Birthday).format("YYYY-MM-DD")
    );
  }
  async saveAdd(c: MemberCredential, container: HTMLElement) {
    let ok = await this.validateCredential(c, container);
    if (!ok) {
      return;
    }
    ok = await this.confirmTipMessage(c);
    console.log("validateCredential", ok);
    if (!ok) {
      return;
    }
    c.Id = "0";
    const result = await this.memberService
      .addCredentials(c)
      .then((_) => true)
      .catch((e) => {
        AppHelper.alert(e);
        return false;
      });
    if (!result) {
      return;
    }
    this.modifyCredential = null;
    this.isCanDeactive = true;
    this.back();
  }
  async validateCredential(c: MemberCredential, container: HTMLElement) {
    if (!c) {
      return Promise.resolve(false);
    }

    const info = await this.validatorService
      .get("Beeant.Domain.Entities.Member.CredentialsEntity", "Add")
      .catch((e) => {
        AppHelper.alert(e);
        return { rule: [] };
      });
    console.log(info);
    if (!info || !info.rule) {
      AppHelper.alert(LanguageHelper.getValidateRulesEmptyTip());
      return true;
    }
    const rules = info.rule;
    if (!c.Surname) {
      return this.checkProperty(c, "Surname", rules, container);
    }
    if (!c.Givenname) {
      return this.checkProperty(c, "Givenname", rules, container);
    }
    if (
      c.Type != CredentialsType.IdCard &&
      AppHelper.includeHanz(c.Surname + c.Givenname)
    ) {
      AppHelper.alert("证件姓名，请输入英文或者拼音");
      return false;
    }
    if (!c.Gender) {
      return this.checkProperty(c, "Gender", rules, container);
    }
    if (!c.Type) {
      return this.checkProperty(c, "Type", rules, container);
    }
    if (!c.Number) {
      return this.checkProperty(c, "Number", rules, container);
    } else if (
      c.Type == CredentialsType.IdCard &&
      !this.isIdNubmerValidate(c.Number)
    ) {
      AppHelper.alert("请输入正确的18位身份证号");
      if (this.idInputEl && this.idInputEl.nativeElement) {
        this.idInputEl.nativeElement.focus();
        requestAnimationFrame(() => {
          this.idInputEl.nativeElement.blur();
        });
      }
      return false;
    }
    if (!c.Birthday) {
      return this.checkProperty(c, "Birthday", rules, container);
    }
    this.ngZone.runOutsideAngular(() => {
      c.Birthday = this.calendarService.getFormatedDate(c.Birthday);
    });
    console.log(c.Birthday);
    if (!c.ExpirationDate) {
      return this.checkProperty(c, "ExpirationDate", rules, container);
    }
    this.ngZone.runOutsideAngular(() => {
      c.ExpirationDate = this.calendarService.getFormatedDate(c.ExpirationDate);
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
          (it) => it.Name.toLowerCase() == pro.toLowerCase()
        );
        const input = container.querySelector(
          `input[ValidateName=${pro}]`
        ) as HTMLInputElement;
        console.log(`input[ValidateName=${pro}]`, input);

        if (rule) {
          AppHelper.alert(rule.Message, true).then((_) => {
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
  onTogleModify(item: MemberCredential) {
    item.isModified = !item.isModified;
    this.modifyCredential = { ...item };
    if (this.credentials) {
      this.credentials = this.credentials.map((it) => {
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
      (this.credentials && this.credentials.some((ite) => !!ite["isModified"]))
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
  private loadCountries() {}
}
