import { NavController } from "@ionic/angular";
import { AppHelper } from "./../appHelper";
import { Router } from "@angular/router";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { Observable } from "rxjs";
import { constants } from "crypto";

@Injectable({
  providedIn: "root",
})
export class StylePageGuard implements CanActivate {
  constructor(private router: Router, private navCtrl: NavController) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    try {
      const style: string = AppHelper.getStyle();
      if (
        !style ||
        style.toLowerCase() == "cn" ||
        style.toLowerCase() == "zh_cn"
      ) {
        return true;
      }
      const routePath = this.getRoute(state.url);
      const segs = routePath.split("/");
      const styleRoute = `${this.getRoute(state.url)}_${style}`;
      if (segs.length > 1) {
        const route = this.router.config.find((it) => it.path == segs[0]);
        if (route && route.children) {
          const one = route.children.find(
            (it) => it.path.toLowerCase() == styleRoute.replace(`${segs[0]}/`,"").toLowerCase()
          );
          if (one) {
            this.router.navigate([styleRoute], {
              queryParams: next.queryParams,
            });
            return false;
          }
        }
      }
      if (this.router.config) {
        let find = this.router.config.find((it) => it.path == styleRoute);
        if (find) {
          this.router.navigate([styleRoute], {
            queryParams: next.queryParams,
          });
          return false;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  }
  private getRoute(url: string) {
    url = decodeURIComponent(url);
    url = url.startsWith("/") ? url.substring(1) : url;
    if (url.includes("?")) {
      url = url.substring(0, url.indexOf("?"));
    }
    return url;
  }
}
