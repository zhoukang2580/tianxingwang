import { AppHelper } from "src/app/appHelper";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  UrlSegmentGroup,
  UrlSegment,
} from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ToDefaultRouteGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    const url = AppHelper.getNormalizedPath(state.url);
    console.log("to-default-route-guard url", url);
    const tree = this.router.parseUrl(state.url);
    const defaultUrlTree: UrlTree = {
      root: tree.root,
      queryParamMap: tree.queryParamMap,
      fragment: tree.fragment,
      queryParams: tree.queryParams,
    };
    defaultUrlTree.root.segments = [];
    defaultUrlTree.root.segments.push(
      new UrlSegment(url.substring(0, url.lastIndexOf("_")), {})
    );
    if (this.router.config.find((it) => it.path == `${url}`)) {
      return true;
    }
    // if (
    //   this.router.config.find(
    //     it => it.path == url.substring(0, url.lastIndexOf("_"))
    //   )
    // ) {
    //   return false;
    // }
    let idx = url.lastIndexOf("_");
    let defaultRoute = url.substring(0, idx);
    if (this.router.config.find((it) => it.path == `${defaultRoute}`)) {
      return true;
    }
    idx = state.url.includes("_")
      ? state.url.lastIndexOf("_")
      : state.url.length;
    defaultRoute = state.url.substring(0, idx);
    console.log(
      `path=${url}找不到，跳转到默认路由,defaultRoute=${defaultRoute}`
    );
    this.router.navigate([defaultRoute]);
    return false;
  }
}
