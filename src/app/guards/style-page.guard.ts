import { NavController } from '@ionic/angular';
import { AppHelper } from './../appHelper';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { constants } from 'crypto';

@Injectable({
  providedIn: 'root'
})
export class StylePageGuard implements CanActivate {
  constructor(private router: Router, private navCtrl: NavController) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    try {
      const style: string = AppHelper.getStyle();
      if (!style || style.toLowerCase() == "cn" || style.toLowerCase() == 'zh_cn') {
        return true;
      }
      const path = this.getRoute(state.url);
      if (path == "" || path.includes("tabs")) {
        const tabs = this.router.config.find(it => it.path == "");
        if (tabs) {
          const children = tabs.children && tabs.children.length ? tabs.children : tabs['_loadedConfig'] && tabs['_loadedConfig'].routes.find(it => it.path == 'tabs').children;
          let cpath = path.includes("tabs/") ? path.split("tabs/")[1] : path;
          cpath = this.getRoute(cpath);
          if (children) {
            const r = children.find(c => c.path.includes(`${cpath}_${style}`));
            if (!cpath) {
              return true;
            }
            if (r) {
              this.navCtrl.navigateRoot(`/tabs/${r.path}`, { queryParams: next.queryParams })
              return false;
            }
          }
        }
      }
      const styleRoute = `${this.getRoute(state.url)}_${style}`;
      if (this.router.config) {
        let find = this.router.config.find(it => it.path == styleRoute);
        if (find) {
          this.router.navigate([styleRoute], {
            queryParams: next.queryParams
          });
          return false;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return true;
  }
  private getRoute(url: string) {
    url = decodeURIComponent(url);
    url = url.startsWith("/") ? url.substring(1) : url;
    if (url.includes("?")) {
      url = url.substring(0, url.indexOf("?"));
    }
    return url;
  }

}
