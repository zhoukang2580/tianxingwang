import { LanguageHelper } from "./../languageHelper";
import { ToastController } from "@ionic/angular";
import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[appShowtip]"
})
export class ShowtipDirective {
  constructor(private el: ElementRef, private toastCtrl: ToastController) {}
  @HostListener("click", ["$event"])
  async showTip() {
    try {
      let div = document.getElementById("calcTextWidttDiv");
      if (!div) {
        div = document.createElement("div");
        div.id = "calcTextWidttDiv";
        div.style.display = "none";
        div.style.fontFamily =
          window.getComputedStyle(this.el.nativeElement).fontFamily ||
          "inherit";
        div.style.fontSize =
          window.getComputedStyle(this.el.nativeElement).fontSize || "16px";
        div.style.whiteSpace = "nowrap";
        div.style.display = "inline-block";
        document.body.append(div);
      }
      // console.log(div.style.fontSize, div.style.fontFamily);
      div.innerText = this.el.nativeElement.innerText;
      const width = div.clientWidth;
      // console.log(width, this.el.nativeElement.clientWidth);
      // console.dir(this.el.nativeElement.innerText);
      if (this.el.nativeElement.clientWidth > div.clientWidth) {
        return;
      }
      let toast = await this.toastCtrl.getTop();
      if (toast) {
        toast.dismiss();
      } else {
        const duration =
          Math.floor(`${this.el.nativeElement.innerText}`.length / 22) * 2000;
        console.log(duration);
        (toast = await this.toastCtrl.create({
          message: this.el.nativeElement.innerText,
          position: "middle",
          // showCloseButton: true,
          // mode:"md",
          keyboardClose: true,
          translucent:true,
          closeButtonText: LanguageHelper.getCloseTip(),
          duration: Math.min(duration || 2000, 10 * 1000)
        })).present();
        if (toast) {
          toast.onclick = () => {
            toast.dismiss();
          };
        }
      }
    } catch (e) {
      console.error(e);
    }
  }
}
