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
  private subscriptions: Subscription[] = [];
  CredentialsType = CredentialsType;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  credentials: MemberCredential[];
  modifyCredential: MemberCredential; // 新增的证件
  loading = false;
  isCanDeactive = false;
  isModify = false;
  constructor(
    private memberService: MemberService,
    route: ActivatedRoute,
    private modalController: ModalController
  ) {
    this.subscriptions.push(
      route.queryParamMap.subscribe((p) => {
        this.isCanDeactive = false;
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
  async onSaveCredential() {
    if (this.modifyCredential) {
      if (this.modifyCredential.isAdd) {
        await this.saveAdd(this.modifyCredential);
      } else {
        await this.saveModify(this.modifyCredential);
      }
    }
  }
  async saveAdd(c: MemberCredential) {
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
  }
  async saveModify(c: MemberCredential) {
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
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {}

  onRemoveCredential(c: MemberCredential) {
    if (c && c.isAdd) {
      this.removeAdd(c);
    } else {
      this.onRemoveExistCredential(c);
    }
  }

  
  ngAfterViewInit() {}
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

  async onAddCredential() {
    const item: MemberCredential = {
      Gender: "M",
      Type: CredentialsType.IdCard,
      Id: AppHelper.uuid(),
      isAdd: true,
      IssueCountry: {
        Code: "CN",
        Name: "中国",
      },
      Country: {
        Code: "CN",
        Name: "中国",
      },
    } as MemberCredential;
    if (this.modifyCredential) {
      const ok = await AppHelper.alert("放弃当前修改？", true, "确定", "取消");
      if (!ok) {
        return;
      }
    }
    this.modifyCredential = item;
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

  onTogleModify(item: MemberCredential) {
    item.isModified = !item.isModified;
    this.modifyCredential = { ...item };
    if (this.credentials) {
      this.credentials = this.credentials.map((it) => {
        it.isModified = it.Id == item.Id;
        return it;
      });
    }
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
