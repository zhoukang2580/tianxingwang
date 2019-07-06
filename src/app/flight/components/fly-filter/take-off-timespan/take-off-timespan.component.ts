import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  EventEmitter,
  Output,
  OnDestroy
} from "@angular/core";
import { IonRange, DomController } from "@ionic/angular";
import { FilterConditionModel } from "src/app/flight/models/flight/advanced-search-cond/FilterConditionModel";
@Component({
  selector: "app-take-off-timespan",
  templateUrl: "./take-off-timespan.component.html",
  styleUrls: ["./take-off-timespan.component.scss"]
})
export class TakeOffTimespanComponent
  implements OnInit, AfterViewInit, OnDestroy {
  time: "forenoon" | "afternoon" | "none" | "night";
  @Output() sCond: EventEmitter<any>;
  @ViewChild("range") range: IonRange;
  timeSpan: { lower: number; upper: number } = {
    lower: 0,
    upper: 24
  };
  filterCondition: FilterConditionModel;
  constructor(private domCtrl: DomController) {
    this.sCond = new EventEmitter();
  }
  onSearch() {
    this.sCond.emit(this.timeSpan);
  }
  ngOnInit() {}
  reset() {
    this.init();
  }
  private init() {
    setTimeout(() => {
      this.onTimeSelect("none");
      this.changeView();
      this.onSearch();
    }, 100);
  }
  ngOnDestroy() {}
  onTimeSelect(time: "forenoon" | "afternoon" | "none" | "night") {
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
    this.onSearch();
  }
  ngAfterViewInit() {
    this.init();
    this.range.ionChange.subscribe((v: CustomEvent) => {
      // console.dir(v.detail.value);
      this.timeSpan.lower = v.detail.value.lower;
      this.timeSpan.upper = v.detail.value.upper;
      // this.changeView();
      this.onSearch();
    });
  }
  changeView() {
    this.domCtrl.write(() => {
      const r = document.querySelector("ion-range");
      // console.log("r", r);
      if (r) {
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
      }
    });
  }
}
