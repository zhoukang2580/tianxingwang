import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { CredentialsType } from "./pipe/credential.pipe";
import { AccountEntity } from "../account/models/AccountEntity";
import { Subject, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { ValidatorService } from "../services/validator/validator.service";
import { AppHelper } from "../appHelper";
import { LanguageHelper } from "../languageHelper";
import { Platform } from "@ionic/angular";
import * as moment from "moment";
// import { CalendarService } from "../tmc/calendar.service";
export const CHINESE_REG = /^[\u4e00-\u9fa5]+$/; // 只能输入中文
export const ENGLISH_SURNAME_REG = /^[A-Za-z]+$/; // 英文姓的正则，匹配由26个英文字母组成的字符串
export const ENGLISH_GIVEN_NAME_REG = /(^[A-Za-z]{1,}\s{0,}[A-Za-z]{1,}$)/; // 英文名的正则，匹配首尾空格的正则表达式
// 英文名的正则，匹配首尾空格的正则表达式
// tslint:disable-next-line: max-line-length
export const IDCARDRULE_REG = /(^$)|(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$)/;
export class MemberCredential {
  isAdd?: boolean;
  isLongPeriodOfTime?: boolean;
  isModified?: boolean;
  isNotWhiteList: boolean;
  variables: any;
  CredentialsRemark: any;
  Id: string; //
  TypeName: string; //
  AccountId: string; //
  Account: AccountEntity;
  /// <summary>
  /// 类型
  /// </summary>
  Type: CredentialsType; //
  Number: string; //
  HideNumber: string; //
  /// <summary>
  /// 姓
  /// </summary>
  Surname: string; //
  /// <summary>
  /// 名
  /// </summary>
  Givenname: string; //
  Name: string; //
  /// <summary>
  /// 登机名
  /// </summary>
  // CheckName: string; //
  /// <summary>
  /// 登机姓
  /// </summary>
  // CheckFirstName: string; //
  /// <summary>
  /// 登机名
  /// </summary>
  // CheckLastName: string; //
  /// <summary>
  /// 到期时间
  /// </summary>
  ExpirationDate: string; //
  /// <summary>
  /// 国家
  /// </summary>
  showCountry: {
    Code: string;
    Name: string;
  };
  Country: string;
  /// <summary>
  /// 发证国家
  /// </summary>
  IssueCountry: string;
  showIssueCountry: {
    Code: string;
    Name: string;
  };
  /// <summary>
  /// 出生日期
  /// </summary>
  Birthday: string; //
  /// <summary>
  /// 性别
  /// </summary>
  Gender: string; //
}
@Injectable({
  providedIn: "root",
})
export class MemberService {
  private credentialsChanges: Subject<{
    action: "remove" | "add" | "modify";
  }>;
  constructor(
    private apiService: ApiService,
    private validatorService: ValidatorService,
    private plt: Platform
  ) {
    this.credentialsChanges = new BehaviorSubject(undefined);
  }
  async getCredentials(accountId: string): Promise<MemberCredential[]> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId,
    };
    return this.apiService
      .getPromiseData<{ Credentials: MemberCredential[] }>(req)
      .then((r) => r.Credentials)
      .catch((_) => []);
  }
  getCredentialsChangeSource() {
    return this.credentialsChanges.asObservable().pipe(filter((it) => !!it));
  }
  addCredentials(c: MemberCredential) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Add";
    req.Data = c;
    return this.apiService.getPromiseData<string>(req).then((r) => {
      this.credentialsChanges.next({
        action: "add",
      });
      return r;
    });
  }
  modifyCredentials(c: MemberCredential) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Modify";
    req.Data = c;
    return this.apiService.getPromiseData<any>(req).then((r) => {
      this.credentialsChanges.next({
        action: "modify",
      });
      return r;
    });
  }
  removeCredentials(c: MemberCredential) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Remove";
    req.Data = c;
    return this.apiService.getPromiseData<any>(req).then((r) => {
      this.credentialsChanges.next({
        action: "remove",
      });
      return r;
    });
  }
  getMemberDetails() {
    const req = new RequestEntity();
    req.Method = "ApiMemberUrl-Home-Get";
    return this.apiService.getPromiseData<PageModel>(req);
  }
  initializeValidateAdd(el: HTMLElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Add",
      el
    );
  }
  initializeValidateModify(container: HTMLElement) {
    this.validatorService.initialize(
      "Beeant.Domain.Entities.Member.CredentialsEntity",
      "Modify",
      container
    );
  }
  async confirmTipMessage(c: MemberCredential) {
    c.Surname = c.Surname && c.Surname.toUpperCase();
    c.Givenname = c.Givenname && c.Givenname.toUpperCase();
    c.Number = c.Number && c.Number.toUpperCase();
    const ok = await AppHelper.alert(
      `请确认您的证件姓名：${c.Surname}/${c.Givenname},证件号码：${c.Number}`,
      true,
      LanguageHelper.getConfirmTip(),
      LanguageHelper.getCancelTip()
    );
    return ok;
  }
  idTypeChange(container: HTMLElement, credential: MemberCredential) {
    console.log("idTypeChange", credential);
    const surnameEl: HTMLInputElement = container.querySelector(
      "input[name='Surname']"
    );
    const givennameEl: HTMLInputElement = container.querySelector(
      "input[name='Givenname']"
    );
    const idInputEle: HTMLInputElement = container.querySelector(
      "input[name='Number']"
    );
    if (idInputEle) {
      setTimeout(() => {
        const value = idInputEle.value;
        if (value && credential) {
          if (credential.Type == CredentialsType.IdCard) {
            this.idNumberTip(idInputEle, credential);
          } else {
            this.addMessageTipEl(idInputEle, false, "");
          }
        }
        this.changeBirthByIdNumber(idInputEle.value, credential);
      }, 100);
    }
    if (credential) {
      setTimeout(() => {
        this.changeName(credential, surnameEl, givennameEl);
      }, 100);
    }
  }
  private idNumberTip(el: HTMLInputElement, credential: MemberCredential) {
    setTimeout(() => {
      const value = el.value;
      this.addMessageTipEl(
        el,
        !this.isIdNubmerValidate(value) &&
          credential.Type == CredentialsType.IdCard,
        "请填写正确的18位身份证号码"
      );
      this.changeBirthByIdNumber(el.value, credential);
    }, 100);
  }
  listenInputChange(container: HTMLElement, credential: MemberCredential) {
    const surnameEl: HTMLInputElement = container.querySelector(
      "input[name='Surname']"
    );
    const givennameEl: HTMLInputElement = container.querySelector(
      "input[name='Givenname']"
    );
    const idInputEle: HTMLInputElement = container.querySelector(
      "input[name='Number']"
    );
    if (idInputEle) {
      idInputEle.onfocus = () => {
        if (idInputEle.classList.contains("validctrlerror")) {
          idInputEle.value = "";
        }
      };
      idInputEle.oninput = () => {
        if (IDCARDRULE_REG.test(idInputEle.value)) {
          this.changeBirthByIdNumber(idInputEle.value, credential);
        }
      };
      idInputEle.onblur = () => {
        if (IDCARDRULE_REG.test(idInputEle.value)) {
          this.changeBirthByIdNumber(idInputEle.value, credential);
        }
        this.idNumberTip(idInputEle, credential);
      };
    }
    if (givennameEl) {
      givennameEl.onblur = () => {
        this.changeName(credential, surnameEl, givennameEl);
      };
    }
    if (surnameEl) {
      surnameEl.onblur = () => {
        this.changeName(credential, surnameEl, givennameEl);
      };
    }
  }
  private changeName(
    credential: MemberCredential,
    surnameEl: HTMLInputElement,
    givennameEl: HTMLInputElement
  ) {
    if (credential.Type == CredentialsType.IdCard) {
      this.addMessageTipEl(
        surnameEl,
        !CHINESE_REG.test(surnameEl && surnameEl.value),
        surnameEl.placeholder
      );
      this.addMessageTipEl(
        givennameEl,
        !CHINESE_REG.test(givennameEl && givennameEl.value),
        givennameEl.placeholder
      );
    } else {
      this.addMessageTipEl(
        surnameEl,
        CHINESE_REG.test(surnameEl.value) ||
          AppHelper.includeHanz(surnameEl.value),
        surnameEl.placeholder
      );
      this.addMessageTipEl(
        givennameEl,
        CHINESE_REG.test(givennameEl.value) ||
          AppHelper.includeHanz(givennameEl.value),
        givennameEl.placeholder
      );
    }
  }
  private addMessageTipEl(el: HTMLElement, isShow: boolean, msg = "") {
    if (!el) {
      return;
    }
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
  isIdNubmerValidate(id: string) {
    return IDCARDRULE_REG.test(id) && AppHelper.verifyIdNumber(id);
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
          `input[ValidateName='${pro}']`
        ) as HTMLInputElement;
        console.log(`input[ValidateName='${pro}']`, input);

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
  private getFormatedDate(d: string) {
    if (!d) {
      return d;
    }
    if (this.plt.is("ios")) {
      return d.replace(/-/g, "/");
    }
    return d;
  }
  async validateCredential(c: MemberCredential, container: HTMLElement) {
    if (!c) {
      return false;
    }
    if (c.isLongPeriodOfTime) {
      c.ExpirationDate = moment(c.Birthday)
        .add(100 * 365, "days")
        .format("YYYY-MM-DD");
      c.ExpirationDate = this.getFormatedDate(c.ExpirationDate);
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
    c.Surname = c.Surname.replace(/\s/g, "");
    c.Givenname = c.Givenname.trim();
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
    c.Birthday = moment(c.Birthday).format("YYYY-MM-DD");
    c.Birthday = this.getFormatedDate(c.Birthday);
    console.log(c.Birthday);
    if (!c.ExpirationDate) {
      return this.checkProperty(c, "ExpirationDate", rules, container);
    }
    c.ExpirationDate = moment(c.ExpirationDate).format("YYYY-MM-DD");
    c.ExpirationDate = this.getFormatedDate(c.ExpirationDate);
    if (!c.Country) {
      return this.checkProperty(c, "Country", rules, container);
    }
    if (!c.IssueCountry) {
      return this.checkProperty(c, "IssueCountry", rules, container);
    }

    return true;
  }
  private changeBirthByIdNumber(id: string, credential: MemberCredential) {
    requestAnimationFrame(() => {
      const value = (id || "").trim();
      if (value && credential) {
        if (credential.Type == CredentialsType.IdCard) {
          const b = this.getBirthByIdNumber(value);
          if (b) {
            const str = `${b.substr(0, 4)}-${b.substr(4, 2)}-${b.substr(6, 2)}`;
            credential.Birthday = this.getFormatedDate(str);
            console.log("b", b, " credential.Birthday " + credential.Birthday);
          } else {
            // one.Birthday = null;
          }
        }
      }
    });
  }
}
export interface PageModel {
  Name: string;
  RealName: string;
  Mobile: string;
  HeadUrl: string;
  StaffNumber: string;
  CostCenterName: string;
  CostCenterCode: string;
  OrganizationName: string;
  BookTypeName: string;
}
