import {Injectable, signal} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RacePlaybackService {
  readonly startTime = signal<Date | null>(null);
  readonly endTime = signal<Date | null>(null);
  readonly periodInMin = signal<number>(5);
  readonly lastTimeFrame = signal<Date | null>(null);

  readonly currentPlaybackTime = signal<Date | null>(null);
  readonly skipCommand$ = new Subject<number>();

  triggerSkip(ms: number) {
    this.skipCommand$.next(ms);
  }

  getNextTimeFrame(): {start: Date, end: Date} | null {
    const startLimit = this.startTime();
    const endLimit = this.endTime();

    if (!startLimit || !endLimit) {
      throw new Error('Start and end time not set');
    }

    const safeEndLimit = new Date(endLimit);
    const currentStartRaw = this.lastTimeFrame() ? this.lastTimeFrame()! : startLimit;
    const safeCurrentStart = new Date(currentStartRaw);

    const currentStart = this.lastTimeFrame() ? this.lastTimeFrame()! : startLimit;

    if (safeCurrentStart.getTime() >= safeEndLimit.getTime()) {
      return null;
    }

    const periodMs = this.periodInMin() * 60 * 1000;
    let currentEnd = new Date(safeCurrentStart.getTime() + periodMs);

    if (currentEnd.getTime() > safeEndLimit.getTime()) {
      currentEnd = safeEndLimit;
    }

    this.lastTimeFrame.set(currentEnd);

    return {
      start: currentStart,
      end: currentEnd
    };
  }
}
