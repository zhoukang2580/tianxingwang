import { IonContent } from "@ionic/angular";
import { Platform } from "@ionic/angular";
import {
  OnDestroy,
  TemplateRef,
  Input,
  HostBinding,
  AfterContentInit,
  AfterContentChecked
} from "@angular/core";
import { EventEmitter } from "@angular/core";
import { ElementRef, Output } from "@angular/core";
import { AfterViewInit, ViewChild } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import Swiper from "swiper";
@Component({
  selector: "app-swiper-slide-content",
  templateUrl: "./swiper-slide-content.component.html",
  styleUrls: ["./swiper-slide-content.component.scss"]
})
export class SwiperSlideContentComponent
  implements OnInit, AfterViewInit, OnDestroy, AfterContentInit {
  private swiper: any;
  private content: IonContent;
  tab: any;
  @Input() tabs: any[];
  @Output() slideChange: EventEmitter<number>;
  @ViewChild("container", { static: true }) container: ElementRef<HTMLElement>;
  @ViewChild("tabsContainer") tabsContainer: ElementRef<HTMLElement>;
  @ViewChild("tabsWrapper") tabsWrapper: ElementRef<HTMLElement>;
  @ViewChild("swiperPagination", { static: true }) swiperPagination: ElementRef<
    HTMLElement
  >;
  constructor(private plt: Platform, private el: ElementRef<HTMLElement>) {
    this.slideChange = new EventEmitter();
  }
  ngAfterContentInit() {
    // console.log("content check", this.container);
  }
  onSlideTo(idx: number) {
    if (this.swiper) {
      this.swiper.slideTo(idx);
      this.scrollToTop();
    }
  }
  update() {
    if (this.swiper) {
      this.swiper.update();
      requestAnimationFrame(() => {
        this.onSlideTouchEnd(0);
      });
    }
  }
  ngOnInit() {
    console.log("on init");
    this.swiper = new Swiper(this.container.nativeElement, {
      pagination: {
        el: this.swiperPagination.nativeElement
      }
    });
    if (this.swiper) {
      this.swiper.on("slideChange", () => {
        const idx = this.swiper.realIndex;
        this.slideChange.emit(idx);
        this.onSlideTouchEnd(idx);
      });
    }
  }
  ngAfterViewInit() {
    // console.log("after view init", this.container);
    requestAnimationFrame(() => {
      const content = this.el.nativeElement.closest("ion-content");
      this.content = content as any;
      const h =
        this.el.nativeElement.closest("ion-header") ||
        (content && content.parentElement.querySelector("ion-header"));
      if (h) {
        this.tabsWrapper.nativeElement.style.top = h.offsetHeight + "px";
      }
    });
    setTimeout(() => {
      this.update();
    }, 1000);
  }
  ngOnDestroy() {
    if (this.swiper) {
      this.swiper.destroy();
    }
  }
  onActiveTab(tab: any) {
    this.tabs = this.tabs.map(it => {
      it.active = tab.value == it.value;
      return it;
    });
    this.tab = tab;
    this.scrollTabToCenter(tab);
    const idx = this.tabs.indexOf(tab);
    this.onSlideTo(idx);
  }
  private scrollTabToCenter(tab: any) {
    if (this.tabsContainer && this.tabsContainer.nativeElement) {
      const one = this.tabsContainer.nativeElement.querySelector(
        `[dataid='${tab.value}'`
      );
      requestAnimationFrame(() => {
        const rect = one && one.getBoundingClientRect();
        if (rect) {
          const delta = rect.left + rect.width / 2 - this.plt.width() / 2;
          this.tabsContainer.nativeElement.scrollBy({
            left: delta,
            behavior: "smooth"
          });
        }
      });
    }
  }
  onSlideTouchEnd(idx: number) {
    const tab = this.tabs[idx];
    // console.log("idx", idx, tab,this.tabs);
    if (tab) {
      this.tabs = this.tabs.map(t => {
        t.active = tab.value == t.value;
        return t;
      });
      this.scrollTabToCenter(tab);
    }
    this.scrollToTop();
  }
  private scrollToTop() {
    if (this.content) {
      this.content.scrollToTop();
    }
  }
}
