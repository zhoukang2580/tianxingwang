import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { Subject, BehaviorSubject } from "rxjs";

@Component({
  selector: "app-view-detail",
  templateUrl: "./view-detail.page.html",
  styleUrls: ["./view-detail.page.scss"]
})
export class ViewDetailPage implements OnInit {
  title: string;
  url$: Subject<any>;
  constructor(route: ActivatedRoute,sanitizer:DomSanitizer) {
    this.url$ = new BehaviorSubject(null);
    route.queryParamMap.subscribe(p => {
      this.title = p.get("title");
      if(p.get("url")){
        this.url$.next(sanitizer.bypassSecurityTrustResourceUrl(p.get("url")));
      }
    });
  }

  ngOnInit() {}
}
