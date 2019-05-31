import { Component, OnInit } from '@angular/core';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { RequestEntity } from 'src/app/services/api/Request.entity';
import { AppHelper } from 'src/app/appHelper';
import { tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-password-check',
  templateUrl: './password-check.page.html',
  styleUrls: ['./password-check.page.scss'],
})
export class PasswordCheckPage implements OnInit {
  isShowImageCode:boolean;
  message:string;
  name:string;
  constructor(    
    private identityService: IdentityService,
    private router: Router,
    private apiService: ApiService) { }

  ngOnInit() {
   this.identityService.getIdentity().then(r=>{
     if(r && r.Id)
     {
      this.check();
     }
   });

  }
  showImageCode(type:string)
  {
    
    this.isShowImageCode=true;
  }
  onSlideEvent(valid: boolean) {
    if (valid) {
      this.check();
      this.isShowImageCode=false;
    } 
  }

  check()
  {
    debugger;
    const req = new RequestEntity();
    req.Method = "ApiPasswordUrl-Home-Action";
    req.Data = JSON.stringify({
      Name: this.name,
      Action:"Check"
    });
    const des= this.apiService
      .getResponse<{
        ValidTypes: []; // "";
        AccountId: string; // ;

      }>(req)
      .pipe(
        switchMap(r => {
          if (!r.Status) {
            this.message=r.Message;
            return of(r.Data);
          }
          if(r.Data)
          {
            this.router.navigate([AppHelper.getRoutePath("password-valid"),{Name: this.name, ValidTypes:JSON.stringify(r.Data.ValidTypes)}]);
          }
          return of(r.Data);
        }),
        tap(rid => {
        
        })
      ).subscribe(r=>{},
        (e)=>{},
        ()=>{
        des.unsubscribe();
      });
  }
}
