import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { newAPI } from '../../../../Environment/environment'; // ✅ Corrected Import Path

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiKey = newAPI.newAPIKey; // ✅ Using Correct Environment Variable
  private apiUrl = `https://newsdata.io/api/1/news?apikey=${this.apiKey}&country=us&language=en`;
  private headers = new HttpHeaders().set('X-ACCESS-KEY', this.apiKey);

  constructor(private http: HttpClient) {} // ✅ Injected HttpClient

  getLatestNews(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.headers }).pipe(
      catchError(this.handleError) // ✅ Added Error Handling
    );
  }

  // ✅ Proper Error Handling Function
  private handleError(error: HttpErrorResponse) {
    console.error('Error fetching news:', error);
    if (error.status === 0) {
      return throwError(() => new Error('Network error: Please check your connection.'));
    } else {
      return throwError(() => new Error(`API error: ${error.message}`));
    }
  }
}
