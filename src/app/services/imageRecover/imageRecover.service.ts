import { IdentityService } from "./../identity/identity.service";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";

@Injectable({
  providedIn: "root"
})
export class ImageRecoverService {
  Failover: any;
  imageRecover: any;
  constructor(
    private apiService: ApiService,
    identityService: IdentityService
  ) {
    identityService.getIdentity().subscribe(identity => {
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
  initialize(container: HTMLElement) {
    if (!this.imageRecover) {
      this.get().then(r => {
        this.imageRecover.Initialize(container);
      });
    } else {
      this.imageRecover.Initialize(container);
    }
  }
  get() {
    if (this.imageRecover) {
      return Promise.resolve(this.imageRecover);
    }
    return new Promise<any>((resolve, reject) => {
      const subscribtion = this.load().subscribe(
        r => {
          if (r.Status && r.Data) {
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
    }).catch(() => null);
  }

  load() {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetImageRecoverAddress";
    req.Data = JSON.stringify({});
    return this.apiService.getResponse<any>(req);
  }
}
