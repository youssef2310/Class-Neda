import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-location',
  templateUrl: './location.page.html',
  styleUrls: ['./location.page.scss'],
})
export class LocationPage implements OnInit {
  // initial center position for the map
  zoom: number = 8;
  lat: number = 21.4925;
  lng: number = 39.17757;
  lang: string = '';
  origin = { lat: 21.4925, lng: 39.17757 };
  destination = { lat: 21.517923, lng: 39.162607 };
  distanceInKM;
  public renderOptions = {
    suppressMarkers: true,
  };

  markerOptions = {
    origin: {
      icon: '../../../assets/svg_icon/people-pin.svg',
    },
    destination: {
      icon: '../../../assets/svg_icon/shope-pin.svg',
    },
  };

  constructor(
    private translate: TranslateService,
    private apiService: ApiService
  ) {
    // this.distanceInKM = this.calcCrow(
    //   this.origin.lat,
    //   this.origin.lng,
    //   this.destination.lat,
    //   this.destination.lng
    // ).toFixed(1);

    console.log(this.distanceInKM);
    console.log(this.distanceInKM * 1000);
  }
  intervalTimer;
  ngOnInit() {
    this.lang = this.translate.currentLang;

    this.intervalTimer = setInterval(() => {
      this.fillParentChildren();
    }, 10000);
  }

  calcCrow(lat1: number, lon1, lat2, lon2) {
    let R = 6371; // km
    let dLat = this.toRad(lat2 - lat1);
    let dLon = this.toRad(lon2 - lon1);
    let latfirst = this.toRad(lat1);
    let latsecond = this.toRad(lat2);

    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) *
        Math.sin(dLon / 2) *
        Math.cos(latfirst) *
        Math.cos(latsecond);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    return d;
  }

  // Converts numeric degrees to radians
  toRad(Value: number) {
    return (Value * Math.PI) / 180;
  }
  student: any;
  parentList: any[] = [];
  fillParentChildren(observe?: boolean) {
    this.parentList = [];
    //this.apiService.sharedMethods.startLoad();
    this.apiService.getParentChildren(observe).subscribe(
      (res: any) => {
        this.apiService.sharedMethods.dismissLoader();
        if (!res || !res.result) return;

        this.parentList = [];
        Object.keys(res?.result).forEach((key) =>
          this.parentList.push(res?.result[key])
        );

        this.parentList[0]['students'].forEach((item: any) => {
          if (localStorage.getItem('studentCode') == item['code']) {
            this.student = item;
          }
        });

        let homeLoc = String(this.student['homeloc']).split(',');
        let crntLoc = String(this.student['crntloc']).split(',');
        this.origin.lat = Number(homeLoc[0]);
        this.origin.lng = Number(homeLoc[1]);
        this.destination.lat = Number(crntLoc[0]);
        this.destination.lng = Number(crntLoc[1]);
        this.distanceInKM = this.calcCrow(
          this.origin.lat,
          this.origin.lng,
          this.destination.lat,
          this.destination.lng
        ).toFixed(1);
      },

      (error) => {
        this.apiService.sharedMethods.dismissLoader();
      }
    );
  }
}
