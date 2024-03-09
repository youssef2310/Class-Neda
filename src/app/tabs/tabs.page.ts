import { Component, DoCheck } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage implements DoCheck {
  lang: string = '';
  activeTab: string;
  user: any = {};
  constructor(private translate: TranslateService, private router: Router) {
    this.lang = this.translate.currentLang;
    this.user = JSON.parse(localStorage.getItem('user'));
    console.log(this.user);
  }

  ionViewWillEnter() {}

  ngDoCheck(): void {
    this.activeTab = String(this.router.url).slice(6);
    this.user = JSON.parse(localStorage.getItem('user'));
  }
}
