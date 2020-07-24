import { Injectable } from "@angular/core";
import {
  CanDeactivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Observable } from "rxjs";
export interface CanComponentDeactivate {
  canDeactivate: (
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ) => Observable<boolean> | Promise<boolean> | boolean;
}
@Injectable({
  providedIn: "root",
})
export class CandeactivateGuard
  implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ) {
    return component.canDeactivate
      ? component.canDeactivate(currentRoute, currentState, nextState)
      : true;
  }
}
