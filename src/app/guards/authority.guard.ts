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
import {
  AlertController,
  LoadingController,
  ModalController
} from "@ionic/angular";
import { finalize, switchMap, map, catchError } from "rxjs/operators";
import { LoginSkeletonPageComponent } from "../components/login-skeleton-page/login-skeleton-page.component";

@Injectable({
  providedIn: "root"
})
export class AuthorityGuard implements CanActivate, CanLoad, CanActivateChild {
  // private identity: IdentityEntity;
  private isShowModel = false;
  constructor(
    private identityService: IdentityService,
    private loginService: LoginService,
    private router: Router,
    private modalCtrl: ModalController
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
    if (!this.isShowModel) {
      return this.modalCtrl
        .create({ component: LoginSkeletonPageComponent })
        .then(async m => {
          m.backdropDismiss = false;
          this.isShowModel = await m
            .present()
            .then(_ => true)
            .catch(_ => true);
          let dismissed = false;
          const timeoutid = setTimeout(() => {
            if (!dismissed) {
              m.dismiss()
                .then(_ => {
                  dismissed = true;
                })
                .catch(_ => {});
            }
          }, 5000);
          // const identity = await this.identityService.getIdentityAsync();
          if (timeoutid) {
            clearTimeout(timeoutid);
          }
          if (!dismissed) {
            m.dismiss()
              .then(_ => {
                dismissed = true;
              })
              .catch(_ => {});
          }
          // if (!identity || !identity.Ticket || !identity.Id) {
          //   this.loginService.setToPageRouter(state.url);
          //   this.router.navigate([AppHelper.getRoutePath("login")]);
          //   return false;
          // }
          if (!this.identityService.getStatus()) {
            this.loginService.setToPageRouter(state.url);
            this.router.navigate([AppHelper.getRoutePath("login")]);
            return false;
          }
          return true;
        })
        .catch(_ => {
          return false;
        });
    }
    if (!this.identityService.getStatus()) {
      console.log("authority state.url",state.url);
      this.loginService.setToPageRouter(state.url);
      this.router.navigate([AppHelper.getRoutePath("login")]);
      return false;
    }
    return true;
  }
  canLoad(route: Route) {
    // console.log("canload route ,", route);
    return true;
  }
}
