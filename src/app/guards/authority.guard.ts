import { IdentityEntity } from "./../services/identity/identity.entity";
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
import { finalize, switchMap, map, catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AuthorityGuard implements CanActivate, CanLoad, CanActivateChild {
  // private identity: IdentityEntity;
  constructor(
    private identityService: IdentityService,
    private loginService: LoginService,
    private router: Router
  ) {
  }
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
    // console.log("state", state, "next", next);
    // const ticket = AppHelper.getTicket();
    // if (ticket) {
    //   return true;
    // }
    // if (!this.identity || !this.identity.Ticket) {
    //   this.loginService.setToPageRouter(state.url);
    //   this.router.navigate([AppHelper.getRoutePath("login")]);
    //   return false;
    // }
    // return true;
    return this.identityService.getIdentity().pipe(
      catchError(e => of(null)),
      map((identity: IdentityEntity) => {
        // console.log("canload route ,", route);
        if (!identity || !identity.Ticket) {
          this.loginService.setToPageRouter(state.url);
          this.router.navigate([AppHelper.getRoutePath("login")]);
          return false;
        }
        return true;
      })
    );
  }
  canLoad(route: Route) {
    // console.log("canload route ,", route);
    return true;
  }
}
