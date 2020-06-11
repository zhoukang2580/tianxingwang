import { Directive, ElementRef, OnInit, OnDestroy, Input, HostBinding, HostListener, TemplateRef, PlatformRef, Renderer2 } from '@angular/core';
import { Platform } from '@ionic/angular';

@Directive({
  selector: '[appShowMenus]'
})
export class ShowMenusDirective implements OnInit, OnDestroy {
  @Input() appShowMenus: string;
  @Input() templateRef: TemplateRef<any>;
  private menusEl: HTMLElement;
  constructor(private el: ElementRef<HTMLElement>, private plt: Platform, private render: Renderer2) { }
  ngOnInit() {
    this.closeOthers();
    this.menusEl = this.appShowMenus ? document.querySelector(`.${this.appShowMenus}`) : null;
    if (!this.appShowMenus) {
      if (this.menusEl) {
        document.body.removeChild(this.menusEl);
      }
    }
    if (!this.menusEl) {
      this.menusEl = document.createElement("div");
      this.menusEl.classList.add(`show-menus-directive`);
      if (this.appShowMenus) {
        this.menusEl.classList.add(this.appShowMenus);
      }
      if (this.templateRef) {
        const v = this.templateRef.createEmbeddedView({})
        for (const n of v.rootNodes as HTMLElement[]) {
          n.onclick = (evt: any) => {
            evt.stopPropagation();
            this.onCloseSelf();
          }
          this.menusEl.appendChild(n);
        }
      }
      document.body.appendChild(this.menusEl);
    }
  }
  onCloseSelf() {
    this.menusEl.classList.toggle("show", false);
  }
  @HostListener('click', ['$event'])
  private onShow(evt: CustomEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.closeOthers();
    this.positionMenuPanel();
    const show = this.menusEl.classList.contains('show');
    // console.log(this.menusEl.classList,show);
    this.menusEl.classList.toggle("show", !show);
  }
  private positionMenuPanel() {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const mRect = this.menusEl.getBoundingClientRect();
    const half = (mRect && mRect.width) / 2;
    let isShowTop = true;
    if (rect) {
      isShowTop = rect.y > this.plt.height() / 2;
      if (isShowTop) {
        this.render.setStyle(this.menusEl, 'bottom', `${this.plt.height() - rect.y}px`);
      } else {
        this.render.setStyle(this.menusEl, 'top', `${rect.bottom}px`);
      }
      const left = rect.width / 2 + rect.left;
      this.render.setStyle(this.menusEl, 'left', `${left}px`);
      this.render.setStyle(this.menusEl, 'transform', `translateX(-${half}px)`)
    }
  }
  private closeOthers() {
    const all = document.querySelectorAll(".show-menus-directive");
    if (!all) {
      return;
    }
    for (let i = 0; i < all.length; i++) {
      const el = all.item(i);
      if (el == this.menusEl) {
        continue;
      }
      if (el) {
        el.classList.toggle("show", false);
      }
    }
  }
  ngOnDestroy() {
    // if (this.menusEl) {
    //   try {
    //     document.body.removeChild(this.menusEl);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // }
  }

}
