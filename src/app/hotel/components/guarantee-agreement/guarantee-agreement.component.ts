import { Component, ElementRef, OnInit } from '@angular/core';
import { AppHelper } from 'src/app/appHelper';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-guarantee-agreement',
  templateUrl: './guarantee-agreement.component.html',
  styleUrls: ['./guarantee-agreement.component.scss'],
})
export class GuaranteeAgreementComponent implements OnInit {

  constructor(
    private refEle:ElementRef<HTMLElement>,
    private themeService:ThemeService,
  ) {
    this.themeService.getModeSource().subscribe(m=>{
      if(m=='dark'){
        this.refEle.nativeElement.classList.add("dark")
      }else{
        this.refEle.nativeElement.classList.remove("dark")
      }
    })
   }

  ngOnInit() {}

  back() {
    AppHelper.modalController.getTop().then((t) => {
      if (t) {
        t.dismiss();
      }
    });
  }
}
