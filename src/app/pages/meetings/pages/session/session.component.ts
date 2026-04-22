import {ChangeDetectionStrategy, Component, computed, effect, inject, input, OnInit, untracked} from '@angular/core';
import {SessionService} from './session.service';
import {MeetingService} from '../meeting/meeting.service';
import {RacePlaybackComponent} from './components/race-playback/race-playback.component';

@Component({
  selector: 'app-session',
  imports: [
    RacePlaybackComponent
  ],
  templateUrl: './session.component.html',
  styleUrl: './session.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionComponent implements OnInit{
  private readonly sessionService = inject(SessionService);
  private readonly meetingService = inject(MeetingService);
  readonly session_key = input.required({transform: (value : string) => Number(value)});
  readonly session = this.sessionService.session;
  readonly meeting = this.meetingService.meeting;
  readonly circuitData = this.meetingService.circuitData;
  readonly loading = this.sessionService.loading;

  readonly ended = computed(() => {
    return this.session? this.session()!.date_end < new Date() : false;
  });

  constructor() {
    effect(() => {
      const currentSession = this.session();

      if (currentSession?.meeting_key) {
        untracked(() => {
          this.meetingService.getMeetingByKey({meeting_key: currentSession.meeting_key});
          this.meetingService.getCircuitData();
        });
      }
    });
  }

  ngOnInit(): void {
    this.sessionService.getSession(this.session_key());
  }
}
