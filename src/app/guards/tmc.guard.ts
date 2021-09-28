import { HrService } from "../hr/hr.service";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  CanActivateChild,
} from "@angular/router";
import { Observable } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import { AppHelper } from "../appHelper";
import { LoginService } from "../services/login/login.service";
import { IdentityEntity } from "../services/identity/identity.entity";
import { TmcService } from "../tmc/tmc.service";

@Injectable({
  providedIn: "root",
})
export class TmcGuard implements CanActivate, CanActivateChild {
  constructor(
    private identityService: IdentityService,
    private loginService: LoginService,
    private router: Router,
    private tmcService: TmcService
  ) {}
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | boolean
    | UrlTree
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    // if (!this.identityService.getStatus()) {
    //   return true;
    // }
    return this.identityService
      .getIdentityAsync()
      .then((identity) => {
        console.log("tmc guard identity ", identity);
        if (
          !identity ||
          !identity.Id ||
          !identity.Ticket ||
          !identity.Numbers ||
          !identity.Numbers.HrId
        ) {
          this.router.navigate([AppHelper.getRoutePath("home")]);
          return false;
        }
        if (AppHelper.isDingtalkH5()) {
          const query = AppHelper.getQueryParamers();
          const tmcid = query.tmcid || query.TmcId || "";
          if (!tmcid) {
            this.router.navigate([AppHelper.getRoutePath("login")]).then(() => {
              AppHelper.alert("钉钉未绑定客户！");
            });
            return false;
          }
          if (this.tmcService.isAgent) {
            this.router.navigate([AppHelper.getRoutePath("login")]).then(() => {
              AppHelper.alert("仅允许绑定钉钉的客户下的员工登录");
            });
            return false;
          }
          if (identity && identity.Id && identity.Ticket && identity.Numbers) {
            if (identity.Numbers.TmcId) {
              if (tmcid != identity.Numbers.TmcId) {
                this.router
                  .navigate([AppHelper.getRoutePath("login")])
                  .then(() => {
                    AppHelper.alert("非法登录");
                  });
                return false;
              }
            }
          }
        }

        if (
          identity &&
          identity.Numbers &&
          (identity.Numbers.AgentId || identity.Numbers.TmcId)
        ) {
          if (identity.Numbers.AgentId && !identity.Numbers.TmcId) {
            this.router.navigate([AppHelper.getRoutePath("select-customer")]);
            return false;
          }
          return true;
        }
        AppHelper.setToPageAfterAuthorize({
          path: state.url,
          queryParams: next.queryParams,
        });
        this.router.navigate([AppHelper.getRoutePath("login")]);
        return false;
      })
      .catch((_) => false);
  }
}
