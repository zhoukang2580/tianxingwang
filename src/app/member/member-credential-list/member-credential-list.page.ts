import { AppHelper } from "src/app/appHelper";
import { Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";
import { CalendarService } from "src/app/tmc/calendar.service";
import { IdentityService } from "src/app/services/identity/identity.service";
import { RefresherComponent } from "src/app/components/refresher";
import { MemberService, MemberCredential } from "./../member.service";
import { OnDestroy, ViewChild } from "@angular/core";
import { Component, OnInit } from "@angular/core";
import { TmcService } from "src/app/tmc/tmc.service";
import { CountryEntity } from "src/app/tmc/models/CountryEntity";

@Component({
  selector: "app-member-credential-list",
  templateUrl: "./member-credential-list.page.html",
  styleUrls: ["./member-credential-list.page.scss"],
})
export class MemberCredentialListPage implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private countries: CountryEntity[];
  credentials: MemberCredential[];
  isLoading = false;
  @ViewChild(RefresherComponent) refresher: RefresherComponent;
  constructor(
    private memberService: MemberService,
    private tmcService: TmcService,
    private calendarService: CalendarService,
    private router: Router,
    private route: ActivatedRoute,
    private identityService: IdentityService
  ) {}
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
  onAdd() {
    this.router.navigate(
      [AppHelper.getRoutePath("member-credential-management")],
      { queryParams: { addNew: "true" } }
    );
  }
  ngOnInit() {
    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.doRefresh();
      })
    );
  }
  doRefresh() {
    this.getCredentials();
  }
  onDetailPage(c: MemberCredential) {
    this.router.navigate(
      [AppHelper.getRoutePath("member-credential-management")],
      { queryParams: { data: JSON.stringify(c) } }
    );
  }
  private async loadCountries() {
    await this.tmcService.getCountries().then((cs) => {
      this.countries = cs;
    });
  }
  private getCountryName(code: string) {
    const country =
      this.countries && this.countries.find((it) => it.Code == code);
    return country && country.Name;
  }
  private async getCredentials() {
    this.isLoading = true;
    const identity = await this.identityService
      .getIdentityAsync()
      .catch((_) => null);
    if (!identity) {
      return (this.credentials = []);
    }
    const credentials = await this.memberService.getCredentials(
      identity && identity.Id
    );
    this.refresher.complete();
    if (!this.countries || !this.countries.length) {
      await this.loadCountries();
    }
    this.credentials = credentials.map((c) => {
      return {
        ...c,
        Country: c.Country,
        showCountry: {
          Code: c.Country,
          Name: this.getCountryName(c.Country),
        },
        IssueCountry: c.IssueCountry,
        showIssueCountry: {
          Code: c.IssueCountry,
          Name: this.getCountryName(c.IssueCountry),
        },
        isModified: false,
        Birthday: c.Birthday.indexOf("T")
          ? this.calendarService.getMoment(0, c.Birthday).format("YYYY/MM/DD")
          : c.Birthday,
        ExpirationDate: c.ExpirationDate.indexOf("T")
          ? this.calendarService
              .getMoment(0, c.ExpirationDate)
              .format("YYYY/MM/DD")
          : c.ExpirationDate,
      } as MemberCredential;
    });
    this.isLoading = false;
    console.log("credentials", this.credentials);
  }
}
