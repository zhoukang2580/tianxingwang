import { HrService } from "./../hr/hr.service";
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

@Injectable({
  providedIn: "root"
})
export class TmcGuard implements CanActivate, CanActivateChild {
  constructor(
    private identityService: IdentityService,
    private router: Router,
    private hrService: HrService
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
    return this.hrService
      .getStaff()
      .then(s => {
        console.log("tmc guard staff ", s);
        if (s) {
          if (!s.IsConfirmInfo || !s.IsModifyPassword) {
            this.router.navigate([
              AppHelper.getRoutePath("comfirm-information")
            ]);
            return false;
          }
          return true;
        }
        return true;
      })
      .catch(_ => true);
  }
}
