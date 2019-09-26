import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { first, timeout, catchError, tap, map } from 'rxjs/operators';
import * as moment from 'moment';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  constructor(
    private http: HttpClient
  ) { }
  ngOnInit(): void {
    this.startMonitoring();
  }
  //'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/core.js'
  testURL = 'https://cdn.jsdelivr.net/npm/jquery-noconflict@1.0.0/index.min.js'
  startTime = this.getNow();
  runTimeMS = 0;
  totalTries = 0;
  totalFailured = 0;
  title = 'internetTest';

  getNow() {
    return moment();
  }
  getFailureRate() {
    const perc = (this.totalFailured * 100 / this.totalTries);
    return perc.toPrecision(2)
  }
  getRunTime() {

    return moment.duration(this.runTimeMS).humanize();
  }
  startMonitoring() {
    setInterval(() => {
      this.totalTries++;
      this.runTimeMS = this.getNow().diff(this.startTime);

      this.http.get(this.testURL + '?t=' + this.runTimeMS, { observe: 'response', responseType: 'text' })
        .pipe(
          first(),
          timeout(500),
          map(resp => { console.log(resp); return resp.ok }),
          catchError(err => { console.log(err); return of(false) }),
        )
        .subscribe(wasOK => {
          if (!wasOK) {
            this.totalFailured++;
          }
        })

    }, 1000);
  }
}
