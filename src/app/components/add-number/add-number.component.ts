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
  OnDestroy
} from "@angular/core";

@Component({
  selector: "app-add-number",
  templateUrl: "./add-number.component.html",
  styleUrls: ["./add-number.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddNumberComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("input") inputEl: ElementRef<HTMLInputElement>;
  @Input() addNumber = 0;
  @Input() min: number;
  @Input() max: number;
  @Output() addNumberChange: EventEmitter<number>;
  private subscriptions: Subscription[] = [];
  constructor() {
    this.addNumberChange = new EventEmitter();
  }
  onAdd(n: number, evt: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    this.addNumber += n;
    if (n < 0) {
      if (this.min) {
        this.addNumber = Math.max(this.addNumber, this.min);
      }
    } else {
      if (this.max) {
        this.addNumber = Math.min(this.addNumber, this.max);
      }
    }
    this.addNumberChange.emit(this.addNumber);
  }
  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  ngOnInit() {}
  ngAfterViewInit() {
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
