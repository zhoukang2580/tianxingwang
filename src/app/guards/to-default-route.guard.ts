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
    if (this.router.config.find((it) => it.path == `${url}`)) {
      return true;
    }
    const defaultR = this.getDefaultRoute(url, state.url);
    if (defaultR) {
      this.router.navigate([defaultR]);
      return false;
    }
    return true;
  }
  private getDefaultRoute(styledRoute: string, toRuote: string) {
    const idx = styledRoute.lastIndexOf("_");
    const defaultRoute = styledRoute.substring(0, idx);
    if (
      defaultRoute &&
      this.router.config.find((it) => it.path == `${defaultRoute}`)
    ) {
      this.router.navigate([defaultRoute]);
      return false;
    }
    return defaultRoute;
  }
}
