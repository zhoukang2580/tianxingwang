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
          await m.present().catch(_ => {
            this.isShowModel = true;
          });
          setTimeout(() => {
            m.dismiss().catch(_ => {});
          }, 5000);
          this.isShowModel = true;
          const identity = await this.identityService.getIdentityAsync();
          console.log("getIdentityAsync", identity);
          if (!identity || !identity.Ticket || !identity.Id) {
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
    return this.identityService.getIdentity().pipe(
      catchError(e => of(null)),
      map((identity: IdentityEntity) => {
        console.log("getIdentity ", identity);
        // console.log("canload route ,", route);
        if (!identity || !identity.Ticket || !identity.Id) {
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
