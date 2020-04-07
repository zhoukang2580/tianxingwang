import { Directive, ElementRef, HostListener, Renderer2 } from "@angular/core";

@Directive({
  selector: "[appAutoGrow]"
})
export class AutoGrowDirective {
  @HostListener("input", ["$event"])
  onchange(evt: any) {
    // console.log(evt);
    console.log(this.el.nativeElement.scrollHeight);
    this.render.setStyle(
      this.el.nativeElement,
      "height",
      `${this.el.nativeElement.scrollHeight}px`
    );
  }
  constructor(
    private el: ElementRef<HTMLInputElement | HTMLTextAreaElement>,
    private render: Renderer2
  ) {
  }
}
