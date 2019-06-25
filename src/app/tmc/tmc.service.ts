import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject, of } from "rxjs";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/operators";
import { Staff } from "./models/Staff";

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
  getCompanies() {
    const req = new RequestEntity();
    req.Method = "";
    return this.apiService.getPromiseResponse<any[]>(req).catch(_ => []);
  }
  getStaff(): Promise<Staff> {
    // 非agent(代理)
    if (
      this.identity &&
      this.identity.Numbers &&
      !this.identity.Numbers.AgentId &&
      this.identity.Numbers.TmcId
    ) {
      const req = new RequestEntity();
      req.Method = "TmcApiHomeUrl-Home-Staff";
      req.IsShowLoading = true;
      req.Data = {
        TmcId: this.identity.Numbers.TmcId
      };
      return this.apiService.getPromiseResponse<Staff[]>(req).catch(_ => null);
    } else {
      return Promise.resolve(null);
    }
  }
}
