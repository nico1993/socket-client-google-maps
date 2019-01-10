import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {

  public socketStatus = false;

  constructor(
    private socket: Socket
  ) {
    this.checkStatus();
  }

  checkStatus() {
    this.socket.on('connect', () => {
      this.socketStatus = true;
    });

    this.socket.on('disconnect', () => {
      this.socketStatus = false;
    });
  }

  emit(eventName: string, data?: any, callback?: Function) {
    this.socket.emit(eventName, data, callback);
  }

  listen(event: string) {
    return this.socket.fromEvent(event);
  }
}
