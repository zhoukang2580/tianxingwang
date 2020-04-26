import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from "@angular/core";
import { MemberCredential, MemberService } from "../../member.service";
import { CredentialsType } from "../../pipe/credential.pipe";
import {
  IonSelect,
  Platform,
  IonDatetime,
  ModalController,
} from "@ionic/angular";
import { Subscription, fromEvent } from "rxjs";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { CalendarService } from "src/app/tmc/calendar.service";
import { CountryEntity } from "src/app/tmc/models/CountryEntity";
import { SelectCountryModalComponent } from "src/app/tmc/components/select-country/select-countrymodal.component";
import { TmcService } from "src/app/tmc/tmc.service";
import { MyCalendarComponent } from "src/app/components/my-calendar/my-calendar.component";

@Component({
  selector: "app-credentials-comp",
  templateUrl: "./credentials.component.html",
  styleUrls: ["./credentials.component.scss"],
})
export class CredentialsComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription[] = [];
  private requestCode:
    | "issueNationality"
    | "identityNationality"
    | "birthDate"
    | "expireDate";
  @Input() credential: MemberCredential; // 新增的证件
  @Output() credentialChange: EventEmitter<MemberCredential>;
  CredentialsType = CredentialsType;
  identityTypes: { key: string; value: string }[];
  @ViewChild(IonDatetime) datetimeComp: IonDatetime;
  maxYear = new Date().getFullYear() + 80;
  constructor(
    private validatorService: ValidatorService,
    private el: ElementRef<HTMLElement>,
    private plt: Platform,
    private calendarService: CalendarService,
    private modalController: ModalController
  ) {
    this.credentialChange = new EventEmitter();
  }
  compareFn(t1, t2) {
    return t1 == t2;
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngAfterViewInit() {
    setTimeout(() => {
      const container = this.el.nativeElement;
      if (container) {
        this.validatorService.initialize(
          "Beeant.Domain.Entities.Member.CredentialsEntity",
          "Modify",
          container
        );
      }
    }, 200);
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
  ngOnInit() {
    this.getIdentityTypes();
  }
  private initializeValidateAdd(el: HTMLElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
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
  private initializeValidate() {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Modify",
      this.el.nativeElement
    );
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
    this.credential.isModified = true;
    this.credentialChange.emit(this.credential);
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
  private onNameChange() {
    const container: HTMLElement = this.el.nativeElement;
    const surnameEl: HTMLInputElement = container.querySelector(
      "input[name='Surname']"
    );
    const givennameEl: HTMLInputElement = container.querySelector(
      "input[name='Givenname']"
    );
    if (this.credential) {
      console.log(
        !AppHelper.includeHanz(surnameEl && surnameEl.value),
        surnameEl.value,
        surnameEl.placeholder,
        "222222222"
      );
      if (this.credential.Type == CredentialsType.IdCard) {
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
  private getBirthByIdNumber(idNumber: string = "") {
    if (idNumber && idNumber.length == 18) {
      return idNumber.substr(6, 8);
    }
    return "";
  }
  private changeBirthByIdNumber(idInputEle: HTMLInputElement) {
    if (!idInputEle) {
      return;
    }
    const value = idInputEle.value.trim();
    if (value) {
      const one = this.credential;
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
    idInputEle.onfocus = () => {
      if (idInputEle.classList.contains("validctrlerror")) {
        idInputEle.value = "";
      }
    };
    this.subscriptions.push(
      fromEvent(idInputEle, "blur").subscribe((evt) => {
        setTimeout(() => {
          this.validateIdNumber(idInputEle);
          this.onNameChange();
          this.changeBirthByIdNumber(idInputEle);
        }, 0);
      })
    );
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
    this.credentialChange.emit(c);
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
      return false;
    }
    if (!c.Birthday) {
      return this.checkProperty(c, "Birthday", rules, container);
    }
    c.Birthday = this.calendarService.getFormatedDate(c.Birthday);
    console.log(c.Birthday);
    if (!c.ExpirationDate) {
      return this.checkProperty(c, "ExpirationDate", rules, container);
    }
    c.ExpirationDate = this.calendarService.getFormatedDate(c.ExpirationDate);
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
  private isIdNubmerValidate(value: string) {
    if (!value) {
      return false;
    }
    return value.length == 18 && !AppHelper.includeHanz(value);
  }
  private validateIdNumber(inputEl: HTMLInputElement) {
    if (
      inputEl &&
      this.credential &&
      this.credential.Type == CredentialsType.IdCard
    ) {
      const value = inputEl.value;
      this.addMessageTipEl(
        inputEl,
        !this.isIdNubmerValidate(value),
        "请填写正确的18位身份证号码"
      );
    }
  }
  async onSelectBirthDate() {
    if (this.datetimeComp) {
      this.datetimeComp.value = "";
      this.datetimeComp.open();
      const sub = this.datetimeComp.ionChange.subscribe((d: CustomEvent) => {
        const value = d.detail.value;
        if (value) {
          this.credential.Birthday = this.calendarService.getFormatedDate(
            value.substr(0, 10)
          );
          console.log(" Birthday ", this.credential.Birthday);
        }
        setTimeout(() => {
          sub.unsubscribe();
        }, 100);
      });
    }
  }
  async selectIssueNationality(item: MemberCredential, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.credential = item;
    this.requestCode = "issueNationality";
    await this.selectCountry();
  }
  private async selectCountry() {
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
          this.credential.IssueCountry = data.selectedItem;
        }
        if (data.requestCode == "identityNationality") {
          this.credential.Country = data.selectedItem;
        }
      }
    }
  }
  async selectIdentityNationality(item: MemberCredential, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    this.credential = item;
    this.requestCode = "identityNationality";
    await this.selectCountry();
  }
  async onSelectExpireDate() {
    if (this.datetimeComp) {
      this.datetimeComp.value = "";
      this.datetimeComp.open();
      const sub = this.datetimeComp.ionChange.subscribe((d: CustomEvent) => {
        const value: string = d.detail.value;
        if (value) {
          this.credential.ExpirationDate = this.calendarService.getFormatedDate(
            value.substr(0, 10)
          );
          console.log(" ExpirationDate ", this.credential.ExpirationDate);
        }
        setTimeout(() => {
          sub.unsubscribe();
        }, 100);
      });
    }
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
      (container.querySelector("input[name='Surname']") as HTMLIonInputElement);
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
  onSelectIdType(ele: IonSelect) {
    ele.open();
    ele.ionChange.subscribe((_) => {
      this.onIdTypeChange();
      this.onNameChange();
      if (this.credential) {
        if (this.credential.Type != CredentialsType.IdCard) {
          this.credential.isLongPeriodOfTime = false;
          this.credential.longPeriodOfTime = "";
        }
      }
    });
  }

  onIdTypeChange() {
    if (this.el.nativeElement) {
      const idInputEle = this.el.nativeElement.querySelector(
        "input[name='Number']"
      ) as HTMLInputElement;
      this.changeBirthByIdNumber(idInputEle);
      setTimeout(() => {
        this.onNameChange();
      }, 200);
    }
  }
}
