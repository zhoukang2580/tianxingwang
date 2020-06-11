import { Component, OnInit, Input, Optional, Attribute, ElementRef } from "@angular/core";

@Component({
  selector: "app-list-item",
  templateUrl: "./list-item.component.html",
  styleUrls: ["./list-item.component.scss"],
})
export class ListItemComponent implements OnInit {
  @Input() medium: string;
  @Input() label: string;
  @Input() textwrap: string;
  @Input() text: string;
  @Input() size = 3;
  clazz: any;
  ngstyle: any;
  constructor(private el: ElementRef<HTMLElement>) {
  }

  ngOnInit() {
    this.clazz = {};
    if (this.el.nativeElement.classList && this.el.nativeElement.classList.length) {
      this.el.nativeElement.classList.forEach(c => {
        this.clazz[c] = true;
      })
    }
  }
}
