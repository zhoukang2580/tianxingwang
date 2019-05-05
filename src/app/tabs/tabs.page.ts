import {
  animate,
  style,
  transition,
  state,
  trigger
} from "@angular/animations";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

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
  tab: string;
  constructor(private router: Router) {
    // this.tab = "home";
  }
  ngOnInit() {}
  activeTab(tab: string) {}
}
