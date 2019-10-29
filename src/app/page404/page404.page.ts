import { AppHelper } from './../appHelper';
import { IdentityService } from './../services/identity/identity.service';
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { IdentityEntity } from '../services/identity/identity.entity';

@Component({
  selector: "app-page404",
  templateUrl: "./page404.page.html",
  styleUrls: ["./page404.page.scss"]
})
export class Page404Page implements OnInit {
  curRoute: { url: string } = { url: null };

  constructor(private route: ActivatedRoute, private router: Router, private identityService: IdentityService) {
  }

  async ngOnInit() {
    console.log(`未找到的路由：${(this.curRoute.url = this.router.routerState.snapshot.url)}`);
    const identity: IdentityEntity = await this.identityService.getIdentityAsync().catch(_ => null);
    if (identity) {
      if (identity.Ticket) {
        this.router.navigate([AppHelper.getRoutePath("")]);
      } else {
        this.router.navigate([AppHelper.getRoutePath("login")]);
      }
    }
  }
}
