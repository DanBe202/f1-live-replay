import {ChangeDetectionStrategy, Component, inject, input, OnDestroy, OnInit} from '@angular/core';
import {TrackMapComponent} from '../../../../../../core/components/track-map/track-map.component';
import {CircuitData} from '../../../../../../core/types/circuit.type';
import {SessionService} from '../../session.service';
import {RacePlaybackService} from './race-playback.service';
import {Subscription, timer} from 'rxjs';

@Component({
  selector: 'app-race-playback',
  imports: [
    TrackMapComponent,
  ],
  templateUrl: './race-playback.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RacePlaybackComponent implements OnInit, OnDestroy{
  private readonly service = inject(SessionService);
  private readonly raceService = inject(RacePlaybackService);
  private playbackSubscription?: Subscription;
  readonly circuitData = input.required<CircuitData>();
  readonly carsPaths = this.service.carsPath;


  ngOnInit(): void {
    const sessionStart = new Date(this.service.session()!.date_start);
    this.raceService.startTime.set(sessionStart);
    this.raceService.endTime.set(new Date(this.service.session()!.date_end));

    this.raceService.currentPlaybackTime.set(sessionStart);

    this.fetchNextChunk();

    this.playbackSubscription = timer(2000, 2000).subscribe(() => {
      this.checkBufferAndFetch();
    });
  }

  skip(ms: number) {
    this.raceService.triggerSkip(ms);
    this.checkBufferAndFetch();
  }

  private checkBufferAndFetch() {
    const current = this.raceService.currentPlaybackTime();
    const lastFetched = this.raceService.lastTimeFrame();

    if (!current || !lastFetched) return;

    const msUntilStarved = lastFetched.getTime() - current.getTime();

    if (msUntilStarved < 30000) {
      this.fetchNextChunk();
    }
  }

  private fetchNextChunk() {
    const nextFrame = this.raceService.getNextTimeFrame();
    if (nextFrame) {
      this.service.getCarsLocationOnPeriod(new Date(nextFrame.start), new Date(nextFrame.end));
    } else {
      this.playbackSubscription?.unsubscribe();
    }
  }

  ngOnDestroy() {
    this.playbackSubscription?.unsubscribe();
  }
}
