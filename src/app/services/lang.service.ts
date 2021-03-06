import { Injectable } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { ApiService } from "./api/api.service";
import { RequestEntity } from "./api/Request.entity";
import { IdentityService } from "./identity/identity.service";
import { IdentityEntity } from "./identity/identity.entity";
import { AppHelper } from "../appHelper";
import { finalize } from "rxjs/operators";
import { Router } from "@angular/router";
import { CONFIG } from "../config";

@Injectable({
  providedIn: "root",
})
export class LangService {
  private subscription = Subscription.EMPTY;
  private intervalId: any;
  private html: any;
  private currentContent: string;
  private timer = 800;
  private len = 1500;
  private retryCount = 3;
  private identity: IdentityEntity;
  private isTranslate = false;
  private langSource = new BehaviorSubject("cn");
  private count = 1;
  constructor(
    private apiService: ApiService,
    identityService: IdentityService,
    private router: Router
  ) {
    identityService.getIdentitySource().subscribe((id) => {
      this.identity = id;
      if (CONFIG.isEnableTranslate) {
        this.translate();
      }
    });
  }
  get isEn() {
    const lang = AppHelper.getLanguage();
    return (
      (AppHelper.getStyle() && AppHelper.getStyle().toLowerCase() == "en") ||
      lang == "en"
    );
  }
  get isCn() {
    const lang = AppHelper.getLanguage();
    return (
      !AppHelper.getStyle() ||
      AppHelper.getStyle().toLowerCase() == "cn" ||
      !lang ||
      lang == "cn"
    );
  }
  translate() {
    try {
      if (this.identity && this.identity.Id != "0" && this.identity.Ticket) {
        if (this.isEn) {
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
  setLang(lang = CONFIG.defaultStyle) {
    AppHelper.setStyle(lang);
    AppHelper.setStorage("language", lang);
    const obj=AppHelper.getQueryParamers();
    if(obj&&obj.language){
      obj.language=lang
    }
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
      // console.log("????????????????????????");
      return;
    }
    if (this.html == innerHtml && !this.isTranslate) {
      // console.log("???????????????????????? translateTags return");
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
      if (
        contents.map((it) => it.txt).join(",") == this.currentContent &&
        this.count > this.retryCount
      ) {
        return;
      }
      if (this.currentContent != contents.map((it) => it.txt).join(",")) {
        this.count = 0;
      }
      this.currentContent = contents.map((it) => it.txt).join(",");
      this.subscription = this.getTranslateContent(contents.map((it) => it.txt))
        .pipe(
          finalize(() => {
            this.html = "";
          })
        )
        .subscribe(
          (r) => {
            if (r && r.Data && r.Data.Content) {
              if (r.Data.Content.length != contents.length) {
                this.checkStop(contents.map((it) => it.txt).join(","));
                console.error("????????????");
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
                this.currentContent = "";
                this.count = 0;
              }
            } else {
              this.checkStop(contents.map((it) => it.txt).join(","));
              this.subscription.unsubscribe();
            }
          },
          (e) => {
            this.checkStop(contents.map((it) => it.txt).join(","));
          }
        );
    }
  }
  private checkStop(translateCnt: string) {
    if (translateCnt == this.currentContent) {
      this.count++;
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
          // ????????????
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
