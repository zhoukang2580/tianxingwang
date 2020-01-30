import { filter } from "rxjs/operators";
import { Subscription } from "rxjs";
import {
  animate,
  style,
  transition,
  state,
  trigger
} from "@angular/animations";
import { Component, OnInit, HostBinding } from "@angular/core";
import { Router, NavigationStart } from "@angular/router";

@Component({
  selector: "app-tabs",
  templateUrl: "tabs.page.html",
  styleUrls: ["tabs.page.scss"],
  animations: [
    trigger("tabAnimate", [
      state(
        "true",
        style({
          // opacity:1,
          transform: "translateX(0)"
          // height:"*"
          // display:"block"
        })
      ),
      state(
        "false",
        style({
          // opacity:0,
          // display:'none',
          // height:0,
          transform: "translateX(-100%)"
        })
      ),
      transition("true<=>false", animate("300ms ease-in-out"))
    ])
  ]
})
export class TabsPage implements OnInit {
  private subscription = Subscription.EMPTY;
  // @HostBinding("class.ion-page-hidden")
  private isHidden;
  tab: string;
  constructor(private router: Router) {
    // this.tab = "home";
  }
  ngOnInit() {
    this.subscription = this.router.events
      .pipe(filter(evt => evt instanceof NavigationStart))
      .subscribe((evt: NavigationStart) => {
        const url = evt.url;
        this.isHidden = !(
          "/" == url ||
          ["tabs/my", "tabs/home", "tabs/trip"].some(it => url.includes(it))
        );
        console.log("导航开始", url, "isHidden", this.isHidden);
      });
  }
  onIonTabsWillChange(evt: { tab: string }) {
    console.log(evt);
    this.tab = evt.tab;
  }
}
