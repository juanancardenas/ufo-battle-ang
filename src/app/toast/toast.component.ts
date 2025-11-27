import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../shared/service/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent {
  toastService = inject(ToastService);

  toast = this.toastService.toast;
}