import { BackButtonComponent } from "./../../components/back-button/back-button.component";
import { Subscription } from "rxjs";
import { LanguageHelper } from "./../../languageHelper";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ViewChildren,
  QueryList,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AppHelper } from "src/app/appHelper";
import { CredentialsType } from "src/app/member/pipe/credential.pipe";
import { CanComponentDeactivate } from "src/app/guards/candeactivate.guard";
import { MemberCredential, MemberService } from "../member.service";
import { CredentialsComponent } from "../components/credentials/credentials.component";
import { Keyboard } from "@ionic-native/keyboard/ngx";
import { IonCheckbox } from "@ionic/angular";
import { HrService } from "src/app/hr/hr.service";
@Component({
  selector: "app-member-credential-management",
  templateUrl: "./member-credential-management.page.html",
  styleUrls: ["./member-credential-management.page.scss"],
})
export class MemberCredentialManagementPage
  implements OnInit, AfterViewInit, CanComponentDeactivate, OnDestroy {
  @ViewChild(CredentialsComponent) credentialsCom: CredentialsComponent;
  private subscriptions: Subscription[] = [];
  CredentialsType = CredentialsType;
  @ViewChild(BackButtonComponent) backBtn: BackButtonComponent;
  @ViewChild("checkboxs") checkboxs: IonCheckbox;
  // @ViewChild("checkboxs") checkboxs
  credentials: MemberCredential[];
  modifyCredential: MemberCredential; // 新增的证件
  loading = false;
  isCanDeactive = false;
  isModify = false;
  isKeyBoardShow = false;
  isShowAgreement = false;
  isFromConformCredentials = false;
  eyeOn = true;
  constructor(
    private memberService: MemberService,
    route: ActivatedRoute,
    private keyboard: Keyboard,
    private router: Router,
    private staffService: HrService
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
        if (p.get("data")) {
          this.modifyCredential = JSON.parse(p.get("data"));
          if (this.modifyCredential) {
            this.credentials = [this.modifyCredential];
          }
        }
        this.isFromConformCredentials =
          p.get("fromConformCredentials") == "true";
      })
    );
  }
  private back() {
    this.backBtn.popToPrePage();
  }

  private isAgreement() {
    if (!this.isShowAgreement) {
      return true;
    }
    const isTrue = this.checkboxs.checked
    if (!isTrue) {
      AppHelper.alert("请阅读并同意以下内容");
      return false;
    } else {
      return true;
    }
  }
  async onSaveCredential() {
    const isStatus = this.isAgreement();
    if (isStatus) {
      if (this.modifyCredential) {
        if (this.modifyCredential.isAdd) {
          await this.saveAdd(this.modifyCredential);
        } else {
          await this.saveModify(this.modifyCredential);
        }
      }
    }
  }
  async saveAdd(c: MemberCredential) {
    const ok = this.credentialsCom && (await this.credentialsCom.saveAdd());
    if (!ok) {
      return;
    }
    const result = await this.memberService
      .addCredentials(c)
      .then((id) => {
        this.modifyCredential.Id = id;
        return true;
      })
      .catch((e) => {
        AppHelper.alert(e);
        return false;
      });
    if (!result) {
      return;
    }
    this.modifyCredential.isAdd = false;
    this.modifyCredential.isModified = false;
    this.credentials = [this.modifyCredential];
    if (this.isFromConformCredentials) {
      this.router.navigate([AppHelper.getRoutePath("")]);
      return;
    }
    this.backBtn.popToPrePage();
  }
  async saveModify(c: MemberCredential) {
    const ok = this.credentialsCom && (await this.credentialsCom.saveModify());
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
    if (res) {
      this.modifyCredential.isAdd = false;
      this.modifyCredential.isModified = false;
      this.credentials = [this.modifyCredential];
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {
    this.staffService.isSelfBookType().then(iss => {
      this.isShowAgreement = iss;
    })
    this.keyboard.onKeyboardWillShow().subscribe(() => {
      this.isKeyBoardShow = true;
    });
    this.keyboard.onKeyboardWillHide().subscribe(() => {
      this.isKeyBoardShow = false;
    });
  }

  onRemoveCredential(c: MemberCredential) {
    if (c && c.isAdd) {
      this.removeAdd(c);
    } else {
      this.onRemoveExistCredential(c);
    }
  }

  ngAfterViewInit() { }
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
      IssueCountry: "CN",
      showIssueCountry: {
        Code: "CN",
        Name: "中国",
      },
      Country: "CN",
      showCountry: {
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
      this.credentials &&
      this.credentials.some((ite) => ite.isModified || ite.isAdd)
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
