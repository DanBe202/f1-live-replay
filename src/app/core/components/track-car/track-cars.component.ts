import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
  untracked
} from '@angular/core';
import {CarLocation, CarPath} from '../../types/car.type';
import {Ticker} from 'pixi.js';
import {F1PositionInterpolator} from '../../math/interpolator/f1-position-interpolator';
import {Subscription} from 'rxjs';
import {
  RacePlaybackService
} from '../../../pages/meetings/pages/session/components/race-playback/race-playback.service';

@Component({
  selector: '[app-track-cars]',
  imports: [],
  templateUrl: './track-cars.component.svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrackCarsComponent implements OnInit, OnDestroy{
  readonly carsPath = input.required<CarPath[]>();
  readonly currentLocations = signal<Map<number, CarLocation>>(new Map());

  private readonly ticker = new Ticker();
  private readonly interpolator = new F1PositionInterpolator();
  private readonly raceService = inject(RacePlaybackService);
  private skipSub?: Subscription

  constructor() {
    effect(() => {
      const newPaths = this.carsPath();
      untracked(() => {
        this.interpolator.addData(newPaths);
      });

    });
  }

  ngOnInit() {
    this.ticker.add((ticker) => {
      this.replayEngine(ticker.deltaMS);
    });
    this.ticker.start();
    this.skipSub = this.raceService.skipCommand$.subscribe((skipMs) => {
      this.replayEngine(skipMs);
    });
  }

  private replayEngine(deltaMS: number) {
    const updatedMap = this.interpolator.update(deltaMS, this.currentLocations());
    if (updatedMap !== this.currentLocations()) {
      this.currentLocations.set(updatedMap);
    }

    const currentClock = this.raceService.currentPlaybackTime();
    if (currentClock) {
      this.raceService.currentPlaybackTime.set(new Date(currentClock.getTime() + deltaMS));
    }
  }

  ngOnDestroy() {
    this.ticker.destroy();
  }
}
