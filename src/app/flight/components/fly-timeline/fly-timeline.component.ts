import { FlyTimelineItemComponent } from "./../fly-timeline-item/fly-timeline-item.component";
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
  selector: "app-fly-timeline",
  templateUrl: "./fly-timeline.component.html",
  styleUrls: ["./fly-timeline.component.scss"]
})
export class FlyTimelineComponent
  implements OnInit, AfterViewInit, AfterContentInit {
  @ContentChildren(FlyTimelineItemComponent) timeLineItems: QueryList<
    FlyTimelineItemComponent
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
