import { NavController, Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  Optional,
  Attribute,
  Input
} from "@angular/core";
import { CandeactivateGuard } from "src/app/guards/candeactivate.guard";

@Component({
  selector: "app-back-button",
  templateUrl: "./back-button.component.html",
  styleUrls: ["./back-button.component.scss"]
})
export class BackButtonComponent implements OnInit, AfterViewInit {
  private curUrl: string;
  isIos = false;
  @Input() customeBack: boolean;
  @Input() backFn: (...args) => any;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    platform: Platform,
    private el: ElementRef<HTMLElement>,
    @Optional() @Attribute("customeback") private customeback: any,
    @Optional() @Attribute("defaultHref") private defaultHref: string
  ) {
    this.isIos = platform.is("ios");
  }
  back(evt?: CustomEvent) {
    console.log("app-back-button curUrl:", this.curUrl, this.customeback);
    if (typeof this.backFn == "function") {
      this.backFn(evt);
      return;
    }
    if (!this.customeback && !this.customeBack) {
      if (evt) {
        evt.preventDefault();
        evt.stopPropagation();
      }
      this.navCtrl.pop().then(() => {
        if (this.router.url.includes(this.curUrl)) {
          this.navCtrl.navigateBack(this.defaultHref || "");
        }
      });
    }
  }
  ngOnInit() {}
  ngAfterViewInit() {
    this.curUrl = this.router.url;
  }
}
