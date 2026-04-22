import {inject, Injectable, signal} from '@angular/core';
import {F1Session} from '../../../../core/types/session.type';
import {ApiService} from '../../../../core/api/api.service';
import {Meeting} from '../../../../core/types/meeting.type';
import {CircuitData} from '../../../../core/types/circuit.type';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private readonly api = inject(ApiService);
  readonly meeting = signal<Meeting | null>(null);
  readonly sessions = signal<F1Session[]>([]);
  readonly circuitData = signal<CircuitData | null>(null);
  readonly loading = signal(false);

  getMeetingByKey(query: Partial<Meeting>): void {
    const currentMeeting = this.meeting();

    const isAlreadyCached = currentMeeting && Object.keys(query).every(
      key => currentMeeting[key as keyof Meeting] === query[key as keyof Meeting]
    );

    const options = query as Record<string, string | number | boolean>;

    if (!isAlreadyCached) {
      this.meeting.set(null);
      this.loading.set(true);
      this.api.getMeetings(false, options).subscribe({
        next: (meetings: Meeting[]) => {
          if (!meetings || meetings.length === 0) {
            this.loading.set(false);
            throw new Error('Meeting not found');
          }
          this.meeting.set(meetings[0]);
          this.loading.set(false);
        },
        error: (err) => {
          this.loading.set(false)
          console.error('Failed to fetch meeting:', err);
        }
      });
    }
  }

  getSessionsByMeetingKey(meeting_key: number): void {
    console.log("meeting");
    if (this.meeting()?.meeting_key !== meeting_key) {
    this.loading.set(true);
    this.api.getSessions(false, {meeting_key: meeting_key}).subscribe((session) => {
      this.sessions.set(session);
    });
    this.loading.set(false);
    }
  }

  getCircuitData(): void {
    if (!this.meeting()) {
      throw new Error('Meeting not found');
    }
    const circuit_info_url = this.meeting()?.circuit_info_url;
    if (!circuit_info_url) {
      throw new Error('Circuit key not found');
    }
    this.loading.set(true);
    this.api.getCircuitData(circuit_info_url).subscribe({
      next: (circuitData: CircuitData) => {
        this.circuitData.set(circuitData);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        throw new Error('Failed to fetch meeting:', err);
      }
    });
  }
}
