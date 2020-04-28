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
import {
  MemberCredential,
  CHINESE_REG,
  ENGLISH_SURNAME_REG,
  ENGLISH_GIVEN_NAME_REG,
  MemberService,
} from "../../member.service";
import { CredentialsType } from "../../pipe/credential.pipe";
import {
  IonSelect,
  Platform,
  IonDatetime,
  ModalController,
} from "@ionic/angular";
import { Subscription, fromEvent, of } from "rxjs";
import { ValidatorService } from "src/app/services/validator/validator.service";
import { AppHelper } from "src/app/appHelper";
import { LanguageHelper } from "src/app/languageHelper";
import { CalendarService } from "src/app/tmc/calendar.service";
import { CountryEntity } from "src/app/tmc/models/CountryEntity";
import { SelectCountryModalComponent } from "src/app/tmc/components/select-country/select-countrymodal.component";
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
    private modalController: ModalController,
    private memberService: MemberService
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
        if (this.credential && this.credential.isAdd) {
          this.memberService.initializeValidateAdd(this.el.nativeElement);
        }
        if (this.credential && this.credential.isModified) {
          this.memberService.initializeValidateModify(container);
        }
        if (this.credential) {
          this.initInputChanges(container,this.credential);
        }
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

  private async confirmTipMessage(c: MemberCredential) {
    return this.memberService.confirmTipMessage(c);
  }
  async saveModify() {
    const c: MemberCredential = this.credential;
    const el: HTMLElement = this.el.nativeElement;
    const valid = await this.validateCredential(c, el);
    if (!valid) {
      return false;
    }
    const ok = await this.confirmTipMessage(c);
    if (!ok) {
      return false;
    }
    this.credential.isModified = true;
    this.credentialChange.emit(this.credential);
    return true;
  }
  private onNameChange(container: HTMLElement,credential:MemberCredential) {
    this.memberService.onNameChange(container, credential);
  }
  private addMessageTipEl(el: HTMLElement, isShow: boolean, msg = "") {
    this.memberService.addMessageTipEl(el, isShow, msg);
  }
  private changeBirthByIdNumber(
    container: HTMLElement,
    credential: MemberCredential
  ) {
    return this.memberService.changeBirthByIdNumber(container, credential);
  }
  private onIdNumberInputChange(
    container: HTMLElement
  ) {
    const idInputEle = container.querySelector(
      "input[name='Number']"
    ) as HTMLInputElement;
    if (!idInputEle) {
      return ;
    }
    idInputEle.onfocus = () => {
      if (idInputEle.classList.contains("validctrlerror")) {
        idInputEle.value = "";
      }
    };
    idInputEle.onblur = () => {
      setTimeout(() => {
        this.validateIdNumber(idInputEle,this.credential);
        this.onNameChange(container,this.credential);
        this.changeBirthByIdNumber(idInputEle, this.credential);
      }, 100);
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
  async saveAdd() {
    const c: MemberCredential = this.credential;
    const container: HTMLElement = this.el.nativeElement;
    let ok = await this.validateCredential(c, container);
    if (!ok) {
      return false;
    }
    ok = await this.confirmTipMessage(c);
    console.log("validateCredential", ok);
    if (!ok) {
      return false;
    }
    c.Id = "0";
    this.credential.isAdd = true;
    this.credentialChange.emit(c);
    return true;
  }
  async validateCredential(c: MemberCredential, container: HTMLElement) {
    if (!c) {
      return false;
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
      CHINESE_REG.test(c.Surname + c.Givenname)
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
    return this.memberService.isIdNubmerValidate(value);
  }
  private validateIdNumber(inputEl: HTMLInputElement,credential:MemberCredential) {
    if (
      inputEl &&
      credential &&
      credential.Type == CredentialsType.IdCard
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
          this.credential.IssueCountry = data.selectedItem.Code;
          this.credential.showIssueCountry = data.selectedItem;
        }
        if (data.requestCode == "identityNationality") {
          this.credential.Country = data.selectedItem.Code;
          this.credential.showCountry = data.selectedItem;
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
        if (value && this.credential) {
          this.credential.isLongPeriodOfTime = !true;
          this.credential.ExpirationDate = this.calendarService.getFormatedDate(
            value.substr(0, 10)
          );
          console.log(" ExpirationDate ", this.credential.ExpirationDate);
        }
        setTimeout(() => {
          sub.unsubscribe();
        }, 1000);
      });
    }
  }
  private initInputChanges(container: HTMLElement,credential:MemberCredential) {
   return this.memberService.initInputChanges(container,credential);
  }
  
  onSelectIdType(ele: IonSelect) {
    ele.open();
    ele.ionChange.subscribe((_) => {
      this.onIdTypeChange(this.el.nativeElement);
      this.onNameChange(this.el.nativeElement,this.credential);
      if (this.credential) {
        if (this.credential.Type != CredentialsType.IdCard) {
          this.credential.isLongPeriodOfTime = false;
          this.credential.longPeriodOfTime = "";
        }
      }
    });
  }

  onIdTypeChange(container: HTMLElement) {
    if (container) {
      this.changeBirthByIdNumber(container, this.credential);
      setTimeout(() => {
        this.onNameChange(container,this.credential);
      }, 200);
    }
  }
}
