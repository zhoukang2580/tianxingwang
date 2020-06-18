import { Observable } from "rxjs";
import { IdentityService } from "./../identity/identity.service";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { of, throwError } from "rxjs";
import { finalize } from "rxjs/operators";
import { IdentityEntity } from "../identity/identity.entity";

@Injectable({
  providedIn: "root",
})
export class ImageRecoverService {
  Failover: any;
  imageRecover: any;
  private fetchingReq: Promise<any>;
  constructor(
    private apiService: ApiService,
    private identityService: IdentityService
  ) {
    identityService.getIdentitySource().subscribe((identity) => {
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
      this.imageRecover = await this.get().catch((_) => null);
      if (this.imageRecover) {
        this.imageRecover.Initialize(container);
      }
    } else {
      this.imageRecover.Initialize(container);
    }
  }
  async get() {
    if (this.imageRecover) {
      return this.imageRecover;
    }
    if (this.fetchingReq) {
      return this.fetchingReq;
    }
    const identity: IdentityEntity = await this.identityService
      .checkTicketAsync()
      .catch(() => null);
    if (!identity || !identity.Ticket || !identity.Id) {
      return Promise.resolve(null);
    }
    this.fetchingReq = new Promise<any>((resolve, reject) => {
      const subscribtion = this.load()
        .pipe(
          finalize(() => {
            this.fetchingReq = null;
          })
        )
        .subscribe(
          (r) => {
            if (r && r.Status && r.Data && window["Winner"]) {
              this.Failover = r.Data;
              this.imageRecover = new window["Winner"].ImageRecover(r.Data);
              resolve(this.imageRecover);
            }
            reject("");
          },
          (error) => {
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
    }).finally(() => (this.fetchingReq = null));
    return this.fetchingReq;
  }

  private load() {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetImageRecoverAddress";
    req.Data = JSON.stringify({});
    return this.apiService.getResponse<any>(req);
  }
}
