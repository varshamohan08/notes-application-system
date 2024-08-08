import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, Observable, throwError } from 'rxjs';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BackendService {
    hostAddress = 'http://localhost:8000/';
    token:any;

    constructor(
        private http: HttpClient,
        private router: Router,
        private authService: AuthService
    ) {
        // if (isPlatformBrowser(this.platformId)) {
        //     this.token = localStorage.getItem('access_token') || '';
        // }
        this.token = authService.getToken()
        console.log(this.token);
        
    }

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

    getData(url: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
        });
        return this.http
            .get(this.hostAddress + url, { headers })
            .pipe(
                catchError((error: any) => {
                    if (error.status === 401) {
                        this.router.navigate(['/signin']);
                    }
                    return throwError('something went wrong in the server');
                })
            );
    }

    postData(url: string, data: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
        });
        return this.http
            .post(this.hostAddress + url, data, { headers })
            .pipe(
                catchError((error: any) => {
                    if (error.status === 401) {
                        this.router.navigate(['/signin']);
                    }
                    return throwError('something went wrong in the server');
                })
            );
    }

    putData(url: string, data: any): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
        });
        return this.http
            .put(this.hostAddress + url, data, { headers })
            .pipe(
                catchError((error: any) => {
                    if (error.status === 401) {
                        this.router.navigate(['/signin']);
                    }
                    return throwError('something went wrong in the server');
                })
            );
    }

    deleteData(url: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authService.getToken()}`
        });
        return this.http
            .delete(this.hostAddress + url, { headers })
            .pipe(
                catchError((error: any) => {
                    if (error.status === 401) {
                        this.router.navigate(['/signin']);
                    }
                    return throwError('something went wrong in the server');
                })
            );
    }
}
