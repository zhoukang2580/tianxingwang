import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[appShowtip]"
})
export class ShowtipDirective {
  constructor(private el: ElementRef) {}
  @HostListener("click", ["$event"])
  showTip() {
    console.dir(this.el.nativeElement.innerText);
  }
}
