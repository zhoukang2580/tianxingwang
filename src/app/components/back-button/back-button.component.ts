import { NavController, Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  Optional,
  Attribute
} from "@angular/core";

@Component({
  selector: "app-back-button",
  templateUrl: "./back-button.component.html",
  styleUrls: ["./back-button.component.scss"]
})
export class BackButtonComponent implements OnInit, AfterViewInit {
  private curUrl: string;
  isIos = false;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    platform: Platform,
    private el: ElementRef<HTMLElement>,
    @Optional() @Attribute("(click)") private method: (...args) => any,
    @Optional() @Attribute("defaultHref") private method2: (...args) => any
  ) {
    this.isIos = platform.is("ios");
    // console.log(this.el, this.method);
  }
  back(evt: CustomEvent) {
    console.log(evt, evt.preventDefault, evt.stopPropagation);
    // evt.preventDefault();
    // evt.stopPropagation();
    console.log("app-back-button curUrl:", this.curUrl);
  }
  ngOnInit() {}
  ngAfterViewInit() {
    this.curUrl = this.router.url;
  }
}
