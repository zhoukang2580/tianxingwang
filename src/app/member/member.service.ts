import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { CredentialsType } from "./pipe/credential.pipe";
import { AccountEntity } from "../account/models/AccountEntity";
import { Subject, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
import { ValidatorService } from "../services/validator/validator.service";
export const CHINESE_REG = /^[\u4e00-\u9fa5]+$/; // 只能输入中文
export const ENGLISH_SURNAME_REG = /^[A-Za-z]+$/; // 英文姓的正则，匹配由26个英文字母组成的字符串
export const ENGLISH_GIVEN_NAME_REG = /(^[A-Za-z]{1,}\s{0,}[A-Za-z]{1,}$)/; // 英文名的正则，匹配首尾空格的正则表达式
// 英文名的正则，匹配首尾空格的正则表达式
// tslint:disable-next-line: max-line-length
export const IDCARDRULE_REG = /(^$)|(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$)/;
export class MemberCredential {
  isAdd?: boolean;
  isLongPeriodOfTime?: boolean;
  longPeriodOfTime?: string;
  isModified?: boolean;
  isNotWhiteList: boolean;
  variables: any;
  CredentialsRemark: any;
  Id: string; //
  AccountId: string; //
  Account: AccountEntity;
  /// <summary>
  /// 类型
  /// </summary>
  Type: CredentialsType; //
  Number: string; //
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
    private validatorService: ValidatorService
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
    return this.apiService.getPromiseData<any>(req).then((r) => {
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
   getBirthByIdNumber(idNumber: string = "") {
    if (idNumber && idNumber.length == 18) {
      return idNumber.substr(6, 8);
    }
    return "";
  }
   changeBirthByIdNumber(
    container: HTMLElement,
    credential: MemberCredential
  ) {
    const idInputEle =
      container &&
      (container.querySelector("input[name='Number']") as HTMLInputElement);
    if (!idInputEle) {
      return;
    }
    const value = idInputEle.value.trim();
    if (value && credential) {
      if (credential.Type == CredentialsType.IdCard) {
        const b = this.getBirthByIdNumber(value);
        if (b) {
          const str = `${b.substr(0, 4)}-${b.substr(4, 2)}-${b.substr(6, 2)}`;
          credential.Birthday = this.plt.is("ios")
            ? str.replace(/-/g, "/")
            : str;
        } else {
          // one.Birthday = null;
        }
      }
    }
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
