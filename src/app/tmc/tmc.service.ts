import { IdentityEntity } from "src/app/services/identity/identity.entity";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RequestEntity } from "src/app/services/api/Request.entity";
import { ApiService } from "src/app/services/api/api.service";
import { BehaviorSubject, of } from "rxjs";
import { Injectable } from "@angular/core";
import { MemberService } from "../member/member.service";
interface Company {
  Id: string;
  Name: string;
}

@Injectable({
  providedIn: "root"
})
export class TmcService {
  private selectedCompanySource: BehaviorSubject<string>;
  private companies: Company[];
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService,
    private memberService: MemberService
  ) {
    this.identityService.getIdentity().subscribe(id => {
      if (!id || !id.Ticket) {
        this.companies = null;
      }
    });
    this.selectedCompanySource = new BehaviorSubject(null);
  }
  getSelectedCompany() {
    return this.selectedCompanySource.asObservable();
  }
  setSelectedCompany(company: string) {
    this.selectedCompanySource.next(company);
  }
  async getCompanies(): Promise<Company[]> {
    if (this.companies && this.companies.length) {
      return Promise.resolve(this.companies);
    }
    const req = new RequestEntity();
    req.Method = "TmcApiHomeUrl-Tmc-GetIdentityCompany";
    req.Data = {};
    this.companies = await this.apiService
      .getPromiseData<Company[]>(req)
      .catch(_ => []);
    return this.companies;
  }
  async getCredentials() {
    const identity = await this.identityService.getIdentityAsync();
    return this.memberService.getCredentials(identity && identity.Id);
  }
}
