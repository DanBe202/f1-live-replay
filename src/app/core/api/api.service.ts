import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {F1Session} from '../types/session.type';
import {Meeting} from '../types/meeting.type';
import {CircuitData} from '../types/circuit.type';
import {CarLocation} from '../types/car.type';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'https://api.openf1.org/v1';
  private readonly http = inject(HttpClient);

  private readonly today = new Date().toISOString();

  getMeetings(fromToday: boolean,  options?: Record<string, string | number | boolean>): Observable<Meeting[]> {
    let params = new HttpParams({ fromObject: options });
    if (fromToday) {
      params = params.append('date_start>', this.today);
    }
    return this.http.get<Meeting[]>(`${this.baseUrl}/meetings`, { params: params });
  }

  getSessions(fromToday: boolean, options?: Record<string, string | number | boolean>): Observable<F1Session[]> {
    let params = new HttpParams({ fromObject: options });

    if (fromToday) {
      params = params.append('date_start>', this.today);
    }

    return this.http.get<F1Session[]>(`${this.baseUrl}/sessions`, {params: params});
  }

  getCircuitData(url: string): Observable<CircuitData> {
    return this.http.get<CircuitData>(url);
  }

  getCarsLocation(start?: Date | string, end?: Date | string, options?: Record<string, string | number | boolean>): Observable<CarLocation[]> {
    let params = new HttpParams({ fromObject: options });
    if (start && end) {
      if (typeof start === 'string' && typeof end === 'string') {
        start = new Date(start);
        end = new Date(end);
      }
      if (!(start instanceof Date) || !(end instanceof Date)) {
        throw new Error('Invalid date format');
      }
      params = params.append('date>', start.toISOString());
      params = params.append('date<', end.toISOString());
    }
    return this.http.get<CarLocation[]>(`${this.baseUrl}/location`, {params: params});
  }
}
