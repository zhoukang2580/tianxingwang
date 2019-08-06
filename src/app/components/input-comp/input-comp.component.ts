import { Component, OnInit, Input } from "@angular/core";

@Component({
  selector: "app-input-comp",
  templateUrl: "./input-comp.component.html",
  styleUrls: ["./input-comp.component.scss"]
})
export class InputCompComponent implements OnInit {
  @Input() type: string;
  constructor() {}

  ngOnInit() {}
}
