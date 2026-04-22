import {Meeting} from '../../types/meeting.type';
import {Injectable, signal} from '@angular/core';
import {F1Session} from '../../types/session.type';

@Injectable({
  providedIn: 'root'
})
export class F1TrackStoreService {
  readonly meeting = signal<Meeting | null>(null);
  readonly session =  signal<F1Session | null>(null);

  setMeeting(meeting: Meeting) {
    this.meeting.set(meeting);
  }

  setSession(session: F1Session) {
    this.session.set(session);
  }
}
