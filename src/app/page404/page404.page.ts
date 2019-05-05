import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { Route } from "@angular/router";

@Component({
  selector: "app-page404",
  templateUrl: "./page404.page.html",
  styleUrls: ["./page404.page.scss"]
})
export class Page404Page implements OnInit {
  curRoute: { url: string } = { url: null };
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    console.log((this.curRoute.url = this.router.routerState.snapshot.url));
  }
}
