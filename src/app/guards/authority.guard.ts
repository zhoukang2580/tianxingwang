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
import { finalize } from "rxjs/operators";

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
    return this.check()
      .then(r => {
        if (r) {
          return true;
        }
        // console.log("需要登录");
        this.loginService.setToPageRouter(state.url);
        this.router.navigate([AppHelper.getRoutePath("login")]);
        return false;
      })
      .catch((err) => {
        // console.error(err);
        this.router.navigate([AppHelper.getRoutePath("login")])
        return false;
      });
  }
  check() {
    //  return Promise.resolve(true);
    return this.loginService.checkIdentity().catch(() => false);
  }

  canLoad(route: Route) {
    console.log("canload route ,", route);
    return true;
  }
}
