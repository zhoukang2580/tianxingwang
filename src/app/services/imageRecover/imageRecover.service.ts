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
  private fetchingReq: Promise<any>;
  private identity: IdentityEntity;
  constructor(
    private apiService: ApiService,
    identityService: IdentityService
  ) {
    identityService.getIdentitySource().subscribe((identity) => {
      this.identity = identity;
      if (!identity || !identity.Ticket) {
        this.disposal();
      }
    });
  }
  disposal() {
    this.Failover = null;
  }

  private async load() {
    if (this.Failover) {
      return this.Failover;
    }
    if (this.fetchingReq) {
      return this.fetchingReq;
    }
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetImageRecoverAddress";
    req.Data = JSON.stringify({});
    this.fetchingReq = await this.apiService
      .getPromiseData<any>(req)
      .then((r) => {
        return r;
      })
      .finally(() => {
        this.fetchingReq = null;
      });
    return this.fetchingReq;
  }
  async recover(
    img: HTMLImageElement,
    onSuccess: (src: string) => void,
    onError: (failoverImage) => void
  ) {
    if (!this.Failover) {
      this.Failover = await this.load().catch((_) => null);
      if (!this.Failover) {
        onError(null);
        return;
      }
    }
    if (img) {
      img.onerror = () => {
        onError(this.Failover.DefaultUrl);
      };
      img.onload = () => {
        if (
          !img.src ||
          (this.Failover &&
            this.Failover.DefaultUrl &&
            this.getSrc(img.src).toLowerCase() ==
              this.getSrc(this.Failover.DefaultUrl).toLowerCase())
        ) {
          onError(this.Failover.DefaultUrl);
        } else {
          onSuccess(img.src);
        }
      };
    }
  }
  private getNode(url: string) {
    // 得到负载数据
    for (const node of this.Failover.Nodes) {
      if (url.indexOf(node.Url) > -1) {
        node.IsNormal = false;
        return node;
      }
    }
  }
  private getSrc(url: string) {
    if (url) {
      if (url.toLowerCase().includes("?")) {
        return url.substring(0, url.indexOf("?"));
      }
    }
    return url || "";
  }
  private replace(img: HTMLImageElement) {
    // 替换
    if (
      img.src &&
      this.Failover.DefaultUrl &&
      this.getSrc(img.src).toLowerCase() ==
        this.getSrc(this.Failover.DefaultUrl).toLowerCase()
    ) {
      return;
    }
    const date = new Date();
    const node = this.getNode(img.src);
    if (!node) {
      img.src = this.Failover.DefaultUrl + "?v=" + date;
      return;
    }
    let isRecover = false;
    for (const n of this.Failover.Nodes) {
      if (n.IsNormal == false || n.GroupName != node.GroupName) {
        continue;
      }
      const src = img.src.split("?")[0];
      img.src = src.replace(node.Url, n.Url) + "?v=" + date;
      isRecover = true;
      break;
    }
    if (!isRecover && this.Failover.DefaultUrl) {
      img.src = this.Failover.DefaultUrl + "?v=" + date;
    }
  }
}
