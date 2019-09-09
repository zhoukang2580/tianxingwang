import { Component, OnInit, Input } from "@angular/core";
import { RoomEntity } from "../../models/RoomEntity";

@Component({
  selector: "app-room-detail",
  templateUrl: "./room-detail.component.html",
  styleUrls: ["./room-detail.component.scss"]
})
export class RoomDetailComponent implements OnInit {
  @Input() room: RoomEntity;
  @Input() roomImages: string[];
  constructor() {}

  ngOnInit() {}
}
