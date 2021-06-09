import { Output, EventEmitter } from "@angular/core";
import { Renderer2 } from "@angular/core";
import { Platform } from "@ionic/angular";
import { TemplateRef } from "@angular/core";
import { OnDestroy, HostListener, Input } from "@angular/core";
import { Subscription } from "rxjs";
import { OnInit } from "@angular/core";
import { Directive, ElementRef } from "@angular/core";

@Directive({
  selector: "[appLongPressShowpop]",
})
export class LongPressShowpopDirective {
  private timer: any;
  private lastTime = 0;
  private longPressTime = 700;
  private menuEl: HTMLElement;
  @Input() set show(value: boolean) {
    console.log("longpress show " + value);
    if (!value) {
      if (this.menuEl) {
        this.menuEl.classList.toggle("show", false);
      }
    }
  }
  @Output() longPress: EventEmitter<any>;
  @Output() menuclick: EventEmitter<any>;
  @Output() showChange: EventEmitter<any>;
  @Input() showTips: { msg: string; action: (attrdata: any) => any }[];
  @HostListener("touchstart", ["$event"])
  onTouchStart(evt: any) {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.lastTime = Date.now();
    this.timer = setTimeout(() => {
      if (evt) {
        evt.preventDefault();
      }
      this.el.nativeElement.classList.toggle("long-pressed", true);
      this.longPress.emit();
      if (!evt.touches.length || evt.touches.length > 1 || !this.showTips) {
        return;
      }
      const target = evt.touches[0].target as HTMLElement;
      this.showMenus(target);
    }, this.longPressTime);
  }
  @HostListener("touchend", ["$event"])
  onTouchEnd(evt: any) {
    try {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      // console.log(evt);
      const target = evt.target as HTMLElement;
      const delta = Date.now() - this.lastTime;
      const isShow = delta >= this.longPressTime;
      if(!isShow){
        this.menuclick.emit();
      }
      this.lastTime = Date.now();
      if (!this.showTips || !isShow) {
        return;
      }
      evt.preventDefault();
      this.longPress.emit();
      this.el.nativeElement.classList.toggle("long-pressed", true);
      this.showMenus(target);
    } catch (e) {
      console.error(e);
    }
  }
  constructor(
    private el: ElementRef<HTMLElement>,
    private plt: Platform,
    private render: Renderer2
  ) {
    this.showChange = new EventEmitter();
    this.longPress = new EventEmitter();
    this.menuclick = new EventEmitter();
  }
  private showMenus(target: HTMLElement) {
    if (!target) {
      return;
    }
    try {
      const rect = target && target.getBoundingClientRect();
      const id = `longPressedMenus`;
      if (rect) {
        let menus = document.getElementById(`${id}`);
        if (menus) {
          document.body.removeChild(menus);
        }
        menus = document.createElement("div");
        menus.classList.add("long-press-menus");
        menus.classList.toggle("show", true);
        menus.id = id;
        this.showTips.forEach((it, idx) => {
          const menu = document.createElement("div");
          menu.classList.add("menu");
          menu.onclick = () => {
            if (typeof it.action === "function") {
              it.action(this.el.nativeElement.getAttribute("data"));
            }
            menus.classList.toggle("show", false);
          };
          menu.textContent = `${it.msg}`;
          menus.appendChild(menu);
        });
        document.body.appendChild(menus);
        this.menuEl = menus;
        this.positionMenuPanel(this.menuEl);
      }
    } catch (e) {
      console.error(e);
    }
  }
  private positionMenuPanel(menusEl: HTMLElement) {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const mRect = menusEl && menusEl.getBoundingClientRect();
    const half = (mRect && mRect.width) / 2;
    let isShowTop = true;
    if (rect) {
      isShowTop = rect.top > this.plt.height() / 2;
      if (isShowTop) {
        this.render.setStyle(
          menusEl,
          "bottom",
          `${this.plt.height() - rect.top}px`
        );
      } else {
        this.render.setStyle(menusEl, "top", `${rect.bottom}px`);
      }
      const left = rect.width / 2 + rect.left;
      this.render.setStyle(menusEl, "left", `${left}px`);
      this.render.setStyle(menusEl, "transform", `translateX(-${half}px)`);
    }
  }
}
