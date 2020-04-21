import { TimelineItemComponent } from "../timeline-item/timeline-item.component"
import {
  Component,
  OnInit,
  QueryList,
  ContentChildren,
  AfterViewInit,
  AfterContentInit,
  Input
} from "@angular/core";

@Component({
  selector: "app-timeline",
  templateUrl: "./timeline.component.html",
  styleUrls: ["./timeline.component.scss"]
})
export class TimelineComponent
  implements OnInit, AfterViewInit, AfterContentInit {
  @ContentChildren(TimelineItemComponent) timeLineItems: QueryList<
    TimelineItemComponent
  >;
  @Input() hideLastTimeLineTail = true;
  constructor() {}

  ngOnInit() {}
  ngAfterContentInit() {
    if (this.timeLineItems && this.timeLineItems.length) {
      this.changeChildren();
    }
    if (this.timeLineItems) {
      this.timeLineItems.changes.subscribe(() => {
        this.changeChildren();
      });
    }
  }
  changeChildren() {
    this.timeLineItems.forEach((item, index) => {
      // console.log(index);
      if (index === this.timeLineItems.length - 1) {
        setTimeout(() => {
          item.last = true && this.hideLastTimeLineTail;
        }, 0);
      }
    });
  }
  ngAfterViewInit() {}
}
