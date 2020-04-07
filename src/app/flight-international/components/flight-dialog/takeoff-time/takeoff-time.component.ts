import { Component, OnInit, ViewChild } from '@angular/core';
import { IonRange, DomController } from '@ionic/angular';

@Component({
  selector: 'app-takeoff-time',
  templateUrl: './takeoff-time.component.html',
  styleUrls: ['./takeoff-time.component.scss'],
})
export class TakeoffTimeComponent implements OnInit {
  time: "forenoon" | "afternoon" | "none" | "night";
  @ViewChild("range") range: IonRange;


  constructor(private domCtrl: DomController) { }

  ngOnInit() {}
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
    // this.search();
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
