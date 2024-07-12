import { Component, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, RouterOutlet } from '@angular/router';
import { BackendService } from './backend.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BrowserModule,
  ],
  providers: [
    // importProvidersFrom(provideHttpClient(withInterceptorsFromDi()))
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
