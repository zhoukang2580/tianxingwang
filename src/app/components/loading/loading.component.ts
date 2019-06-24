import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  HostBinding
} from "@angular/core";

@Component({
  selector: "app-loading-comp",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.scss"]
})
export class LoadingComponent implements OnInit, OnChanges {
  @HostBinding("class.loading")
  @Input() loading: boolean;
  constructor() {}

  ngOnInit() {
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(this.loading, changes.loading);
  }
}
