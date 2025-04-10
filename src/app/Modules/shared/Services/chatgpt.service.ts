import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, retryWhen } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatgptService {

  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions'; // ✅ Correct API URL
  private apiKey = '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'; // 🔴 Replace with your actual API key

  constructor(private http: HttpClient) { }

  getChatResponse(message: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      "model": "deepseek/deepseek-r1:free",
      "messages": [
        {
          "role": "user",
          "content": message
        }
      ]
    };

    return this.http.post(this.apiUrl, body, { headers }).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, i) => i < 3 ? timer(2000) : throwError(error)) // ✅ Retry 3 times with a 2s delay
        )
      )
    );
  }
}
