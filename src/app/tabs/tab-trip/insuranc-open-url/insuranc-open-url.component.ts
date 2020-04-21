import { Component, OnInit, ViewChild, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { InAppBrowserOptions, InAppBrowserObject, InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Subject, BehaviorSubject } from 'rxjs';
import { BackButtonComponent } from 'src/app/components/back-button/back-button.component';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingController, NavController, Platform, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-insuranc-open-url',
  templateUrl: './insuranc-open-url.component.html',
  styleUrls: ['./insuranc-open-url.component.scss'],
})
export class InsurancOpenUrlComponent implements OnInit, AfterViewInit {
  title: string;
  url$: Subject<any>;
  url: string;
  @ViewChild(BackButtonComponent) backButton: BackButtonComponent;
  @ViewChildren("iframe") iframes: QueryList<ElementRef<HTMLIFrameElement>>;
  constructor(
    activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,
  ) {
    this.url$ = new BehaviorSubject(null);
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
  back() {
    this.modalCtrl.getTop().then(t => t.dismiss());
  }
  ngOnInit() {
    this.url$.next(this.domSanitizer.bypassSecurityTrustResourceUrl(this.url))
  }
}
