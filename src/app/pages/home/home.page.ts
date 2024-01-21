import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TranslateConfigService } from '../../services/translate-config.service';
import { IonDatetime, Platform } from '@ionic/angular';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Network } from '@ionic-native/network/ngx';
import { finalize } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  lang: string = '';
  isOffline: boolean = false;
  isLoading: boolean = false;
  students: any[];
  selectedClasses: any[];
  user: any = {};
  intervalTimer;
  schoolCode: string = '';
  constructor(
    private translateConfig: TranslateConfigService,
    private apiService: ApiService,
    private platform: Platform,
    private datepipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private network: Network
  ) {
    this.lang = this.translateConfig.getCurrentLang();
  }

  ngOnInit() {}

  getUserData() {
    this.apiService
      .fetchData({ code: localStorage.getItem('mobile') }, 'neda_parents')
      .subscribe((res) => {
        if (res && res['result'].length) {
          this.user = res['result'][0];
          localStorage.setItem('user', JSON.stringify(res['result'][0]));
          if (this.user['classes']) {
            this.selectedClasses = String(res['result'][0]['classes']).split(
              ','
            );
          } else this.selectedClasses = [];
          this.schoolCode = this.user['school'];
          this.fillStudentsByClasses();
        }
      });
  }

  ionViewWillEnter() {
    this.getUserData();
    this.checkInternetConnectivity();
    this.user = JSON.parse(localStorage.getItem('user'));
    this.intervalTimer = setInterval(() => {
      this.fillStudentsByClasses();
      this.setCurrentDateAndTime();
    }, 30000);
  }

  doRefresh(event) {
    setTimeout(() => {
      this.fillStudentsByClasses();
      event.target.complete();
    }, 2000);
  }

  checkInternetConnectivity() {
    if (!navigator.onLine) {
      this.isOffline = true;
      localStorage.setItem('online', '0');
      let msg = this.translateConfig.translate.instant(
        'Please Check your internet Connection and try again'
      );
      this.apiService.sharedMethods.presentToast(msg, 'primary');
    }

    this.network.onDisconnect().subscribe((res) => {
      this.isOffline = true;
      localStorage.setItem('online', '0');
      let msg = this.translateConfig.translate.instant(
        'Please Check your internet Connection and try again'
      );
      this.apiService.sharedMethods.presentToast(msg, 'primary');
    });

    this.network.onConnect().subscribe((res) => {
      this.isOffline = false;
      localStorage.setItem('online', '1');
      let msg = this.translateConfig.translate.instant(
        'your internet connection has been restored successfully'
      );
      this.apiService.sharedMethods.presentToast(msg, 'primary');
    });
  }

  ionViewWillLeave() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
  }

  fillStudentsByClasses() {
    let data = {
      school: this.schoolCode,
      date: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
    };
    this.isLoading = true;
    this.apiService.fetchData(data, 'neda_call_log').subscribe(
      (res) => {
        if (res['result'].length) {
          this.students = this.filterStudents(res['result']);
        }
        this.isLoading = false;
      },
      finalize(() => {})
    );
  }

  filterStudents(allStudents: any[]) {
    let result: any[] = [];
    let blackList: any[] = [];
    let greenList: any[] = [];
    let redList: any[] = [];
    allStudents.forEach((item, index) => {
      this.selectedClasses.forEach((clas, indx) => {
        if (clas == item['classno']) {
          // console.log(item)
          if (item['lefttime'] && item.flag == 'call') {
            blackList.push(item);
          } else if (item['flag'] == 'range') redList.push(item);
          else if (item['flag'] == 'call' && !item.lefttime)
            greenList.push(item);
          //result.push(item);
        }
      });
    });
    result.push(...greenList, ...redList, ...blackList);

    return result;
  }

  approveCalling(student) {
    console.log(student);
    if (student['flag'] == 'call' && !student['lefttime']) {
      console.log('existed');
      let studentObj: any = {};
      studentObj['code'] = student['code'];
      studentObj['teacher'] = String(this.user['name']);
      studentObj['lefttime'] = this.datepipe
        .transform(new Date(), 'HH:mm')
        .trim();

      this.apiService.upSert(studentObj, 'neda_call_log').subscribe((res) => {
        this.fillStudentsByClasses();
      });
    }
  }

  getBackgroundImage(student: any) {
    if (student.flag == 'call' && !student.lefttime) {
      return 'url(assets/image/green-time.png)';
    } else if (student.flag == 'range') {
      return 'url(assets/image/red-time.png)';
    } else if (student.lefttime && student.flag == 'call') {
      return 'url(assets/image/black-time.png)';
    }
  }

  getColorName(student) {
    if (student.flag == 'call' && !student.lefttime) {
      return '#009F3D';
    } else if (student.flag == 'range') {
      return '#dd0607';
    } else if (student.lefttime && student.flag == 'call') {
      return '#171717';
    }
  }

  count: number = 0;
  tapevent(student: any) {
    this.count++;
    setTimeout(() => {
      if (this.count == 1) {
        this.count = 0;
        //alert('single tap');
      }
      if (this.count > 1) {
        this.count = 0;
        this.approveCalling(student);
      }
    }, 250);
  }

  setCurrentDateAndTime() {
    let data: any = {};
    data['lastlogin'] = String(
      this.datepipe.transform(new Date(), 'yyyy-MM-dd') +
        ' ' +
        this.datepipe.transform(new Date(), 'HH:mm').trim()
    );
    data['code'] = this.user['code'];
    this.apiService.upSert(data, 'neda_parents').subscribe();
  }
}
