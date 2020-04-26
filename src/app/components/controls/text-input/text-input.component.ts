import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
  OnDestroy,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { Subscription, fromEvent } from "rxjs";

@Component({
  selector: "app-text-input",
  templateUrl: "./text-input.component.html",
  styleUrls: ["./text-input.component.scss"],
})
export class TextInputComponent implements OnInit, OnDestroy,OnChanges {
  private subscriptions: Subscription[] = [];
  @Input() validateName: string;
  @Input() label: string;
  @Input() barModel: string;
  @Input() placeholder: string;
  @Input() debounceTime = 0;
  @Output() textChange: EventEmitter<string>;
  @Output() barModelChange: EventEmitter<string>;
  private timeoutid: any;
  @ViewChild("inputEl", { static: true }) inputEl: ElementRef<HTMLInputElement>;
  constructor() {
    this.textChange = new EventEmitter();
    this.barModelChange = new EventEmitter();
  }
  ngOnChanges(c: SimpleChanges) {
    if (c && c.barModel && this.inputEl && this.inputEl.nativeElement) {
      this.inputEl.nativeElement.value = this.barModel;
    }
  }
  ngOnInit() {
    let flag = true;
    this.subscriptions.push(
      fromEvent(this.inputEl.nativeElement, "compositionstart", {
        passive: true,
      }).subscribe(() => {
        flag = false;
      })
    );
    this.subscriptions.push(
      fromEvent(this.inputEl.nativeElement, "compositionend", {
        passive: true,
      }).subscribe(() => {
        flag = true;
        this.debounceTime = 300;
      })
    );
    this.subscriptions.push(
      fromEvent(this.inputEl.nativeElement, "input", {
        passive: true,
      })
        .pipe()
        .subscribe(() => {
          this.debounceTime = 0;
          const txt = this.inputEl.nativeElement.value || "";
          if (!txt.trim().length) {
            setTimeout(() => {
              this.notifyTextChange(txt);
            }, 0);
          } else {
            setTimeout(() => {
              if (flag) {
                this.notifyTextChange(txt);
              }
            }, 0);
          }
        })
    );
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onClearText() {
    this.inputEl.nativeElement.value = "";
    this.barModel = "";
  }
  private notifyTextChange(text: string) {
    text = text || this.inputEl.nativeElement.value || "";
    this.textChange.emit(text);
    if (this.timeoutid) {
      clearTimeout(this.timeoutid);
    }
    if (this.debounceTime) {
      this.timeoutid = setTimeout(() => {
        this.textChange.emit(text);
      }, this.debounceTime);
    } else {
      this.textChange.emit(text);
    }
  }
}
