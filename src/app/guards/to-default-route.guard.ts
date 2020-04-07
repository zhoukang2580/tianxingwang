import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  UrlSegmentGroup,
  UrlSegment
} from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ToDefaultRouteGuard implements CanActivate {
  constructor(private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const url = state.url.startsWith("/") ? state.url.substring(1) : state.url;
    const tree = this.router.parseUrl(state.url);
    const defaultUrlTree: UrlTree = {
      root: tree.root,
      queryParamMap: tree.queryParamMap,
      fragment: tree.fragment,
      queryParams: tree.queryParams
    };
    defaultUrlTree.root.segments = [];
    defaultUrlTree.root.segments.push(
      new UrlSegment(url.substring(0, url.lastIndexOf("_")), {})
    );
    if (this.router.config.find(it => it.path == `${url}`)) {
      return true;
    }
    // if (
    //   this.router.config.find(
    //     it => it.path == url.substring(0, url.lastIndexOf("_"))
    //   )
    // ) {
    //   return false;
    // }
    this.router.navigate([url.substring(0, url.lastIndexOf("_"))]);
    return false;
  }
}
