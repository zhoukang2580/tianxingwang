import { AppComponentsModule } from "./../../components/appcomponents.module";
import { Injectable, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  Routes,
  RouterModule,
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";

import { IonicModule, NavController } from "@ionic/angular";

import { OpenUrlPage } from "./open-url.page";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";
import { Observable } from "rxjs";
import { AppHelper } from "src/app/appHelper";
import { PageComponentsModule } from "../components/page-components.module";
@Injectable({
  providedIn: "root",
})
export class OpenUrlPageGuard implements CanActivate {
  constructor(private router: Router, private navCtrl: NavController) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    try {
      // if (
      //   state.url.startsWith("localhost") ||
      //   state.url.startsWith("localhost")
      // ) {
      //   return false;
      // }
      console.log("OpenUrlPageGuard state.url", state.url);
      return true;
    } catch (e) {
      return false;
    }
  }
}
const routes: Routes = [
  {
    path: "",
    component: OpenUrlPage,
    canDeactivate: [CandeactivateGuard],
    canActivate: [OpenUrlPageGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageComponentsModule,
  ],
  declarations: [OpenUrlPage],
})
export class OpenUrlPageModule {}
