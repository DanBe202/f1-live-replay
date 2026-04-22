import {ChangeDetectionStrategy, Component, inject, input, OnInit} from '@angular/core';
import {MeetingService} from './meeting.service';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-meeting',
  templateUrl: './meeting.component.html',
  styleUrl: './meeting.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    RouterLink

  ]
})
export class MeetingComponent implements OnInit{
  private readonly service = inject(MeetingService);

  readonly meeting_key = input.required({transform: (value : string) => Number(value)});
  readonly meeting = this.service.meeting;
  readonly sessions = this.service.sessions;
  readonly loading = this.service.loading;

  ngOnInit(): void {
    this.service.getMeetingByKey({ meeting_key: this.meeting_key() });
    this.service.getSessionsByMeetingKey(this.meeting_key());
  }
}
