import { Component, OnInit } from "@angular/core";
@Component({
  selector: "app-trip-rule-popover",
  templateUrl: "./trip-rule-popover.component.html",
  styleUrls: ["./trip-rule-popover.component.scss"]
})
export class TripRulePopoverComponent implements OnInit {
  ticketRefundText: string;
  ticketChangingText: string;
  ticketEndorsementText: string;
  constructor() {}

  ngOnInit() {}
}
