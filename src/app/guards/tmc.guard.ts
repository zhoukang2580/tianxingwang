import { StaffService } from "../hr/staff.service";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  CanActivateChild
} from "@angular/router";
import { Observable } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import { AppHelper } from "../appHelper";
import { LoginService } from "../services/login/login.service";
import { IdentityEntity } from "../services/identity/identity.entity";

@Injectable({
  providedIn: "root"
})
export class TmcGuard implements CanActivate, CanActivateChild {
  constructor(
    private identityService: IdentityService,
    private loginService: LoginService,
    private router: Router
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
    if (!this.identityService.getStatus()) {
      return true;
    }
    return this.identityService
      .getIdentityAsync()
      .then(identity => {
        console.log("tmc guard", identity);
        if (
          identity &&
          identity.Numbers &&
          (identity.Numbers.AgentId || identity.Numbers.TmcId)
        ) {
          if (identity.Numbers.AgentId && !identity.Numbers.TmcId) {
            this.router.navigate([AppHelper.getRoutePath("select-customer")]);
            return false;
          }
          if (
            identity &&
            identity.Id &&
            (!identity.Numbers || !identity.Numbers.HrId)
          ) {
            this.router.navigate([AppHelper.getRoutePath("home")]);
            return false;
          }
          return true;
        }
        this.loginService.setToPageRouter(state.url);
        this.router.navigate([AppHelper.getRoutePath("login")]);
        return false;
      })
      .catch(_ => false);
  }
}
