import {Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import("./meetings.component").then(m => m.MeetingsComponent),
    children: [
      {
        path: 'session/:session_key',
        loadComponent: () => import("./pages/session/session.component").then(m => m.SessionComponent),
        title: 'Session'
      },
      {
        path: ':meeting_key',
        loadComponent: () => import("./pages/meeting/meeting.component").then(m => m.MeetingComponent),
        title: 'Meeting'
      }
    ]
  }
];

export default routes;
