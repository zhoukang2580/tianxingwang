import { LoginEntity } from "../login/login.entity";
import { ConfigEntity} from "./config.entity";
import { BaseRequest } from "../api/BaseRequest";
import { ApiService } from "../api/api.service";
import { Injectable } from "@angular/core";
import { BehaviorSubject, from, of } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { switchMap, tap, map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private router: ConfigEntity;

  constructor(private apiService: ApiService) {
    this.router = new ConfigEntity();
    this.router.Status = false;
  }

  get(): Promise<ConfigEntity> {
    if (this.router.Status) {
      return Promise.resolve(this.router);
    }
    return new Promise((resolve, reject) => {
      this.load().subscribe(
        router => {
          resolve(router);
        },
        error => {
          reject(error);
        }
      );
    });
  }
  load() {
    if (this.router.Status) {
      return of(this.router);
    }
    const data = { domain: AppHelper.getDomain() };
    return this.apiService
      .send<{
        DefaultImageUrl?: string;
        FaviconImageUrl?: string;
        PrerenderImageUrl?: string;
        LogoImageUrl?: string;
        Icp?: string;
        Style?: string;
      }>("ApiHomeUrl-Router-Get", data)
      .pipe(
        map(r => {
          this.router.Status = true;
          if (r.Data) {
            this.router.DefaultImageUrl = r.Data.DefaultImageUrl;
            this.router.FaviconImageUrl = r.Data.FaviconImageUrl;
            this.router.PrerenderImageUrl = r.Data.PrerenderImageUrl;
            this.router.LogoImageUrl = r.Data.LogoImageUrl;
            this.router.Icp = r.Data.Icp;
            this.router.Style = r.Data.Style;
          }
          return this.router;
        })
      );
  }
}
