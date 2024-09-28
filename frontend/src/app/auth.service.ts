import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router'; // Correct import from Angular, not Express

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private token!: any;
  private userdetails!: any;

  constructor(
    private router: Router, // Inject Angular's Router
    @Inject(PLATFORM_ID) private platformId: Object // Check platform for SSR
  ) { }

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
    console.log('remove');
    
    const pageMode = localStorage.getItem('page_mode');
    const listView = localStorage.getItem('list_view');
  
    localStorage.clear();
  
    if (pageMode) {
      localStorage.setItem('page_mode', pageMode);
    }
    
    if (listView) {
      localStorage.setItem('list_view', listView);
    }
  
    this.router.navigate(['signin']);
  }
  

  public isAuthenticated(): boolean {
    return !!this.getToken(); // Returns true if token exists
  }
}
