import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-rule-explain",
  templateUrl: "./rule-explain.component.html",
  styleUrls: ["./rule-explain.component.scss"],
})
export class RuleExplainComponent implements OnInit {
  ruleExplain: string;
  constructor() {}

  ngOnInit() {
    this.ruleExplain = (this.ruleExplain || "").replace(/\n/g, "<br/>");
  }
}
