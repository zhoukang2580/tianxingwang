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
  @Input()isBackHome;
  @Input() customeBack: boolean;
  @Input() backFn: (...args) => any;
  constructor(
    private router: Router,
    private navCtrl: NavController,
    platform: Platform,
    private el: ElementRef<HTMLElement>,
    @Optional() @Attribute("customeback") private customeback: any,
    @Optional() @Attribute("defaultHref") private defaultHref: string,
    @Optional() @Attribute("color") public color: string
  ) {
    this.isIos = platform.is("ios");
  }
  back(evt?: CustomEvent) {
    if (typeof this.backFn == "function") {
      this.backFn(evt);
      return;
    }
    if (!this.customeback && !this.customeBack) {
      this.backToPrePage(evt);
    }
  }
  onDelete(){
    this.router.navigate([""]);
  }
  backToPrePage(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    console.log(
      "app-back-button curUrl:",
      this.curUrl,
      "customeback = " + this.customeback,
      this.router.url.split("?")[0]
    );
    this.navCtrl.pop().then(() => {
      // console.log(
      //   "app-back-button pop 后 curUrl:",
      //   this.router.url.split("?")[0],
      //   "customeback " + this.customeback
      // );
      requestAnimationFrame(() => {
        const isBack =
          this.router.url.split("?")[0] == this.curUrl.split("?")[0];
        if (isBack) {
          this.navCtrl.navigateBack(this.defaultHref || "");
        }
      });
    });
  }
  ngOnInit() {
  }
  ngAfterViewInit() {
    this.curUrl = this.router.url;
  }
}
