import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExploreService {

  private apiUrl = 'https://api.unsplash.com';
  private accessKey = 'wzZ7UmFm9MgFuzSFm9NN0WZOk9W19awo12C7s3eHxds';  // Replace with your actual key

  constructor(private http: HttpClient) { }

  // Fetch random photos
  getRandomPhotos(count: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/photos/random?client_id=${this.accessKey}&count=${count}`);
  }

  // Search for photos
  searchPhotos(query: string, perPage: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/photos?query=${query}&client_id=${this.accessKey}&per_page=${perPage}`);
  }
}
