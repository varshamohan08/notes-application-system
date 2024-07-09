import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  hostAddress = 'http://localhost:8000/';
  token = localStorage.getItem('access_token') || ''

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  postDataBeforeLogin(url: string, data: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post(this.hostAddress + url, data, { headers })
      .pipe(
        catchError((error: any) => {
          return throwError('something went wrong in the server');
        })
      );
  }
}
