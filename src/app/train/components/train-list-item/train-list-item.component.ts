import { Component, OnInit, Input } from "@angular/core";
import { TrainEntity } from "../../models/TrainEntity";

@Component({
  selector: "app-train-list-item",
  templateUrl: "./train-list-item.component.html",
  styleUrls: ["./train-list-item.component.scss"]
})
export class TrainListItemComponent implements OnInit {
  @Input() train: TrainEntity;
  constructor() {}

  ngOnInit() {}
}
