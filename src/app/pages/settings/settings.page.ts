import { DOCUMENT, Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../services/api.service';
import { SharedMethodsService } from '../../services/shared-methods.service';
import { TranslateConfigService } from '../../services/translate-config.service';
import { ModalController } from '@ionic/angular';
import { ClassesComponent } from './classes/classes.component';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SpareDriverPage {
  schoolCode: string = '';
  classes: any[] = [];
  selectedClasses: any[] = [];
  isClassesLoading: boolean = false;
  isModalOpen: boolean = false;
  lang: string = '';
  studentsList: any[] = [];
  isLoading: boolean = false;
  encryptedCode: string = '******';
  user: any = {};
  startCall: boolean = false;
  schoolName: string = '';

  days: string[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  timeProps: any = {
    sunday: '00:00',
    monday: '00:00',
    tuesday: '00:00',
    wednesday: '00:00',
    thursday: '00:00',
    friday: '00:00',
    saturday: '00:00',
  };
  @ViewChild('modal', { static: true }) modal!: ModalController;
  @ViewChild('template') templateRef: TemplateRef<any>;
  defaultStringValue: string = '0000000';
  defaultBinaryArray: number[] = [0, 0, 0, 0, 0, 0, 0];
  firstWorkingDays: any[] = this.defaultBinaryArray;
  firstStartTime: string = '';
  secondWorkingDays: any[] = this.defaultBinaryArray;
  secondStartTime: string = '';
  callRunDuration: number;
  constructor(
    private translateConfig: TranslateConfigService,
    private sharedMethods: SharedMethodsService,
    private detectChange: ChangeDetectorRef,
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    public location: Location,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ionViewWillEnter() {
    this.lang = this.translateConfig.getCurrentLang();
    this.getUserData();

    this.detectChange.detectChanges();
  }

  getSelectedDays(listOfDays: any[]) {
    let selectedWorkingDays: number[] = [];
    listOfDays.forEach((element) => {
      selectedWorkingDays.push(element['value'] == true ? 1 : 0);
    });

    return selectedWorkingDays;
  }

  convertBinaryArray(listType: number): { key: string; value: number }[] {
    if (listType == 1) {
      return this.firstWorkingDays.map((value, index) => {
        return {
          key: this.days[index],
          value: value,
        };
      });
    } else if (listType == 2) {
      return this.secondWorkingDays.map((value, index) => {
        return {
          key: this.days[index],
          value: value,
        };
      });
    }
  }

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
          this.getClassesBySchoolCode();
          console.log(this.selectedClasses);
        }
      });
  }

  getClassesBySchoolCode(showModal: boolean = false) {
    this.isClassesLoading = true;
    let data = {
      code: this.schoolCode,
    };
    this.apiService.fetchData(data, 'neda_schools').subscribe((res) => {
      console.log(res);
      this.firstWorkingDays = res['result'][0]['workdays']
        .split('')
        .map(Number);
      this.firstWorkingDays = this.convertBinaryArray(1);

      this.timeProps['sunday'] = res['result'][0]['suntime'];
      this.timeProps['monday'] = res['result'][0]['montime'];
      this.timeProps['tuesday'] = res['result'][0]['tuetime'];
      this.timeProps['wednesday'] = res['result'][0]['wedtime'];
      this.timeProps['thursday'] = res['result'][0]['thutime'];
      this.timeProps['friday'] = res['result'][0]['fritime'];
      this.timeProps['saturday'] = res['result'][0]['sattime'];
      console.log(this.timeProps);
      this.callRunDuration = res['result'][0]['rundur'];
      this.schoolName = res['result'][0]['name'];
      this.isClassesLoading = false;
      if (!res['result']['length']) {
        let msg = this.translateConfig.translate.instant(
          'School Code is incorrect'
        );
        this.apiService.sharedMethods.presentToast(msg, 'danger', 'testToast');
      } else {
        this.startCall = res['result'][0]['start_call'];
        console.log(this.startCall);
        this.classes = String(res['result'][0]['classes']).split(',');
        if (showModal) this.openModal();
      }
    });
  }

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ClassesComponent,
      componentProps: {
        items: this.classes,
        selectedItems: this.selectedClasses,
        title: 'قائمة الفصول',
      },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
    this.selectedClasses = [];
    this.selectedClasses = data['selectedClasses'];
    if (this.selectedClasses) {
      this.cacheSelectedClasses();
    }
    this.cdr.detectChanges();
  }

  cacheSelectedClasses() {
    this.isLoading = true;
    this.apiService
      .upSert(
        { code: this.user['code'], classes: this.selectedClasses.join(',') },
        'neda_parents'
      )
      .subscribe((res) => {
        if (res) {
          this.isLoading = false;
          let msg = this.translateConfig.translate.instant(
            'Classes saved successfully'
          );
          this.apiService.sharedMethods.presentToast(
            msg,
            'success',
            'testToast'
          );
        }
      });

    // this.isLoading = true;
    // localStorage.setItem(
    //   'selectedClasses',
    //   JSON.stringify(this.selectedClasses)
    // );

    // let msg = this.translateConfig.translate.instant(
    //   'Classes saved successfully'
    // );
    // setTimeout(() => {
    //   this.isLoading = false;
    //   this.apiService.sharedMethods.presentToast(msg, 'success', 'testToast');
    // }, 1000);
  }

  startCalling(ev: any) {
    console.log(ev.checked);
    let data: any = {
      code: this.schoolCode,
      start_call: ev.checked,
    };
    this.apiService.upSert(data, 'neda_schools').subscribe((res) => {
      if (!res) return;
      let msg = this.translateConfig.translate.instant(
        'Command Done Successfully'
      );
      this.apiService.sharedMethods.presentToast(msg, 'success', 'testToast');
    });
  }

  isDisabled(day: any, otherDays: any[]): boolean {
    // Check if the day is checked in the other set
    const correspondingDay = otherDays.find((d) => d.key === day.key);
    if (correspondingDay && correspondingDay.value) {
      day.value = false;
      return true;
    } else return false;
  }

  saveCallingSettings() {
    let data: any = {
      code: this.schoolCode,
      workdays: this.getSelectedDays(this.firstWorkingDays).join(''),
      rundur: this.callRunDuration,
      suntime: this.timeProps['sunday'],
      montime: this.timeProps['monday'],
      tuetime: this.timeProps['tuesday'],
      wedtime: this.timeProps['wednesday'],
      thutime: this.timeProps['thursday'],
      fritime: this.timeProps['friday'],
      sattime: this.timeProps['saturday'],
    };
    this.apiService.upSert(data, 'neda_schools').subscribe((res) => {
      if (!res) return;
      let msg = this.translateConfig.translate.instant(
        'school information saved successfully'
      );
      this.apiService.sharedMethods.presentToast(msg, 'success', 'testToast');
    });
  }
  enforceMinMax(el: any) {
    const firstDigit = el.target.value.toString().charAt(0);

    // Check if the first digit is a valid integer
    if (!Number.isInteger(parseInt(firstDigit))) {
      // If not a valid integer, reset the value to the minimum
      console.log(firstDigit)
      el.target.value = el.target.min;
    } else {
      // If a valid integer, perform range checks
      el.target.value = firstDigit;
    }
  }

  setDeafultTime(e: any) {
    if (!e.target.value) {
      e.target.value = '00:00';
    }
  }
}
