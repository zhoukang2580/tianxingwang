import { state } from '@angular/animations';
import * as md5 from "md5";
import * as moment from "moment";
import { environment } from "src/environments/environment";
import { UrlSegment, UrlSegmentGroup, Route } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { LanguageHelper } from './languageHelper';
import { AppHelper } from './appHelper';
import { RequestEntity } from './services/api/Request.entity';
 
export class DingtalkHelper {
  

  static unionId:string;
  
  
}
