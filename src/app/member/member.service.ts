import { ApiService } from "./../services/api/api.service";
import { Injectable } from "@angular/core";
import { RequestEntity } from "../services/api/Request.entity";
export interface MemberCredentials {
  isModified?: boolean;
  Id: string; //
  AccountId: string; //
  /// <summary>
  /// 类型
  /// </summary>
  Type: string; //
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
  Country: string; //
  /// <summary>
  /// 发证国家
  /// </summary>
  IssueCountry: string; //
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
  constructor(private apiService: ApiService) {}
  async getCredentials(accountId: string): Promise<MemberCredentials[]> {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId
    };
    return this.apiService
      .getResponseAsync<{ Credentials: MemberCredentials[] }>(req)
      .then(r => r.Credentials)
      .catch(_ => []);
  }
  addCredentials(c: MemberCredentials) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Add";
    req.Data = c;
    return this.apiService.getResponseAsync<any>(req);
  }
  modifyCredentials(c: MemberCredentials) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Modify";
    req.Data = c;
    return this.apiService.getResponseAsync<any>(req);
  }
  removeCredentials(c: MemberCredentials) {
    const req = new RequestEntity();
    req.IsShowLoading = true;
    req.Method = "TmcApiHomeUrl-Credentials-Remove";
    req.Data = c;
    return this.apiService.getResponseAsync<any>(req);
  }
}
