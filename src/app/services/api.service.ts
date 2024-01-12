import { Inject, Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SharedMethodsService } from './shared-methods.service';
import { SharedVariablesService } from './shared-variables.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private _fireParent: Subject<boolean> = new Subject<boolean>(); // consider putting the actual type of the data you will receive
  public fireParentObs = this._fireParent.asObservable();

  constructor(
    public sharedVariables: SharedVariablesService,
    public sharedMethods: SharedMethodsService,
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private platform: Platform
  ) {}

  sendCodeWhatsapp(phone) {
    const code: any = Math.floor(100000 + Math.random() * 900000);

    const url = `https://wa4.era.net.sa/sendMessage/wLjhyNE3QHrD/${phone}/AutoNeda%20Code:%20%20+${code}`;

    let headers: {
      'Content-Type': 'application/json';
      'Access-Control-Allow-Origin': '*';
    };
    localStorage.setItem('wtsp_code', code);
    return this.httpClient
      .get(url, {
        headers: headers,
      })
      .pipe(
        map((response: any) => {
          if (response === 'Success') {
            localStorage.setItem('wtsp_code', code);
          } else {
            this.sharedMethods.presentToast(
              response.message,
              'danger',
              'testToast'
            );
          }
        })
      );
  }

  //Neda Class
  // get classes by school code

  fetchData(object: any, tableName: string) {
    return this.httpClient.post(
      `${this.sharedVariables.apiUrl.get}`,
      {
        conditions: JSON.stringify(object),
        project_id: 'autoneda',
        table: tableName,
        mobileAuthorization:
          'AWe~?N1zq]CE(5y!XM@]6IqH6.%R`xLsN~JKH$T/sY8PuNJRtH:s?@@7Ea',
      },

      {
        headers: this.sharedVariables.globalVariables.http_config,
      }
    );
  }

  upSert(object: any, tableName: string) {
    return this.httpClient.post(
      `${this.sharedVariables.apiUrl.upSert}`,
      {
        data: JSON.stringify([object]),
        project_id: 'autoneda',
        table: tableName,
        mobileAuthorization:
          'AWe~?N1zq]CE(5y!XM@]6IqH6.%R`xLsN~JKH$T/sY8PuNJRtH:s?@@7Ea',
      },

      {
        headers: this.sharedVariables.globalVariables.http_config,
      }
    );
  }
}

// Request URL: https://api.fixeny.com/api/upsert/?mobileAuthorization=AWe~?N1zq]CE(5y!XM@]6IqH6.%R`xLsN~JKH$T/sY8PuNJRtH:s?@@7Ea&project_id=autoneda&table=neda_call_log&data=[{%20%27school%27%20:%20S0001,%27student%27%20:%20T1007,%27code%27%20:%20S0001T1007,%20%27parent%27:%20P0001,%20%27flag%27%20:%20range,%20%27date%27%20:%202021-11-25%20}]
