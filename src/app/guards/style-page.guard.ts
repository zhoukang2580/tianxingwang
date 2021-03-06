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
import { CONFIG } from "../config";

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
      const style: string = AppHelper.getStyle() || CONFIG.defaultStyle;
      const styleRoute = `${this.getRoute(state.url.split("_")[0])}_${style}`;
      console.log("styleroute", styleRoute);

      // if (
      //   !style ||
      //   style.toLowerCase() == "cn" ||
      //   style.toLowerCase() == "zh_cn"
      // ) {
      //   styleRoute = `${this.getRoute(state.url)}`;
      //   console.log("styleRoute ", styleRoute);
      //   this.router.navigate([styleRoute], {
      //     queryParams: next.queryParams,
      //   });
      //   return false;
      // }
      const routePath = this.getRoute(state.url);
      const segs = routePath.split("/");
      if (segs.length > 1) {
        const route = this.router.config.find((it) => it.path == segs[0]);
        if (route && route.children) {
          const one = route.children.find(
            (it) =>
              it.path.toLowerCase() ==
              styleRoute.replace(`${segs[0]}/`, "").toLowerCase()
          );
          if (one) {
            const flag =
              AppHelper.getNormalizedPath(styleRoute) ==
              AppHelper.getNormalizedPath(state.url);
            if (flag) {
              return flag;
            }
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
          if (
            AppHelper.getNormalizedPath(styleRoute) ==
            AppHelper.getNormalizedPath(state.url)
          ) {
            return true;
          }
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
