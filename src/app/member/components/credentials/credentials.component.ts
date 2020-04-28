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
          this.initInputChanges(container, this.credential);
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
    const valid = await this.memberService.validateCredential(c, el);
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
    let ok = await this.memberService.validateCredential(c, container);
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
  private initInputChanges(
    container: HTMLElement,
    credential: MemberCredential
  ) {
    return this.memberService.initInputChanges(container, credential);
  }

  onSelectIdType(ele: IonSelect) {
    ele.open();
    ele.ionChange.subscribe((_) => {
      this.onIdTypeChange(this.el.nativeElement);
      this.memberService.onNameChange(this.el.nativeElement, this.credential);
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
      this.memberService.changeBirthByIdNumber(container, this.credential);
      setTimeout(() => {
        this.memberService.onNameChange(container, this.credential);
      }, 200);
    }
  }
}
