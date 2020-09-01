import { Injectable } from "@angular/core";
import { ApiService } from "../services/api/api.service";
import { RequestEntity } from "../services/api/Request.entity";
import { IdentityService } from "../services/identity/identity.service";
import { AppHelper } from "../appHelper";
import { IdentityEntity } from "../services/identity/identity.entity";

@Injectable({
  providedIn: "root",
})
export class TranslateService {
  private tempHtml = "";
  private isTranslate = false;
  private intervalId: any;
  private intervalTime = 1000;
  private identity: IdentityEntity;
  constructor(
    private apiService: ApiService,
    identityService: IdentityService
  ) {
    identityService.getIdentitySource().subscribe((id) => {
      this.identity = id;
      this.translate();
    });
  }
  translate() {
    if (this.identity && this.identity.Id != "0" && this.identity.Ticket) {
      if (AppHelper.getStyle() && AppHelper.getStyle().toLowerCase() != "cn") {
        this.start();
      } else {
        this.stop();
      }
    } else {
      setTimeout(() => {
        this.stop();
      }, 5000);
    }
  }
  private start() {
    this.stop();
    this.intervalId = setInterval(
      () => this.inspectTranslate(),
      this.intervalTime
    );
  }
  private stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
  private getTranslateContent(html) {
    if (!html) {
      return null;
    }
    // tslint:disable-next-line: max-line-length
    const reg = /<\w+(\s|\w|\=|\"|\:|\;|\/|\.|\#|\(|\)|\?|\&|[\u4E00-\u9FA5])*>((?!\<)(.|\r|\n))*[\u4E00-\u9FA5]+((?!\<)(.|\r|\n))*<\/\w+>/g;
    const matches = html.match(reg);

    return matches;
  }

  private getElementTag(match) {
    const reg = /<\/\w+>/g;
    const elementTag = reg.exec(match);
    if (!elementTag || !elementTag.length) {
      return null;
    }
    const result = /\w+/g.exec(elementTag[0]);
    if (!result || !result.length) {
      return null;
    }
    return result[0];
  }
  private getElementContent(match) {
    return match
      .replace(
        /^<\w+(\s|\w|\=|\"|\:|\;|\/|\.|\#|\(|\)|\?|\&|[\u4E00-\u9FA5])*>/g,
        ""
      )
      .replace(/<\/\w+>$/g, "");
  }
  private replaceElement(match, transContent) {
    const elementTag = this.getElementTag(match);
    if (!elementTag) {
      return;
    }
    const val = this.getElementContent(match);
    const elements = document.body.querySelectorAll(elementTag) as any;
    if (!elements) {
      return;
    }
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < elements.length; i++) {
      if (elements[i].value != val && elements[i].innerHTML != val) {
        continue;
      }
      if (elements[i].value) {
        elements[i].value = transContent;
      } else {
        elements[i].innerHTML = transContent;
      }
    }
  }
  private replaceTranslate(matches, transContents) {
    if (!transContents || !matches) {
      return;
    }
    if (matches.length != transContents.length) {
      return;
    }
    for (let i = 0; i < transContents.length; i++) {
      this.replaceElement(matches[i], transContents[i]);
    }
  }
  private translateContent(matches, result, callback) {
    const req = new RequestEntity();
    req.Data = {
      Content: result,
    };
    req.IsShowLoading = false;
    req.IsRedirctLogin = false;
    req.IsShowMessage = false;
    req.Method = "TmcApiHomeUrl-Translate-Translate";
    this.apiService
      .getPromise<{ Content: string }>(req)
      .then((r) => {
        if (typeof callback == "function") {
          callback(r);
        }
        if (r && r.Data && r.Data.Content) {
          this.replaceTranslate(matches, r.Data.Content);
        }
        this.isTranslate = false;
      })
      .catch((e) => {
        this.isTranslate = false;
      });
  }
  private inspectTranslate() {
    const html = document.body.innerHTML;
    if (html == this.tempHtml) {
      return;
    }
    this.tempHtml = html;
    this.inspectElement(html);
  }
  private inspectElement(html: string, callback?: () => any) {
    if (this.isTranslate) {
      return;
    }
    this.isTranslate = true;
    const matches = this.getTranslateContent(html);
    if (!matches) {
      this.isTranslate = false;
      return;
    }
    const result = [];
    if (matches.length) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < matches.length; i++) {
        result.push(this.getElementContent(matches[i]));
      }
    }
    if (!result.length) {
      return;
    }
    this.translateContent(matches, result, callback);
  }
}
