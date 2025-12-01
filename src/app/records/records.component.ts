import { Component, inject, OnDestroy, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ResultsService } from '../shared/service/results.service';
import { UserService } from '../shared/service/user.service';
import { Score } from '../shared/model/score.model';
import { ToastService } from '../shared/service/toast.service';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecordsComponent implements OnInit, OnDestroy {

  private resultsServices = inject(ResultsService);
  private userService = inject(UserService);
  private toastService = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  protected topScores: Score[] = [];
  protected userScores: Score[] = [];
  protected isLogged: boolean = false;

  private subscriptions: Subscription[] = [];
  private username: string = '';

  // Inicializaciones y chequeos
  ngOnInit(): void {
    this.topScores = [];
    this.userScores = [];
    this.isLogged = this.userService.isLoggedIn();
    this.username = this.userService.getUsername();
  }

  // Limpieza de subscripciones
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions.length = 0;
  }

  // Buscar datos de resultados
  ngAfterContentInit(): void {
    this.subscriptions.push(this.getTopScores());

    if ((this.isLogged) && (this.username)) {
      this.subscriptions.push(this.getUserScores());
    } else {
      this.toastService.show("User is not logged in, therefore no user results to be displayed");
    }
  }

  /*
   * Recuperar las 10 mejores puntuaciones de todos los usuarios via API
   */
  getTopScores(): Subscription {

    return this.resultsServices.getTopScores().subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.body) {
          this.topScores = response.body as Score[];
          this.cdr.markForCheck();
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

  /*
   * Recuperar las 10 mejores puntuaciones del usuario logado via API
   */
  getUserScores(): Subscription {

    return this.resultsServices.getUserScores(this.username).subscribe({
      next: (response: any) => {
        if (response.status === 200 && response.body) {
          this.userScores = response.body as Score[];
          this.cdr.markForCheck();
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