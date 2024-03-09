import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TranslateConfigService } from '../../services/translate-config.service';
import { IonDatetime, IonSelect, Platform } from '@ionic/angular';
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
  students: any[] = [];
  lastStudents: any[] = [];
  selectedClasses: any[];
  user: any = {};
  intervalTimer;
  schoolCode: string = '';
  sortType: number = 2;
  filterOptions: any = ['green', 'red', 'black', 'gray'];
  studentsTemp: any[] = [];
  @ViewChild('filterOptionsSelect') filterOptionsSelect: IonSelect;
  constructor(
    private translateConfig: TranslateConfigService,
    private apiService: ApiService,
    private datepipe: DatePipe,
    private network: Network
  ) {}
  onCancel() {
    console.log('cancel');
  }
  onChange() {
    if (this.filterOptions && this.filterOptions.length) {
      let filteredItems: any[] = [];

      this.filterOptions.forEach((opt, index) => {
        if (opt == 'green') {
          filteredItems.push(...this.greenList);
        } else if (opt == 'red') {
          filteredItems.push(...this.redList);
        } else if (opt == 'black') {
          filteredItems.push(...this.blackList);
        } else if (opt == 'gray') {
          filteredItems.push(...this.approvedList);
        }
      });
      this.students = filteredItems;
     // this.sort(this.sortType);
     
    } else {
      this.students = [];
      
    }
   
  }

  onNgModelChange() {
    console.log(this.filterOptions);
  }
  test() {
    let okText = this.translateConfig.translate.instant('Confirm');
    let cancelText = this.translateConfig.translate.instant('Cancel');

    this.filterOptionsSelect.okText = okText;
    this.filterOptionsSelect.cancelText = cancelText;
    this.filterOptionsSelect.mode = 'md';
    this.filterOptionsSelect.open().then((res) => {
      console.log(this.filterOptions);
    });
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
    this.firstTimeLoad = true;
    this.getUserData();
    this.checkInternetConnectivity();
    this.user = JSON.parse(localStorage.getItem('user'));
    this.lang = this.translateConfig.getCurrentLang();
    console.log(this.lang);
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

  firstTimeLoad: boolean = true;
  fillStudentsByClasses() {
    console.log('ssss');
    this.lastStudents = this.students;
    let data = {
      school: this.schoolCode,
      date: this.datepipe.transform(new Date(), 'yyyy-MM-dd'),
    };
    this.isLoading = true;
    this.apiService.fetchData(data, 'neda_call_log').subscribe(
      (res) => {
        if (res['result'].length) {
          this.filterStudents(res['result']);
          if (
            this.lastStudents.length != this.students.length
          ) {
            console.log('ssss');
            this.firstTimeLoad = false;
           
            this.playAudio();
          }
        }

        this.isLoading = false;
      },
      finalize(() => {})
    );
  }
  blackList: any[] = [];
  greenList: any[] = [];
  redList: any[] = [];
  approvedList: any[] = [];
  filterStudents(allStudents: any[]) {
    console.log('indez');
    let result: any[] = [];
    this.greenList = [];
    this.redList = [];
    this.blackList = [];
    this.approvedList = [];
    allStudents.forEach((item, index) => {
      this.selectedClasses.forEach((clas, indx) => {
        if (clas == item['classno']) {
          if (item['leftschool']) {
            this.approvedList.push(item);
          } else if (item['lefttime'] && item.flag == 'call') {
            this.blackList.push(item);
          } else if (item['flag'] == 'range') this.redList.push(item);
          else if (item['flag'] == 'call' && !item.lefttime)
            this.greenList.push(item);
        }
      });
    });

    this.sort(this.sortType);
    if (this.filterOptions && this.filterOptions.length) this.onChange();
    this.studentsTemp = this.students;
  }

  sort(type: number) {
    this.sortType = type;
    this.students = [];
    if (type == 1) {
      this.students.push(
        ...this.greenList.sort((a, b) => a.name.localeCompare(b.name)),
        ...this.redList.sort((a, b) => a.name.localeCompare(b.name)),
        ...this.blackList.sort((a, b) => a.name.localeCompare(b.name)),
        ...this.approvedList.sort((a, b) => a.name.localeCompare(b.name))
      );
    } else if (type == 2) {
      this.sortByTime(this.greenList, 1);
      this.sortByTime(this.redList, 2);
      this.sortByTime(this.blackList, 3);
      this.sortByTime(this.approvedList, 4);
      this.students.push(
        ...this.greenList,
        ...this.redList,
        ...this.blackList,
        ...this.approvedList
      );
    }

    this.onChange()
  }
  sortByTime(list: any[], listColor: number) {
    if (!list || !list.length) return;
    list.sort((a, b) => {
      const timeA = this.convertTimeToMinutes(
        listColor == 1 || listColor == 2
          ? a.time
          : listColor == 3
          ? a.lefttime
          : a.leftschool
      );
      const timeB = this.convertTimeToMinutes(
        listColor == 1 || listColor == 2
          ? b.time
          : listColor == 3
          ? b.lefttime
          : b.leftschool
      );
      return timeB - timeA;
    });
  }

  private convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
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
        this.firstTimeLoad = true;
        this.fillStudentsByClasses();
      });
    }
  }

  leftApprove(student) {
    console.log(student);
    if (
      ((student['flag'] == 'call' && !student['lefttime']) ||
        (student['lefttime'] && student.flag == 'call')) &&
      !student.leftschool
    ) {
      console.log('existed');
      let studentObj: any = {};
      studentObj['code'] = student['code'];
      studentObj['monitor'] = String(this.user['name']);
      studentObj['leftschool'] = this.datepipe
        .transform(new Date(), 'HH:mm')
        .trim();

      this.apiService.upSert(studentObj, 'neda_call_log').subscribe((res) => {
        this.firstTimeLoad = true;
        this.fillStudentsByClasses();
      });
    }
  }

  getBackgroundImage(student: any) {
    if (student.leftschool) {
      return 'url(assets/image/gray-time.png)';
    } else if (student.flag == 'call' && !student.lefttime) {
      return 'url(assets/image/green-time.png)';
    } else if (student.flag == 'range') {
      return 'url(assets/image/red-time.png)';
    } else if (student.lefttime && student.flag == 'call') {
      return 'url(assets/image/black-time.png)';
    }
  }

  getColorName(student) {
    if (student.leftschool) {
      return '#A5ADBA';
    } else if (student.flag == 'call' && !student.lefttime) {
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
        if (this.user['ismonitor'] == true) {
          this.leftApprove(student);
        } else {
          this.approveCalling(student);
        }
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

  playAudio() {
    let audio = null;
    audio = new Audio();
    //audio.muted = true;
    audio.src = '';
    audio.src = 'https://s.autotech.sa/images/autoneda/ding1.mp3';
    audio.load();
    audio.play().then((res) => {
      audio.onended = null;
    });
  }
}
