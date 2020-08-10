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

@Component({
  selector: "app-add-number",
  templateUrl: "./add-number.component.html",
  styleUrls: ["./add-number.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddNumberComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("input") inputEl: ElementRef<HTMLInputElement>;
  @Input() addNumber = 0;
  @Input() useInput = true;
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
    this.preValue=this.addNumber;
  }
  ngAfterViewInit() {
    if (this.inputEl) {
      this.subscriptions.push(
        fromEvent(this.inputEl.nativeElement, "focus")
          .pipe(delay(0))
          .subscribe(() => {
            this.inputEl.nativeElement.select();
          })
      );
      this.subscriptions.push(
        fromEvent(this.inputEl.nativeElement, "change").subscribe(() => {
          this.addNumber = +this.inputEl.nativeElement.value;
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
