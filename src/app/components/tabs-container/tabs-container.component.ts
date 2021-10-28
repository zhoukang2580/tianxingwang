import {
  Component,
  OnInit,
  Input,
  ViewChildren,
  QueryList,
  ElementRef,
  OnChanges,
  SimpleChanges,
  ViewChild,
  Output,
  EventEmitter,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  TemplateRef,
} from "@angular/core";
import { AppHelper } from "src/app/appHelper";
import { Subscription, fromEvent } from "rxjs";
import { IonSegment, IonSegmentButton } from "@ionic/angular";
import { ThemeService } from "src/app/services/theme/theme.service";
interface ITab {
  isActive: boolean;
  name: string;
  value: string;
  // id?: string;
}
@Component({
  selector: "app-tabs-container",
  templateUrl: "./tabs-container.component.html",
  styleUrls: ["./tabs-container.component.scss"],
})
export class TabsContainerComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() direction: "horizontal" | "vertical" = "horizontal";
  @Input() containerStyle: any;
  @Input() tabs: ITab[];
  @Input() isSegments: boolean;
  @ViewChild("containerEle", { static: true }) containerEle: ElementRef<
    HTMLElement
  >;
  @ViewChildren("tabEle") tabEle: QueryList<ElementRef<HTMLElement>>;
  @ViewChild("segmentEle", { static: true }) segmentEle: IonSegment;
  @ViewChildren("segmentbtnEle") segbtns: QueryList<IonSegmentButton>;
  @Output() activetab: EventEmitter<any>;
  @Output() scroll: EventEmitter<any>;
  @Input() options: {
    displayNameKey: string;
    valueKey: string;
    tabRef: TemplateRef<HTMLElement>;
  };
  activeTab: ITab;
  private isFirstActive = false;
  constructor(
    private render: Renderer2,
    private el: ElementRef<HTMLElement>,
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
    ) {
    this.themeService.getModeSource().subscribe(m=>{
         if(m=='dark'){
           this.refEle.nativeElement.classList.add("dark")
         }else{
           this.refEle.nativeElement.classList.remove("dark")
         }
       })
    this.activetab = new EventEmitter();
    this.scroll = new EventEmitter();
  }

  ngOnDestroy() { }
  ngAfterViewInit() {
    setTimeout(() => {
      this.initMax();
      if (this.tabs && this.tabs.length > 1) {
        const t = this.tabs && this.tabs.find((it) => it.isActive);
        if (t) {
          this.moveActiveTabToCenter();
        }
      }
    }, 200);
  }
  private initMax() {
    try {
      if (this.direction == "horizontal") {
        this.render.setStyle(
          this.containerEle.nativeElement,
          "width",
          `${this.el.nativeElement.parentElement.clientWidth}px`
        );
      } else {
        this.render.setStyle(
          this.containerEle.nativeElement,
          "height",
          `${this.el.nativeElement.parentElement.clientHeight}px`
        );
      }
    } catch (e) {
      console.error(e);
    }
  }
  ngOnInit() { }
  private moveActiveTabToCenter() {
    if (this.isSegments) {
      this.moveSegmentViewToCenter();
    } else {
      this.moveActiveCategoryElToCenter();
    }
  }
  ngOnChanges(change: SimpleChanges) {
    this.isFirstActive = change.tabs && change.tabs.firstChange;
    if (change.tabs && change.tabs.currentValue) {
      this.tabs = this.tabs.map((it, idx) => {
        if (this.options) {
          it.name = it[this.options.displayNameKey];
          it.value = it[this.options.valueKey];
        }
        return {
          ...it,
          id: `${idx}`,
        };
      });
      this.activeTab = this.tabs.find((it) => it.isActive);
    }
  }
  onActiveSegment(evt: CustomEvent) {
    if (!this.isSegments) {
      return;
    }
    const t = this.tabs.find((it) => it.value == evt.detail.value);
    if (t) {
      if (this.activeTab && this.activeTab.value == t.value) {
        return;
      }
      this.onTab(t);
    }
  }
  private moveSegmentViewToCenter() {
    const container: HTMLElement = this.segmentEle["el"];
    const ele = this.segbtns
      .toArray()
      .find(
        (tab) =>
          tab["el"].getAttribute("tabid") ==
          (this.activeTab && this.activeTab.value)
      );
    const activeEl: HTMLElement = ele && ele["el"];
    if (container && activeEl) {
      const rect = activeEl.getBoundingClientRect();
      if (rect) {
        const delta = rect.width / 2 + rect.x - container.clientWidth / 2;
        container.scrollBy({ left: delta, top: 0, behavior: "smooth" });
      }
    }
  }
  onTab(t: ITab) {
    try {
      this.tabs.forEach((it) => {
        it.isActive = it == t;
        return it;
      });
      this.activeTab = this.tabs.find((it) => it.isActive);
      if (this.options) {
        this.activetab.emit({
          ...t,
          [this.options.displayNameKey]: t.name,
          [this.options.valueKey]: t.value,
        });
      }
      this.moveActiveTabToCenter();
    } catch (e) {
      console.error(e);
    }
  }
  private moveActiveCategoryElToCenter() {
    const container: HTMLElement = this.containerEle.nativeElement;
    const ele = this.tabEle
      .toArray()
      .find(
        (tab) =>
          tab.nativeElement.getAttribute("tabid") ==
          (this.activeTab && this.activeTab.value)
      );
    const activeEl: HTMLElement = ele && ele.nativeElement;
    if (container && activeEl) {
      const rect1 = activeEl.getBoundingClientRect();
      if (rect1) {
        if (this.direction == "vertical") {
          const delta = rect1.y - rect1.height / 2 - container.clientHeight / 2;
          container.scrollBy({ top: delta, behavior: "smooth", left: 0 });
        } else {
          const w = container.clientWidth / 2;
          const delta = rect1.x + rect1.width / 2 - w;
          container.scrollBy({ left: delta, behavior: "smooth", top: 0 });
        }
      }
    }
  }
}
