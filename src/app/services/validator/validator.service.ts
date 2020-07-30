import { AppHelper } from "./../../appHelper";
import { RequestEntity } from "../api/Request.entity";
import { Injectable } from "@angular/core";
import { ApiService } from "../api/api.service";
import { finalize } from "rxjs/operators";
export interface Res {
  Message: string; // "账户编号错误"
  Name: string; // "Account.Id"
  Rules: {
    IsRange?: boolean;
    Message?: string;
    Options?: string;
    Pattern?: string;
  }[];
}
export interface ValidateInfo {
  name: string;
  saveType: string;
  rule: Res[];
}
@Injectable({
  providedIn: "root",
})
export class ValidatorService {
  private infos: ValidateInfo[] = [];
  private fetching: Promise<ValidateInfo>;
  constructor(private apiService: ApiService) {}
  checkObjPropertiy(
    obj: any,
    name: string,
    type: string,
    container: HTMLElement
  ) {
    if (!this.infos || !this.infos.length) {
      return "";
    }
    const rule = this.infos.find(
      (it) => it.name == name && it.saveType == type
    );
    if (rule && rule.rule) {
      const pro = Object.keys(obj).find((k) => !obj[k]);
      if (pro) {
        const oneEl = container.querySelector(
          `[validatename='${pro}']`
        ) as HTMLInputElement;
        if (oneEl) {
          const rect = oneEl.getBoundingClientRect();
          if (rect) {
            const contentEl = oneEl.closest("ion-content");
            if (contentEl) {
              contentEl.scrollByPoint(0, rect.bottom, 100);
            }
          }
        }
        const msg = rule.rule.find((r) => r.Name == pro);
        if (msg && msg.Message) {
          setTimeout(() => {
            const el = container.querySelector(
              `[validatename='${pro}']`
            ) as HTMLInputElement;
            if (el) {
              el.focus();
            }
          }, 120);
          return msg.Message;
        }
      }
    }
    return "";
  }
  initialize(
    name: string,
    saveType: string,
    container: HTMLElement,
    isShowMessage: boolean = false
  ) {
    return this.get(name, saveType)
      .then((r) => {
        const validator = new window["Winner"].Validator({
          IsShowMessage: isShowMessage,
          Style: "",
        });
        validator.Initialize();
        const allIonInputs = container.querySelectorAll("ion-input");
        const allInputs = container.querySelectorAll("input");
        const allIonTextarea = container.querySelectorAll("ion-textarea");
        const allTextarea = container.querySelectorAll("textarea");
        const wrapper = [];
        if (allIonTextarea) {
          allIonTextarea.forEach((it) => {
            const vn = it.getAttribute("validatename");
            if (vn) {
              const textarea = it.querySelector("textarea");
              if (textarea) {
                this.addValidateName(textarea, vn);
                wrapper.push(textarea);
              }
            }
          });
        }
        if (allTextarea) {
          allTextarea.forEach((it) => {
            if (it.getAttribute("validatename")) {
              wrapper.push(it);
            }
          });
        }
        if (allInputs) {
          allInputs.forEach((it) => {
            if (it.getAttribute("validatename")) {
              wrapper.push(it);
            }
          });
        }
        if (allIonInputs) {
          allIonInputs.forEach((it) => {
            const vn = it.getAttribute("validatename");
            if (vn) {
              const input = it.querySelector("input");
              if (input) {
                this.addValidateName(input, vn);
                wrapper.push(input);
              }
            }
          });
        }

        validator.InitializeControl(r.rule, { childNodes: wrapper });
      })
      .catch((_) => {
        console.error(_);
      });
  }
  private addValidateName(
    el: HTMLElement,
    attrv: string,
    attr: string = "validatename"
  ) {
    if (el) {
      el.setAttribute(attr, attrv);
    }
  }
  add(validateInfo: ValidateInfo) {
    if (!validateInfo) {
      return false;
    }
    const info = this.infos.find(
      (s) => s.name == validateInfo.name && s.saveType == validateInfo.saveType
    );
    if (info) {
      info.rule = validateInfo.rule;
      return true;
    }
    this.infos.push(validateInfo);
    return true;
  }
  get(name: string, saveType: string): Promise<ValidateInfo> {
    const info = this.infos.find(
      (s) => s.name == name && s.saveType == saveType
    );
    if (info && info.rule) {
      return Promise.resolve(info);
    }
    if (this.fetching) {
      return this.fetching;
    }
    this.fetching = this.load(name, saveType)
      .then((r) => {
        const result = { name, saveType, rule: r, validator: null };
        this.infos.push(result);
        return result;
      })
      .finally(() => {
        this.fetching = null;
      });
    return this.fetching;
  }

  private load(name: string, saveType: string) {
    const req = new RequestEntity();
    req.Method = "ApiHomeUrl-Home-GetValidateRule";
    req.Data = JSON.stringify({ Name: name, SaveType: saveType });
    req.IsShowLoading = true;
    return this.apiService.getPromiseData<Res[]>(req);
  }
}
