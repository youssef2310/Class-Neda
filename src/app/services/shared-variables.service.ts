import { Inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
@Injectable({
  providedIn: 'root',
})
export class SharedVariablesService {
  globalVariables: any = {};

  apiUrl: any = {};

  verifyCode: any;
  verificationID: any;

  constructor() {
    this.globalVariables.projectID = 'autoneda';

    this.globalVariables.appName = 'AutoNeda';

    this.globalVariables.NotificationTitle = 'AutoNeda';

    this.globalVariables.SMSTitle = 'AutoNeda';

    this.globalVariables.IOSAppID = '';

    this.globalVariables.defaultLatitude = 21.51;
    this.globalVariables.defaultLongitude = 39.1;

    this.globalVariables.baseURL = 'https://api.fixeny.com';

    this.globalVariables.appDefaultLang = 'ar';

    this.globalVariables.http_config = {
      mobileauthorization:
        'AWe~?N1zq]CE(5y!XM@]6IqH6.%R`xLsN~JKH$T/sY8PuNJRtH:s?@@7Ea',
    };

    //Neda Class

    this.apiUrl.get = this.globalVariables.baseURL + '/api/get';
    this.apiUrl.upSert = this.globalVariables.baseURL + '/api/upsert';
  }
}
