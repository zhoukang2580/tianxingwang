import { Observable } from "rxjs";
import { IdentityService } from "./../identity/identity.service";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { of, throwError } from "rxjs";
import { finalize } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ImageRecoverService {
  Failover: any;
  imageRecover: any;
  private fetchingReq: {
    isFetching: boolean;
    promise: Promise<any>;
  } = {} as any;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    identityService.getIdentitySource().subscribe(identity => {
      if (!identity || !identity.Ticket) {
        this.disposal();
      }
    });
    this.get();
  }
  disposal() {
    this.Failover = null;
    this.imageRecover = null;
  }
  async initialize(container: HTMLElement) {
    if (!this.imageRecover) {
      this.imageRecover = await this.get().catch(_ => null);
      if (this.imageRecover) {
        this.imageRecover.Initialize(container);
      }
    } else {
      this.imageRecover.Initialize(container);
    }
  }
  get() {
    if (this.imageRecover) {
      return Promise.resolve(this.imageRecover);
    }
    if (this.fetchingReq.isFetching) {
      return this.fetchingReq.promise;
    }
    if (!this.identityService.getStatus()) {
      return Promise.resolve(null);
    }
    this.fetchingReq = {
      isFetching: true,
      promise: new Promise<any>((resolve, reject) => {
        const subscribtion = this.load()
          .pipe(
            finalize(() => {
              this.fetchingReq = null;
            })
          )
          .subscribe(
            r => {
              if (r && r.Status && r.Data && window["Winner"]) {
                this.Failover = r.Data;
                this.imageRecover = new window["Winner"].ImageRecover(r.Data);
                resolve(this.imageRecover);
              }
              reject("");
            },
            error => {
              reject(error);
            },
            () => {
              setTimeout(() => {
                if (subscribtion) {
                  subscribtion.unsubscribe();
                }
              }, 0);
            }
          );
      }).catch(() => null)
    };
    return this.fetchingReq.promise;
  }

  private load() {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetImageRecoverAddress";
    req.Data = JSON.stringify({});
    return this.apiService.getResponse<any>(req).pipe(
      finalize(() => {
        this.fetchingReq = {} as any;
      })
    );
  }
}
