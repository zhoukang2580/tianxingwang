import { delay } from "rxjs/operators";
import { Subscription, fromEvent } from "rxjs";
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
  AfterViewInit,
  OnDestroy,
} from "@angular/core";
import { IonInput } from "@ionic/angular";

@Component({
  selector: "app-add-number",
  templateUrl: "./add-number.component.html",
  styleUrls: ["./add-number.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNumberComponent implements OnInit, AfterViewInit, OnDestroy {
  // @ViewChild("input") inputEl: ElementRef<HTMLInputElement>;
  @ViewChild(IonInput) ionInputEle: IonInput;
  @Input() addNumber = 0;
  @Input() useInput = true;
  @Input() type = "tel";
  @Input() disabled;
  @Input() min: number;
  @Input() max: number;
  @Output() addNumberChange: EventEmitter<number>;
  @Output() focus: EventEmitter<number>;
  private preValue: any;
  private subscriptions: Subscription[] = [];
  constructor() {
    this.addNumberChange = new EventEmitter();
    this.focus = new EventEmitter();
  }
  onAdd(n: number, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (this.disabled) {
      return;
    }
    this.addNumber = +this.addNumber + n;
    if (n < 0) {
      if (this.min) {
        this.addNumber = Math.max(this.addNumber, this.min);
      }
    } else {
      if (this.max) {
        this.addNumber = Math.min(this.addNumber, this.max);
      }
    }
    if (this.preValue != this.addNumber) {
      this.preValue = this.addNumber;
      this.addNumberChange.emit(this.addNumber);
    }
  }
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onHasFocus(evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    if (this.disabled) {
      return;
    }
    this.focus.emit();
  }
  ngOnInit() {
    this.preValue = this.addNumber;
  }
  async ngAfterViewInit() {
    if (this.ionInputEle) {
      const el = await this.ionInputEle.getInputElement();
      this.subscriptions.push(
        fromEvent(el, "focus")
          .pipe(delay(0))
          .subscribe(() => {
            el.value = "";
          })
      );
      this.subscriptions.push(
        fromEvent(el, "blur")
          .pipe(delay(0))
          .subscribe(() => {
            if (!el.value) {
              el.value = `${this.min || ""}`;
            }
          })
      );

      this.subscriptions.push(
        fromEvent(el, "change").subscribe(() => {
          this.addNumber = +el.value;
          if (this.min) {
            this.addNumber = Math.max(this.addNumber, this.min);
          }
          if (this.max) {
            this.addNumber = Math.min(this.addNumber, this.max);
          }
          this.addNumberChange.emit(this.addNumber);
        })
      );
    }
  }
}
