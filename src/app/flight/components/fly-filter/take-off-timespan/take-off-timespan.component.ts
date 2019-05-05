import { Subject, Subscription } from "rxjs";
import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Output,
  Input,
  OnDestroy
} from "@angular/core";
import { IonRange } from "@ionic/angular";
@Component({
  selector: "app-take-off-timespan",
  templateUrl: "./take-off-timespan.component.html",
  styleUrls: ["./take-off-timespan.component.scss"]
})
export class TakeOffTimespanComponent
  implements OnInit, AfterViewInit, OnDestroy {
  time: "forenoon"  | "afternoon" | "none"|"night";
  @Output()
  userOp: EventEmitter<boolean>; // 用户是否点击过
  @Output()
  sCond: EventEmitter<any>; // 用户是否点击过
  @Input()
  resetSj: Subject<boolean>;
  resetSub = Subscription.EMPTY;
  @ViewChild("range")
  range: IonRange;
  timeSpan: { lower: number; upper: number };
  constructor() {
    this.userOp = new EventEmitter();
    this.sCond = new EventEmitter();
  }

  onSearch() {
    this.sCond.emit(this.timeSpan);
  }
  ngOnInit() {
    this.onTimeSelect("none");
    this.resetSub = this.resetSj.subscribe(reset => {
      if (reset) {
        this.onTimeSelect("none");
        setTimeout(() => {
          this.userOp.emit(false);
        }, 100);
      }
    });
  }
  ngOnDestroy() {
    this.resetSub.unsubscribe();
  }
  onTimeSelect(time: "forenoon" | "afternoon" | "none"|"night") {
    this.time = time;
    switch (this.time) {
      case "forenoon": {
        this.range.value = { lower: 0, upper: 12 };
        this.changeView();
        break;
      }
      case "afternoon": {
        this.range.value = { lower: 12, upper: 18 };
        this.changeView();
        break;
      }
      case "night": {
        this.range.value = { lower: 18, upper: 24 };
        this.changeView();
        break;
      }
      default: {
        this.range.value = { lower: 0, upper: 24 };
        this.changeView();
        break;
      }
    }
  }
  ngAfterViewInit() {
    this.range.ionChange.subscribe((v: CustomEvent) => {
      // console.dir(v.detail.value);
      this.timeSpan = v.detail.value;
      this.changeView();
      this.userOp.emit(true);
      this.onSearch();
    });
  }
  changeView() {
    const r = document.querySelector("ion-range");
    // console.log("r", r);
    if (r) {
      setTimeout(() => {
        const s = r.shadowRoot.querySelector(".range-slider");
        // console.log("s", s);
        if (s) {
          const handles = s.querySelectorAll(".range-knob-handle");
          // console.log("handles", handles);
          if (handles) {
            for (let i = 0; i < handles.length; i++) {
              const handle = handles[i];
              handle.classList.add("range-knob-pressed");
              handle["style"].zIndex = 888;
            }
            const pins = r.shadowRoot.querySelectorAll(".range-pin");
            if (pins) {
              for (let i = 0; i < pins.length; i++) {
                const pin = pins[i];
                pin["style"]["transform"] = "none";
                pin["style"]["transition"] = "none";
              }
            }
          }
        }
      }, 888);
    }
  }
}
