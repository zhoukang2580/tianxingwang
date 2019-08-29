import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
import { CredentialsType } from "./pipe/credential.pipe";
import { AccountEntity } from "../tmc/models/AccountEntity";
export class MemberCredential {
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
  FirstName: string; //
  /// <summary>
  /// 名
  /// </summary>
  LastName: string; //
  /// <summary>
  /// 登机名
  /// </summary>
  CheckName: string; //
  /// <summary>
  /// 登机姓
  /// </summary>
  CheckFirstName: string; //
  /// <summary>
  /// 登机名
  /// </summary>
  CheckLastName: string; //
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
  providedIn: "root"
})
export class MemberService {
  memberDetail: PageModel;
  constructor(private apiService: ApiService) {}
  async getCredentials(accountId: string): Promise<MemberCredential[]> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId
    };
    return this.apiService
      .getPromiseData<{ Credentials: MemberCredential[] }>(req)
      .then(r => r.Credentials)
      .catch(_ => []);
  }
  addCredentials(c: MemberCredential) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Add";
    req.Data = c;
    return this.apiService.getPromiseData<any>(req);
  }
  modifyCredentials(c: MemberCredential) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Modify";
    req.Data = c;
    return this.apiService.getPromiseData<any>(req);
  }
  removeCredentials(c: MemberCredential) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Remove";
    req.Data = c;
    return this.apiService.getPromiseData<any>(req);
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
