import { Injectable, signal } from '@angular/core';

interface ToastMessage {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toast = signal<ToastMessage | null>(null);

  show(text: string, type: ToastMessage['type'] = 'info', duration = 3000) {
    this.toast.set({ text, type });

    setTimeout(() => {
      this.toast.set(null);
    }, duration);
  }
}