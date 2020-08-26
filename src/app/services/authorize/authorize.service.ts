import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { RequestEntity } from "../api/Request.entity";
import { IdentityService } from "../identity/identity.service";

@Injectable({
  providedIn: "root",
})
export class AuthorizeService {
  private fetchAuthority: { promise: Promise<{ [key: string]: any }> };
  private loadSubsystemsPromise: Promise<string[]>;
  private subsystems: string[];
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
    if (this.subsystems && this.subsystems.length) {
      return this.subsystems;
    }
    if (this.loadSubsystemsPromise) {
      return this.loadSubsystemsPromise;
    }
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Authorize-SubSystems";
    this.loadSubsystemsPromise = this.apiService
      .getPromiseData<string[]>(req)
      .then((r) => {
        if (r && r.length) {
          this.subsystems = r;
        }
        return r;
      })
      .finally(() => {
        this.loadSubsystemsPromise = null;
      });
    return this.loadSubsystemsPromise;
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
