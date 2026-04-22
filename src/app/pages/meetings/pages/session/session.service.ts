import {inject, Injectable, signal} from '@angular/core';
import {F1Session} from '../../../../core/types/session.type';
import {ApiService} from '../../../../core/api/api.service';
import {delay} from 'rxjs';
import {CarPath} from '../../../../core/types/car.type';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly api = inject(ApiService);
  private readonly session_key = signal<number>(0);
  readonly session = signal<F1Session | null>(null);
  readonly loading = signal(false);
  readonly carsPath = signal<CarPath[] | null>(null);

  getSession(session_key: number): void {
    if (this.session()?.session_key !== session_key) {
      this.session.set(null);
      this.loading.set(true);
      this.api.getSessions(false, {session_key: session_key}).pipe(delay(1000)).subscribe((session) => {
        if (!session[0]) {
          throw new Error('Session not found');
        }
        this.session.set(session[0]);
        this.session_key.set(session[0].session_key);
      });
      this.loading.set(false);
    }
  }

  getCarsLocationOnPeriod(start: Date, end: Date): void {
    this.loading.set(true);
    this.api.getCarsLocation(start, end, {session_key: this.session_key()}).pipe(delay(1000)).subscribe((rawPaths) => {
      if (!rawPaths[0]) {
        throw new Error('Session not found');
      }
      const processedPaths: CarPath[] = [];
      rawPaths.forEach((path) => {
        const existingPath = processedPaths.find((p) => p.driver_number === path.driver_number);
        if (!existingPath) {
          processedPaths.push({
            driver_number: path.driver_number,
            location: [path]
          });
          return;
        }
        existingPath.location.push(path);
        return;
      })
      this.carsPath.set(processedPaths);
    });
    this.loading.set(false);
    }
}
