import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from '../services/api.service';
import { Platform } from '@ionic/angular';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { Router } from '@angular/router';
@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
})
export class TabsPage {
  lang: string = '';
  parent : any = {};
  intervalTimer;
  constructor(
    private translate: TranslateService,
    private apiService: ApiService,
    private platform: Platform,
    private fcm: FCM,
    private router: Router
  ) {
    console.log(this.translate.currentLang);
    this.lang = this.translate.currentLang;
    this.parent = JSON.parse(localStorage.getItem('parent'))

    this.intervalTimer = setInterval(() => {
      this.parent = JSON.parse(localStorage.getItem('parent'))

    }, 10000);
   
  }

  onNotifications() {
    return this.fcm.onNotification().subscribe((msg) => {
      if (msg.wasTapped) {
        this.router.navigate(['/tabs/notification']);
      } else {
        if (this.platform.is('ios')) {
          console.log(msg.aps.alert);
          this.apiService.sharedMethods.presentToast(msg.aps.alert, 'light');
        } else {
          this.apiService.sharedMethods.presentToast(msg.body, 'light');
        }
      }
    });
  }
}
