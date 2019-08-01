import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";

@Component({
  selector: "app-timeline-item",
  templateUrl: "./timeline-item.component.html",
  styleUrls: ["./timeline-item.component.scss"]
})
export class TimelineItemComponent implements OnInit, OnChanges {
  last: boolean;
  constructor() {}
  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes);
  }
  ngOnInit() {}
}
