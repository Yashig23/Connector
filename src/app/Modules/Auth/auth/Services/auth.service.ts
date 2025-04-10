import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { environment } from '../../../../../Environment/environment';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';  // Modular imports

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth;

  constructor() {
    // Initialize Firebase
    const firebaseConfig = environment.firebaseConfig;
    
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);  // Use modular signInWithPopup
  }
  
  signInWithEmailPassword(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);  // Email/password sign-in
  }

  signUpWithEmailPassword(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);  // Email/password sign-up
  }

  signOut() {
    return signOut(this.auth);  // Use modular signOut
  }
}
