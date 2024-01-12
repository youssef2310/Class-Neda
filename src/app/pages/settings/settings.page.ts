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
export class SpareDriverPage implements OnInit {
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
  @ViewChild('modal', { static: true }) modal!: ModalController;
  @ViewChild('template') templateRef: TemplateRef<any>;

  constructor(
    private translateConfig: TranslateConfigService,
    private sharedMethods: SharedMethodsService,
    private detectChange: ChangeDetectorRef,
    private apiService: ApiService,
    private modalCtrl: ModalController,
    private cdr: ChangeDetectorRef,
    public location : Location,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ionViewWillEnter() {
    this.lang = this.translateConfig.getCurrentLang();
    this.getUserData();

    this.detectChange.detectChanges();
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
    console.log(data['selectedClasses']);
    this.selectedClasses = [];
    this.selectedClasses = data['selectedClasses'];
    console.log(this.selectedClasses);
    this.cdr.detectChanges();
  }

  CacheSelectedClasses() {
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
        'Calling started successfully'
      );
      this.apiService.sharedMethods.presentToast(msg, 'success', 'testToast');
    });
  }
  ngOnInit() {}
}
