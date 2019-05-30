import { AppHelper } from "src/app/appHelper";
import { LoginService } from "./../services/login/login.service";
import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  CanLoad,
  Route,
  CanActivateChild,
  UrlTree
} from "@angular/router";
import { Observable, of } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import { AlertController, LoadingController } from "@ionic/angular";
import { finalize, switchMap, map } from "rxjs/operators";
import { LoginEntity } from '../services/login/login.entity';

@Injectable({
  providedIn: "root"
})
export class AuthorityGuard implements CanActivate, CanLoad, CanActivateChild {
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
  constructor(
    private identityService: IdentityService,
    private loginService: LoginService,
    private router: Router
  ) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    console.log("state", state, "next", next);
    const ticket = AppHelper.getTicket();
    if (ticket) {
      return true;
    }
    this.loginService.setToPageRouter(state.url);
    if (AppHelper.isWechatH5()) {
      const url = AppHelper.getApiUrl() + "/home/WechatLogin?domain=" + AppHelper.getDomain()
        + "&path=" + encodeURIComponent(AppHelper.getRedirectUrl() + "/www/index.html?path=" + (AppHelper.getQueryParamers().path || "") + "&unloginpath=login");
      window.location.href = url;
    }
    else if (AppHelper.isDingtalkH5()) {
      const url = AppHelper.getApiUrl() + "/home/DingtalkLogin?domain=" + AppHelper.getDomain()
        + "&path=" + encodeURIComponent(AppHelper.getRedirectUrl() + "/www/index.html?path=" + (AppHelper.getQueryParamers().path || "") + "&unloginpath=login");
      window.location.href = url;
    }
    this.router.navigate([AppHelper.getRoutePath("login")]);
  }
  // check() {
  //   //  return Promise.resolve(true);
  //   return this.loginService.checkIdentity().catch(() => false);
  // }

  canLoad(route: Route) {
    console.log("canload route ,", route);
    return true;
  }
}
