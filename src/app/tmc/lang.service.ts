import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { ApiService } from "../services/api/api.service";
import { RequestEntity } from "../services/api/Request.entity";
import { IdentityService } from "../services/identity/identity.service";
import { IdentityEntity } from "../services/identity/identity.entity";
import { AppHelper } from "../appHelper";
import { finalize } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class LangService {
  private subscription = Subscription.EMPTY;
  private intervalId: any;
  private html: any;
  private timer = 800;
  private len = 1500;
  private identity: IdentityEntity;
  private isTranslate = false;
  private langSource = new BehaviorSubject("cn");
  constructor(
    private apiService: ApiService,
    identityService: IdentityService,
    private router: Router
  ) {
    identityService.getIdentitySource().subscribe((id) => {
      this.identity = id;
      this.translate();
    });
  }
  get isEn() {
    return AppHelper.getStyle() && AppHelper.getStyle().toLowerCase() == "en";
  }
  get isCn() {
    return AppHelper.getStyle() && AppHelper.getStyle().toLowerCase() == "cn";
  }
  translate() {
    try {
      if (this.identity && this.identity.Id != "0" && this.identity.Ticket) {
        if (
          AppHelper.getStyle() &&
          AppHelper.getStyle().toLowerCase() != "cn"
        ) {
          this.start();
        } else {
          this.stop();
        }
      } else {
        setTimeout(() => {
          this.stop();
          this.router.navigate([AppHelper.getRoutePath(this.router.url)], {
            replaceUrl: true,
            skipLocationChange: false,
          });
        }, 0);
      }
    } catch (e) {
      console.error(e);
    }
  }
  setLang(lang = "cn") {
    AppHelper.setStyle(lang);
    AppHelper.setStorage("language", lang);
    this.langSource.next(lang);
  }
  getLang() {
    return AppHelper.getLanguage();
  }
  getLangSource() {
    return this.langSource.asObservable();
  }
  private getTranslateContent(result: string[]) {
    const req = new RequestEntity();
    req.Data = {
      Content: result,
    };
    req.IsShowLoading = false;
    req.IsRedirctLogin = false;
    req.IsShowMessage = false;
    req.Method = "TmcApiHomeUrl-Translate-Translate";
    return this.apiService.getResponse<{ Content: string[] }>(req);
  }
  private start() {
    this.stop();
    this.intervalId = setInterval(() => {
      this.translateTags();
    }, this.timer);
  }
  private stop() {
    this.subscription.unsubscribe();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  private translateTags() {
    const innerHtml = document.body.innerHTML;
    const is = document.body.textContent.match(/[\u4E00-\u9FA5]/g);
    if (!is) {
      console.log("当前页面无需翻译");
      return;
    }
    if (this.html == innerHtml && !this.isTranslate) {
      console.log("当前页面正在翻译 translateTags");
      return;
    }
    this.isTranslate = false;
    this.html = innerHtml;
    const tags: ChildNode[] = [];
    console.time("getTags");
    this.getTags(document.body, tags);
    console.timeEnd("getTags");
    if (tags.length) {
      this.subscription.unsubscribe();
      const contents: {
        tag: ChildNode;
        txt: string;
      }[] = [];
      tags.forEach((t, idx) => {
        const arr = t.textContent.match(/[\u4e00-\u9fa5]{1,}/g);
        if (arr) {
          arr.forEach((it) => {
            contents.push({
              tag: t,
              txt: it,
            });
          });
        } else {
          contents.push({
            tag: t,
            txt: t.textContent,
          });
        }
      });
      this.subscription = this.getTranslateContent(contents.map((it) => it.txt))
        .pipe(
          finalize(() => {
            this.html = "";
          })
        )
        .subscribe((r) => {
          if (r && r.Data && r.Data.Content) {
            if (r.Data.Content.length != contents.length) {
              console.error("翻译失败");
            } else {
              for (let i = 0; i < contents.length; i++) {
                const t = contents[i];
                t.tag.textContent = t.tag.textContent.replace(
                  t.txt,
                  r.Data.Content[i]
                );
              }
              this.isTranslate = true;
            }
          } else {
            this.subscription.unsubscribe();
          }
        });
    }
  }
  private getTags(parent: ChildNode, tags: ChildNode[] = []) {
    try {
      if (parent.childNodes && parent.childNodes.length) {
        for (let i = 0; i < parent.childNodes.length; i++) {
          const el = parent.childNodes.item(i);
          if (el.nodeType == Node.COMMENT_NODE) {
            continue;
          }
          if (el.nodeType == Node.ELEMENT_NODE) {
            const ele: HTMLElement = el as any;
            if (
              ele.hasAttribute("notranslate") ||
              ele.classList.contains("notranslate") ||
              !el.textContent ||
              !el.textContent.match(/[\u4E00-\u9FA5]/g)
            ) {
              continue;
            }
          }
          if (tags.map((it) => it.textContent).join("").length <= this.len) {
            this.getTags(el as Element, tags);
          } else {
            break;
          }
        }
      } else if (parent) {
        if (parent.nodeType == Node.TEXT_NODE) {
          // 文本节点
          if (parent.textContent.match(/[\u4E00-\u9FA5]/g)) {
            if (tags.map((it) => it.textContent).join("").length <= this.len) {
              tags.push(parent);
            } else {
              return;
            }
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
