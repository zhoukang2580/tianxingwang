import { Component, OnInit } from '@angular/core';
import { IdentityService } from 'src/app/services/identity/identity.service';
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api/api.service';
import { BaseRequest } from 'src/app/services/api/BaseRequest';

@Component({
  selector: 'app-password-check',
  templateUrl: './password-check.page.html',
  styleUrls: ['./password-check.page.scss'],
})
export class PasswordCheckPage implements OnInit {

  constructor(    
    private identityService: IdentityService,
    private router: Router,
    private apiService: ApiService) { }

  ngOnInit() {
  }

  check()
  {
    // const req = new BaseRequest();
    // req.Method = "method";
    // req.ImageCode = imageCode;
    // req.ImageValue = imageValue;
    // req.Data = JSON.stringify({
    //   Name: name,
    //   Password: password
    // });
    // AppHelper.setStorage("loginName", name);
    // return this.apiService
    //   .getResponse<{
    //     Ticket: string; // "";
    //     Id: string; // ;
    //     Name: string; // "";
    //     IsShareTicket: boolean; // false;
    //     Numbers: { [key: string]: string };
    //   }>(req)
    //   .pipe(
    //     tap(r => console.log("Login", r)),
    //     switchMap(r => {
    //       if (!r.Status) {
    //         return throwError(r.Message);
    //       }
    //       return of(r.Data);
    //     }),
    //     tap(rid => {
    //       const id: IdentityEntity = new IdentityEntity();
    //       id.Name = name;
    //       id.Ticket = rid.Ticket;
    //       id.IsShareTicket = rid.IsShareTicket;
    //       id.Numbers = rid.Numbers;
    //       id.Id = rid.Id;
    //       this.identityService.setIdentity(id);
    //     })
    //   );
  }
}
