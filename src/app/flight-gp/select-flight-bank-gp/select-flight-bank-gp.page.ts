import { Component, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonApp, IonContent, IonHeader, IonItemDivider } from '@ionic/angular';
import { from } from 'rxjs';
import { AppHelper } from 'src/app/appHelper';
import { FlightGpService } from '../flight-gp.service';
import { AccountCardEntity } from '../models/AccountCardEntity';

@Component({
  selector: 'app-select-flight-bank-gp',
  templateUrl: './select-flight-bank-gp.page.html',
  styleUrls: ['./select-flight-bank-gp.page.scss'],
})
export class SelectFlightBankGpPage implements OnInit {

  @ViewChild("maincnt", { static: true }) ionContent: IonContent;
  @ViewChild(IonHeader) headerEle: IonHeader;
  @ViewChildren("letter") letterEles: QueryList<IonApp>;

  accountCardEntity: AccountCardEntity[];

  hotList: any[] = [];
  letterList: any[];
  letterDateList: any[] = [];


  businessList: any;

  constructor(
    private flightGp:FlightGpService,
    private router:Router
  ) { }

  async ngOnInit() {
    try {
      this.accountCardEntity = await this.flightGp.getIssuingBank().then((r)=>{
        if(r && r.length){
          console.log(r);
        }
        return r;
      });
      this.hotBank();
      this.onLetter();
      // console.log(this.bankDateEntity);
    } catch (error) {
      console.error(error);
    }

  }

  hotBank() {
    if (this.accountCardEntity) {
      this.hotList = this.accountCardEntity.filter(it => it.Description == "T");
      console.log(this.hotList);
    }
  }

  onLetter() {
    const cmap = this.getLeterBank(this.accountCardEntity);
    this.getLetterNavs(cmap);
  }
  getLeterBank(letters) {
    const cmap = {};
    if (letters) {
      letters.forEach((c) => {
        c.Tag = (c.Tag || "").substr(0, 1).toUpperCase();
        const arr = cmap[c.Tag];
        if (arr) {
          if (!arr.find((it) => it.Name == c.Name)) {
            arr.push(c);
          }
        } else {
          cmap[c.Tag] = [c];
        }
      });
    }
    this.businessList = cmap;
    // console.log(cmap, 'cmap')
    return cmap;
  }


  getLetterNavs(cmap) {
    const letters = Object.keys(cmap);
    letters.sort();
    this.letterList = letters;
    if (letters && letters.length) {
      letters.forEach((l) => {
        const arr = cmap[l];
        if (arr) {
          // console.log(arr, 'arr');
          arr.forEach((c) => {
            this.letterDateList.push(c);
          });
        }
      });
    }
    // console.log(this.letterDateList, 'letter')
  }

  async onLetterClick(letter, evt?: CustomEvent) {
    if (evt) {
      evt.stopPropagation();
    }
    try {
      const arr = this.letterEles.toArray();
      console.log(arr,'arr');
      const ele = arr.find((it) => it["el"].getAttribute("letter") == letter);
      const rect = ele["el"].getBoundingClientRect();
      const headerEle = this.headerEle["el"].clientHeight;
      // console.log(letter, rect, rect.top, rect.height, headerEle);
      let y = 0;
      y = rect.top - headerEle;
      this.ionContent.scrollByPoint(0, y, 300);
    } catch (e) {
      console.error(e);
    }
    console.log(letter);
  }

  onSelect(s){
    console.log("所选的发卡行:"+s.Name);
    
  }

}

