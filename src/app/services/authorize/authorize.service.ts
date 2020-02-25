import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { RequestEntity } from "../api/Request.entity";

@Injectable({
  providedIn: "root"
})
export class AuthorizeService {
  private fetchAuthority: { promise: Promise<string[]> };
  private authorizes: string[];
  constructor(private apiService: ApiService) {}
  clearAuthorizes() {
    this.authorizes = null;
  }
  async getAuthorizes() {
    if (this.authorizes && this.authorizes.length) {
      return Promise.resolve(this.authorizes);
    }
    return this.load();
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
        .then(res => {
          this.authorizes = res;
          return res;
        })
        .finally(() => {
          this.fetchAuthority = null;
        })
    };
    return this.fetchAuthority.promise;
  }
}
