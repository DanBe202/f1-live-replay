import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '../../core/api/api.service';
import {F1Session} from '../../core/types/session.type';
import {Meeting} from '../../core/types/meeting.type';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly api = inject(ApiService);

  readonly meetings = signal<Meeting[] | null>(null);
  readonly sessions = signal<F1Session[]>([]);
  readonly loading = signal(false);

  getMeetings(): void {
    this.loading.set(true);
    if (!this.meetings()) {
      this.api.getMeetings(true).subscribe((meeting) => {
        this.meetings.set(meeting);
      });
    }
    this.loading.set(false);
  }
}
