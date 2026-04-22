import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {DashboardService} from './dashboard.service';
import {DatePipe} from '@angular/common';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit{
  private readonly service = inject(DashboardService);

  readonly meetings = this.service.meetings;

  ngOnInit(): void {
    this.service.getMeetings();
  }
}
