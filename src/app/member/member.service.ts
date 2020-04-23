import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { CredentialsType } from "./pipe/credential.pipe";
import { AccountEntity } from "../account/models/AccountEntity";
import { Subject, BehaviorSubject } from "rxjs";
import { filter } from "rxjs/operators";
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
  Country: any; //
  /// <summary>
  /// 发证国家
  /// </summary>
  IssueCountry: any; //
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
  constructor(private apiService: ApiService) {
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
