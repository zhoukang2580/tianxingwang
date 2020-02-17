import { LoadingController, NavController } from "@ionic/angular";
import { Subject, BehaviorSubject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import {
  Component,
  OnInit,
  QueryList,
  ElementRef,
  ViewChildren,
  AfterViewInit
} from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-open-url",
  templateUrl: "./open-url.page.html",
  styleUrls: ["./open-url.page.scss"]
})
export class OpenUrlPage implements OnInit, AfterViewInit {
  title: string;
  url$: Subject<any>;
  isHideTitle = false;
  @ViewChildren("iframe") iframes: QueryList<ElementRef<HTMLIFrameElement>>;
  constructor(
    activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private navCtrl: NavController
  ) {
    this.url$ = new BehaviorSubject(null);
    activatedRoute.queryParamMap.subscribe(p => {
      console.log("open url page ", p);
      if (p.get("url")) {
        this.url$.next(
          this.domSanitizer.bypassSecurityTrustResourceUrl(p.get("url"))
        );
      }
      if (p.get("title")) {
        this.title = p.get("title");
      }
      const h = p.get('isHideTitle');
      this.isHideTitle = h == 'true';
    });
  }
  ngAfterViewInit() {
    if (this.iframes) {
      this.iframes.changes.subscribe(async _ => {
        const iframe = this.iframes.first;
        if (iframe) {
          const l = await this.loadingCtrl.create({ message: "请稍后..." });
          l.backdropDismiss = true;
          l.present();
          iframe.nativeElement.onload = _ => {
            l.dismiss();
          };
        }
      });
    }
  }
  ngOnInit() { }
}
