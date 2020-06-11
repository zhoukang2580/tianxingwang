import {
  Component,
  OnInit,
  Optional,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  TemplateRef,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { IonTabs } from "@ionic/angular";
import { Subscription, fromEvent } from "rxjs";
import { SystemsMenus, MenusService } from "src/app/components/menu-popover/menus.service";

@Component({
  selector: "app-menu-popover",
  templateUrl: "./menu-popover.component.html",
  styleUrls: ["./menu-popover.component.scss"],
})
export class MenuPopoverComponent implements OnInit, AfterViewInit, OnDestroy {
  // tslint:disable-next-line: variable-name
  private timer: any;
  private timerTime = 700;
  private time = 0;
  private subscriptions: Subscription[] = [];
  @ViewChildren("menuEle") menuEles: QueryList<ElementRef<HTMLElement>>;
  private _isShowMenu = false;
  bottom = 0;
  @Input() showTips;
  @Input() set isShowMenu(value: boolean) {
    this._isShowMenu = value;
    if (!this.bottom) {
      let el = this.tabsEl && this.tabsEl.tabBar["el"];
      if (!this.el) {
        el = this.el.nativeElement.parentElement.querySelector(
          "ion-tab-bar"
        ) as any;
      }
      if (!el && this.tplRef && this.tplRef.elementRef) {
        el = this.tplRef.elementRef.nativeElement;
      }
      setTimeout(() => {
        this.bottom = (el && el.clientHeight) || 0;
        console.log("this.bottom ", this.bottom);
      }, 0);
    }
  }
  get isShowMenu() {
    return this._isShowMenu;
  }
  @Input() systems: SystemsMenus[];
  @Output() isShowMenuChange: EventEmitter<any>;
  @Input() tplRef: TemplateRef<HTMLElement>;
  @Output() menuClick: EventEmitter<any>;

  constructor(
    @Optional() private tabsEl: IonTabs,
    private el: ElementRef<HTMLElement>
  ) {
    this.isShowMenuChange = new EventEmitter();
    this.menuClick = new EventEmitter();
  }
  onMenuClick(m: SystemsMenus) {
    this.onHideMenu();
    this.menuClick.emit(m);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnInit() {}
  onHideMenu() {
    this.isShowMenu = false;
    this.isShowMenuChange.emit(this.isShowMenu);
  }
  ngAfterViewInit() {
    this.menuEles.changes.subscribe(() => {
      this.menuEles.toArray().forEach((el) => {
        if (el.nativeElement) {
          this.subscriptions.push(
            fromEvent(el.nativeElement, "touchstart").subscribe(() => {})
          );
        }
      });
    });
  }
}
