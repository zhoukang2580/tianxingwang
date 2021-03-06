import { NavController, Platform } from "@ionic/angular";
import { Router } from "@angular/router";
import {
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  Optional,
  Attribute,
  Input,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";

@Component({
  selector: "app-back-button",
  templateUrl: "./back-button.component.html",
  styleUrls: ["./back-button.component.scss"],
})
export class BackButtonComponent implements OnInit, AfterViewInit {
  private curUrl: string;
  isIos = false;
  isShow = true || AppHelper.isApp();
  @Input() isBackHome;
  @Input() customeBack: boolean;
  @Input() backFn: (...args) => any;
  @Input() forceback = true;
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
      this.popToPrePage(evt);
      return;
    }
    this.backToPrePage();
  }
  onBackHome() {
    this.navCtrl.setDirection("root", true);
    this.router.navigate([""]);
  }
  backToPrePage(args?: any) {
    if (args) {
      const nav = this.router.getCurrentNavigation();
      if (nav && nav.extras) {
        nav.extras.state = {
          ...nav.extras.state,
          ...args,
        };
      }
    }
    this.navCtrl.back({ animated: true });
  }
  popToPrePage(evt?: CustomEvent) {
    if (evt) {
      evt.preventDefault();
      evt.stopPropagation();
    }
    this.navCtrl.pop().then(() => {
      if (!this.forceback) {
        return;
      }
      requestAnimationFrame(() => {
        try {
          const path = AppHelper.getNormalizedPath(this.router.url);
          const curPath = AppHelper.getNormalizedPath(this.curUrl);
          const isBack = path == curPath;
          if (isBack) {
            const query = AppHelper.getQueryParamers();
            this.navCtrl.navigateBack(
              this.defaultHref ||
                query.routehome ||
                (query.unroutehome == "true" && query.path) ||
                ""
            );
          }
        } catch (e) {
          console.error(e);
        }
      });
    });
  }
  ngOnInit() {}
  ngAfterViewInit() {
    this.curUrl = this.router.url; // /mms-goods-detail?id=54340000001351
    const query = AppHelper.getQueryParamers();
    if (query && query.unroutehome == "true" && query.path) {
      const curPath = AppHelper.getNormalizedPath(this.curUrl);
      const queryPath: string = AppHelper.getNormalizedPath(query.path);
      console.log("unroutehome curPath =" + curPath, `query.path=${queryPath}`);
      this.isShow =
        !this.curUrl.toLowerCase().includes(queryPath.toLowerCase()) ||
        (queryPath as string).toLowerCase() != curPath;
    }
  }
}
