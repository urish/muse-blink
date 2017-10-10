import { Component } from '@angular/core';
import { MuseClient, channelNames } from 'muse-js';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private muse = new MuseClient();
  connected = false;
  leftBlinks: Observable<number>;
  rightBlinks: Observable<number>;

  constructor() {
    this.muse.connectionStatus.subscribe(newStatus => {
      this.connected = newStatus;
    });
  }

  async onConnectButtonClick() {
    await this.muse.connect();
    this.muse.start();

    const leftEyeChannel = channelNames.indexOf('AF7');
    const rightEyeChannel = channelNames.indexOf('AF8');

    this.leftBlinks = this.muse.eegReadings
      .filter(r => r.electrode === leftEyeChannel)
      .map(r => Math.max(...r.samples.map(n => Math.abs(n))))
      .filter(max => max > 500)
      .switchMap(() =>
        Observable.merge(
          Observable.of(1),
          Observable.timer(500).map(() => 0)
        )
      );

    this.rightBlinks = this.muse.eegReadings
      .filter(r => r.electrode === rightEyeChannel)
      .map(r => Math.max(...r.samples.map(n => Math.abs(n))))
      .filter(max => max > 500)
      .switchMap(() =>
        Observable.merge(
          Observable.of(1),
          Observable.timer(500).map(() => 0)
        )
      );
  }

  disconnect() {
    this.muse.disconnect();
  }
}
