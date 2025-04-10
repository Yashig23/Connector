import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private ws: WebSocket;

  constructor() {
    this.ws = new WebSocket('ws://localhost:8080');
  }

  sendMessage(message: any) {
    this.ws.send(JSON.stringify(message));
  }

  onMessage(callback: (data: any) => void) {
    this.ws.onmessage = (event) => {
      callback(JSON.parse(event.data));
    };
  }
}
