import { ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { ResultsService } from '../shared/service/results.service';
import { UserService } from '../shared/service/user.service';
import { Score } from '../shared/model/score.model';
import { ToastService } from '../shared/service/toast.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-records',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './records.component.html',
  styleUrl: './records.component.css',
})
export class RecordsComponent implements OnInit, OnDestroy {
  private resultsServices = inject(ResultsService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private changeDetection = inject(ChangeDetectorRef);

  public subscriptions: Subscription[] = [];
  public topScores: Score[] = [];
  public userScores: Score[] = [];
  public isLogged: boolean = false;

  ngOnInit(): void {
    this.subscriptions.push(this.getTopScores());
    if (this.userService.isLoggedIn()) {
      this.subscriptions.push(this.getUserScores());
      this.isLogged = true;
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getTopScores(): Subscription {
    return this.resultsServices.getTopScores().subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.topScores = response.body as Score[];
          this.changeDetection.markForCheck();
          //console.log('Top Scores:', this.topScores);
        } else {
          this.toastService.show('Unexpected response from API in getTopScores', 'info');
        }
      },
      error: (error: any) => {
        this.toastService.show(error.status === 401 ? 'Authorization error' : 'Internal server error', 'error');
      }
    });
  }

  getUserScores(): Subscription {
    return this.resultsServices.getUserScores(this.userService.getUsername()).subscribe({
      next: (response: any) => {
        if (response.status === 200) {
          this.userScores = response.body as Score[];
          this.changeDetection.markForCheck();
          //console.log('User Scores:', this.userScores);
        } else {
          this.toastService.show('Unexpected response from API in getUserScores', 'info');
        }
      },
      error: (error: any) => {
        this.toastService.show(error.status === 401 ? 'Authorization error' : 'Internal server error', 'error');
      }
    });
  }
}