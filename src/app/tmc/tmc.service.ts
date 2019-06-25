import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject, of } from "rxjs";
import { Injectable } from "@angular/core";
interface Company {
  Id: string;
  Name: string;
}
export interface Credentials {
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
export class TmcService {
  private selectedCompanySource: BehaviorSubject<string>;
  private identity: IdentityEntity;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.selectedCompanySource = new BehaviorSubject(null);
    this.identityService.getIdentity().subscribe(identity => {
      this.identity = identity;
    });
  }
  getSelectedCompany() {
    return this.selectedCompanySource.asObservable();
  }
  setSelectedCompany(company: string) {
    this.selectedCompanySource.next(company);
  }
  getCompanies(): Promise<Company[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Tmc-GetIdentityCompany";
    req.Data = {};
    return this.apiService.getPromiseResponse<Company[]>(req).catch(_ => []);
  }
  getCredentials(): Promise<Credentials[]> {
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Credentials-List";
    req.Data = {
      accountId: (this.identity && this.identity.Id) || ""
    };
    return this.apiService
      .getPromiseResponse<{ Credentials: Credentials[] }>(req)
      .then(r => r.Credentials)
      .catch(_ => []);
  }
}
