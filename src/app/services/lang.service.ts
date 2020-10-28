import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { ApiService } from "./api/api.service";
import { RequestEntity } from "./api/Request.entity";
import { IdentityService } from "./identity/identity.service";
import { IdentityEntity } from "./identity/identity.entity";
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
    const is = document.body.innerHTML.match(/[\u4E00-\u9FA5]/g);
    if (!is) {
      // console.log("当前页面无需翻译");
      return;
    }
    if (this.html == innerHtml && !this.isTranslate) {
      // console.log("当前页面正在翻译 translateTags return");
      return;
    }
    this.isTranslate = false;
    this.html = innerHtml;
    const tags: ChildNode[] = [];
    // console.time("getTags");
    this.getTags(document.body, tags);
    // console.timeEnd("getTags");
    if (tags.length) {
      this.subscription.unsubscribe();
      const contents: {
        tag: ChildNode;
        txt: string;
      }[] = [];
      tags.forEach((t, idx) => {
        try {
          const tag = this.getPlaceholderTag(t as any);
          if (tag) {
            contents.push({
              tag,
              txt: tag.getAttribute("placeholder"),
            });
          } else {
            contents.push({
              tag: t,
              txt: t.textContent,
            });
          }
        } catch (e) {
          console.error(e);
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
                const phtag = this.getPlaceholderTag(t.tag as any);
                if (phtag) {
                  phtag.setAttribute("placeholder", r.Data.Content[i]);
                } else {
                  t.tag.textContent = t.tag.textContent.replace(
                    t.txt,
                    r.Data.Content[i]
                  );
                }
              }
              this.isTranslate = true;
            }
          } else {
            this.subscription.unsubscribe();
          }
        });
    }
  }
  private isHanzi(txt: string) {
    return txt && txt.match(/[\u4E00-\u9FA5]/g);
  }
  private getPlaceholderTag(el: Element) {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      return el;
    }
    if (el && typeof el.querySelectorAll == "function") {
      const phs =
        el.querySelectorAll("input[placeholder]") ||
        el.querySelectorAll("textarea[placeholder]");
      if (phs) {
        let ph: Element;
        for (let i = 0; i < phs.length; i++) {
          const item = phs.item(i);
          if (
            item &&
            typeof item.getAttribute == "function" &&
            this.isHanzi(item.getAttribute("placeholder"))
          ) {
            ph = item;
            break;
          }
        }
        return ph;
      }
    }
    return null;
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
          if (this.isTagsContentsLessThen(tags as any)) {
            const phtag = this.getPlaceholderTag(parent as any);
            if (phtag) {
              if (this.isHanzi(phtag.getAttribute("placeholder"))) {
                if (!tags.find((it) => it == phtag)) {
                  tags.push(phtag);
                }
              }
            } else {
              this.getTags(el as Element, tags);
            }
          } else {
            break;
          }
        }
      } else if (parent) {
        if (parent.nodeType == Node.TEXT_NODE) {
          // 文本节点
          if (parent.textContent.match(/[\u4E00-\u9FA5]/g)) {
            if (this.isTagsContentsLessThen(tags as any)) {
              if (!tags.find((t) => t == parent)) {
                tags.push(parent);
              }
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
  private isTagsContentsLessThen(tags: HTMLElement[]) {
    return (
      (tags &&
        tags
          .map((it) => {
            const t = this.getPlaceholderTag(it);
            return it.textContent || (t && t.getAttribute("placeholder")) || "";
          })
          .join("").length) <= this.len
    );
  }
}
