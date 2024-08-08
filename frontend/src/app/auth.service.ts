import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token!: any;
  private userdetails!: any;

  constructor() { }

  // public setToken(token: string, user:any): void {
  //   this.token = token;
  //   this.userdetails = user
  // }

  // public getToken(): string {
  //   return this.token;
  // }

  // public removeToken(): void {
  //   this.token = null;
  //   this.userdetails = null
  // }

  // public isAuthenticated(): boolean {
  //   return !!this.token;
  // }
  public setToken(token: string, user: any): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_details', JSON.stringify(user));
  }

  public getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  public getUserDetails(): any {
    const userDetails = localStorage.getItem('user_details');
    return userDetails ? JSON.parse(userDetails) : null;
  }

  public removeToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_details');
  }

  public isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
