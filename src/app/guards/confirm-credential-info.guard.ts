import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanActivateChild,
  UrlTree
} from "@angular/router";
import { Observable } from "rxjs";
import { StaffService } from "../hr/staff.service";
import { AppHelper } from "../appHelper";

@Injectable({
  providedIn: "root"
})
export class ConfirmCredentialInfoGuard
  implements CanActivate, CanActivateChild {
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
  constructor(private staffService: StaffService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.staffService
      .getStaff()
      .then(staff => {
        console.log("ConfirmCredentialInfoGuard",staff);
        if (
          staff &&
          staff.IsConfirmInfo != undefined &&
          staff.IsModifyPassword != undefined
        ) {
          if (staff.IsConfirmInfo && staff.IsModifyPassword) {
            return true;
          }
          this.router.navigate([AppHelper.getRoutePath("confirm-information")]);
          return false;
        }
        return true;
      })
      .catch(_ => {
        console.log("ConfirmCredentialInfoGuard",_);
        return true;
      });
  }
}
