import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { RequestEntity } from "../api/Request.entity";
import { IdentityService } from "../identity/identity.service";

@Injectable({
  providedIn: "root",
})
export class AuthorizeService {
  private fetchAuthority: { promise: Promise<{ [key: string]: any }> };
  private authorizes: { [key: string]: any };
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    this.identityService.getIdentitySource().subscribe(() => {
      this.authorizes = null;
    });
  }
  clearAuthorizes() {
    this.authorizes = null;
  }
  async loadSubsystems() {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Authorize-SubSystems";
    return this.apiService.getPromiseData<string[]>(req);
  }
  async getAuthorizes() {
    if (this.authorizes) {
      return this.authorizes;
    }
    return this.load();
  }
  async checkAuthority(authority: string) {
    if (!this.authorizes) {
      await this.load();
    }
    return !!(this.authorizes && this.authorizes[authority]);
  }
  private load() {
    if (this.fetchAuthority && this.fetchAuthority.promise) {
      return this.fetchAuthority.promise;
    }
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Authorize-Load";
    req.Data = {};
    this.fetchAuthority = {
      promise: this.apiService
        .getPromiseData<string[]>(req)
        .then((res) => {
          this.authorizes = res.reduce(
            (acc, it) => (acc = { ...acc, [it]: "true" }),
            {}
          );
          return this.authorizes;
        })
        .finally(() => {
          this.fetchAuthority = null;
        }),
    };
    return this.fetchAuthority.promise;
  }
}
