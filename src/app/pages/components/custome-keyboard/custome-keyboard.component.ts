import { AppHelper } from './../../../appHelper';
import {
  EventEmitter,
  ElementRef,
  AfterViewInit,
  HostBinding,
  OnChanges,
  SimpleChange,
  SimpleChanges,
  OnDestroy,
} from "@angular/core";
import { Output } from "@angular/core";
import { Component, OnInit, Input } from "@angular/core";
import { Platform } from "@ionic/angular";
import { Keyboard } from "@ionic-native/keyboard/ngx";
import { Subscription, fromEvent } from "rxjs";

@Component({
  selector: "app-custome-keyboard",
  templateUrl: "./custome-keyboard.component.html",
  styleUrls: ["./custome-keyboard.component.scss"],
})
export class CustomeKeyboardComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  private subscriptions: Subscription[] = [];
  @HostBinding("class.show")
  @Input()
  hasFocus: boolean;
  @Output() hasFocusChange: EventEmitter<any>;
  @Input() title: string;
  @Output() change: EventEmitter<any>;
  @Output() clear: EventEmitter<any>;
  @Output() done: EventEmitter<any>;
  @Input() hasDot = false;
  @Input() hasFocusEle: HTMLElement;
  height = 0;
  keys: number[];
  constructor(
    public el: ElementRef<HTMLElement>,
    private plt: Platform,
    private keybord: Keyboard
  ) {
    this.change = new EventEmitter();
    this.hasFocusChange = new EventEmitter();
    this.clear = new EventEmitter();
    this.done = new EventEmitter();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.height = this.el.nativeElement.clientHeight;
    }, 1000);
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.hasFocusEle && changes.hasFocusEle.currentValue) {
      try {
        const el = this.hasFocusEle["el"] || this.hasFocusEle;
        if (!el) {
          return;
        }
        const rect = el.getBoundingClientRect();
        const delta = rect.top - this.plt.height() / 3;
        const scroller = el.closest("ion-content");
        if (scroller) {
          scroller.scrollByPoint(0, delta, 100);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
  onNumber(n: number | ".", evt: CustomEvent) {
    this.change.emit(n);
    if (evt) {
      evt.stopPropagation();
    }
  }
  onClear(evt: CustomEvent) {
    this.clear.emit();
    if (evt) {
      evt.stopPropagation();
    }
  }
  onDone(evt: CustomEvent) {
    this.done.emit();
    if (evt) {
      evt.stopPropagation();
    }
  }
  ngOnInit() {
    this.subscriptions.push(
      this.keybord.onKeyboardWillShow().subscribe(() => {
        this.hideFocus();
      })
    );
    if (this.plt.is("ios")) {
      this.subscriptions.push(
        fromEvent(document.body, "focusin").subscribe((evt: CustomEvent) => {
          if ((evt.target as HTMLElement) instanceof HTMLInputElement || (evt.target as HTMLElement) instanceof HTMLTextAreaElement) {
            // 软键盘弹出的事件处理
            this.hideFocus();
          }
        })
      );
      this.subscriptions.push(
        fromEvent(document.body, "focusout").subscribe(() => {
          // 软键盘收起的事件处理
        })
      );
    } else {
      if (!AppHelper.isApp()) {
        // 获取原窗口的高度
        const originalHeight =
          document.documentElement.clientHeight || document.body.clientHeight;
        window.onresize = () => {
          // 键盘弹起与隐藏都会引起窗口的高度发生变化
          const resizeHeight =
            document.documentElement.clientHeight || document.body.clientHeight;
          if (resizeHeight < originalHeight) {
            // 当键盘弹起，在此处操作
            this.hideFocus();
          } else {
            // 当键盘收起，在此处操作
          }
        };
      }
    }
    this.keys = [];
    for (let i = 1; i <= 9; i++) {
      this.keys.push(i);
    }
  }
  preventDefault(evt: CustomEvent) {
    evt.stopPropagation();
  }
  private hideFocus() {
    this.hasFocus = false;
    this.hasFocusChange.emit(false);
  }
}
