import { Component } from '@angular/core';
import {  ElementRef, ViewChild } from '@angular/core';
import { WebsocketService } from '../../Services/websocket.service';

@Component({
  selector: 'app-video-chat',
  templateUrl: './video-chat.component.html',
  styleUrl: './video-chat.component.scss'
})
export class VideoChatComponent {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  inCall = false;
  localStream!: MediaStream;
  peerConnection!: RTCPeerConnection;

  config: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  constructor(private wsService: WebsocketService) {}

  async startCall() {
    this.inCall = true;
    this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideo.nativeElement.srcObject = this.localStream;

    this.peerConnection = new RTCPeerConnection(this.config);
    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsService.sendMessage({ type: 'ice-candidate', candidate: event.candidate });
      }
    };

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this.wsService.sendMessage({ type: 'offer', offer });
  }

  async handleOffer(offer: RTCSessionDescriptionInit) {
    this.peerConnection = new RTCPeerConnection(this.config);
    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream));

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this.wsService.sendMessage({ type: 'answer', answer });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.wsService.sendMessage({ type: 'ice-candidate', candidate: event.candidate });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteVideo.nativeElement.srcObject = event.streams[0];
    };
  }

  async handleAnswer(answer: RTCSessionDescriptionInit) {
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
  }

  endCall() {
    this.inCall = false;
    this.peerConnection.close();
    this.localStream.getTracks().forEach(track => track.stop());
  }
}
