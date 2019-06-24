import { AppHelper } from "src/app/appHelper";
import { IdentityService } from "src/app/services/identity/identity.service";
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
import { LoginService } from '../services/login/login.service';

@Injectable({
  providedIn: "root"
})
export class AgentGuard implements CanActivate, CanActivateChild {
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
    return this.identityService
      .getIdentity()
      .then(id => {
        if (id && id.Numbers.AgentId && !id.Numbers.TmcId) {
          this.loginService.setToPageRouter(state.url);
          this.router.navigate([AppHelper.getRoutePath("select-customer")]);
          return false;
        }
        return true;
      })
      .catch(_ => false);
  }
}
