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
  UrlTree,
} from "@angular/router";
import { Observable, of } from "rxjs";
import { IdentityService } from "../services/identity/identity.service";
import {
  AlertController,
  LoadingController,
  ModalController,
} from "@ionic/angular";
import { finalize, switchMap, map, catchError } from "rxjs/operators";
import { LoginSkeletonPageComponent } from "../components/login-skeleton-page/login-skeleton-page.component";
import { CONFIG } from "../config";

@Injectable({
  providedIn: "root",
})
export class AuthorityGuard implements CanActivate, CanLoad, CanActivateChild {
  // private identity: IdentityEntity;
  private isShowModel = false;
  constructor(
    private identityService: IdentityService,
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
    // this.identityService.getIdentityAsync().then(id => {
    //   console.log(
    //     "authority guard identityService.getIdentityAsync() identity",
    //     id
    //   );
    // });
    return this.identityService.getStatus().pipe(
      catchError((e) => {
        return of(false);
      }),
      map((status) => {
        if (status) {
          return true;
        }
        // this.loginService.setToPageRouter(state.url);
        AppHelper.setToPageAfterAuthorize({
          path: state.url,
          queryParams: next.queryParams,
        });
        if (AppHelper.isWechatMini() && CONFIG.isForWechatMiniApproval) {
          this.router.navigate(["home"]);
          return false;
        }
        this.router.navigate([AppHelper.getRoutePath("login")]);
        return false;
      })
    );
  }
  canLoad(route: Route) {
    // console.log("canload route ,", route);
    return true;
  }
}
