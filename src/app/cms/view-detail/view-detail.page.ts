import { environment } from 'src/environments/environment';
import { CmsService, Notice } from "./../cms.service";
import { DomSanitizer } from "@angular/platform-browser";
import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

@Component({
  selector: "app-view-detail",
  templateUrl: "./view-detail.page.html",
  styleUrls: ["./view-detail.page.scss"]
})
export class ViewDetailPage implements OnInit {
  notice$: Observable<Notice>;
  constructor(
    private cmsService: CmsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.notice$ = this.cmsService.getSelectedNotice().pipe(
      tap(n=>{
        if(!environment.production){
          console.log(n);
        }
      }),
      map(n => {
        if (n && n.Url) {
          return {
            ...n,
            Url: this.sanitizer.bypassSecurityTrustResourceUrl(n.Url) as string
          };
        }
        return n;
      })
    );
  }
}
