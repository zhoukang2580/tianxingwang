import { HrService } from "../hr/staff.service";
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
  identityEntity: IdentityEntity;
  constructor(
    private identityService: IdentityService,
    private loginService: LoginService,
    private router: Router
  ) {
    this.identityService.getIdentity().subscribe(id => {
      this.identityEntity = id;
    });
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    |boolean|UrlTree|Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (
      this.identityEntity &&
      this.identityEntity.Numbers &&
      (this.identityEntity.Numbers.AgentId || this.identityEntity.Numbers.TmcId)
    ) {
      if (
        this.identityEntity.Numbers.AgentId &&
        !this.identityEntity.Numbers.TmcId
      ) {
        this.router.navigate([AppHelper.getRoutePath("select-customer")]);
        return false;
      }
      return true;
    }
    this.loginService.setToPageRouter(state.url);
    return false;
  }
}
