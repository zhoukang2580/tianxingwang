import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  HostBinding,
  ElementRef
} from "@angular/core";
import { Platform } from "@ionic/angular";

@Component({
  selector: "app-loading-comp",
  templateUrl: "./loading.component.html",
  styleUrls: ["./loading.component.scss"]
})
export class LoadingComponent implements OnInit, OnChanges {
  @HostBinding("class.loading")
  @Input()
  loading: boolean;
  constructor(private el: ElementRef<HTMLElement>, private plt: Platform) {}

  ngOnInit() {
    if (window["hcp"] && this.plt.is("android")) {
      window["hcp"].getStatusBarHeight().then(sh => {
        this.el.nativeElement.style.marginTop = -sh + "px";
      });
    }
  }
  ngOnChanges(changes: SimpleChanges) {
    // console.log(this.loading, changes.loading);
  }
}
