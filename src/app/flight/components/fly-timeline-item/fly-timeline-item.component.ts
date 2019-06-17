import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";

@Component({
  selector: "app-fly-timeline-item",
  templateUrl: "./fly-timeline-item.component.html",
  styleUrls: ["./fly-timeline-item.component.scss"]
})
export class FlyTimelineItemComponent implements OnInit, OnChanges {
  last: boolean;
  constructor() {}
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
  }
  ngOnInit() {}
}
