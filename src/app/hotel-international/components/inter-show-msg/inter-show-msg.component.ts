import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-show-msg",
  templateUrl: "./inter-show-msg.component.html",
  styleUrls: ["./inter-show-msg.component.scss"]
})
export class InterShowMsgComponent implements OnInit {
  msg: string;
  constructor() {}

  ngOnInit() {}
}
