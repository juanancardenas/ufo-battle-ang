import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { HostListener, inject, signal } from '@angular/core';
import { PreferencesService } from '../shared/service/preferences.service';
import { Ufo } from '../shared/model/ufo.model';
import { FloatingScore } from '../shared/model/floating-score.model';
import { interval, animationFrameScheduler, Subscription } from 'rxjs';
import { UserService } from '../shared/service/user.service';
import { TokenmgrService } from '../shared/service/tokenmgr.service';
import { ResultsService } from '../shared/service/results.service';
import { ToastService } from '../shared/service/toast.service';

@Component({
  selector: 'app-play',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css'],
})
export class PlayComponent implements OnInit, OnDestroy {
 
  @ViewChild('playContent') playContent!: ElementRef;
  @ViewChild('panelPoints') panelPoints!: ElementRef;
  @ViewChild('panelTime') panelTime!: ElementRef;

  private toast = inject(ToastService);

  // Definición de constantes
  private UFO_HSTEP = 4;   // Velocidad de los UFO
  private MARGIN = 8;

  private prefsService = inject(PreferencesService); // Inyectar servicio de preferencias
  private userService = inject(UserService); // Inyectar servicio de login
  private tokenService = inject(TokenmgrService);  // Inyectar servicio de gestión de token
  private resultsService = inject(ResultsService);   // Inyectar servicio de resultados

  private gameLoop?: Subscription;   // Subscription a animationFrameScheduler
  private chronoId: any = null;
  private prefs: any;

  score: number = 0;
  time: number = 60;
  endGame: boolean = false;
  text1: string = '';
  text2: string = '';

  private alreadyShoot: boolean = false;
  private numUfos: number = 1;
  private sendResult: boolean = false;

  ufos = signal<Ufo[]>([]);
  missileY = signal(5);
  missileX = signal(300);
  floatingScores = signal<FloatingScore[]>([]);
  private floatingId: number = 0;

  /*
   * Inicializaciones antes de arrancar la vista
   */
  ngOnInit(): void {
    this.prefs = this.prefsService.getPreferences();
    this.time = this.prefs.time || 60;
    this.numUfos = this.prefs.numberUfo || 1;
    this.sendResult = this.prefs.sendResult;

    setTimeout(() => {
      this.createUfos();
      this.startGameLoop();
      this.startChrono();
    });
  }

  // Limpieza al destruir el componente
  ngOnDestroy() {
    this.gameLoop?.unsubscribe();
    clearInterval(this.chronoId);
  }

  /*
   * Crea un loop de frames vía subscribe, lo que hace que se muevan
   * los UFOs y se mueva el misil cuando el usuario use el teclado
   */
  private startGameLoop() {
    this.gameLoop = interval(0, animationFrameScheduler).subscribe(() => {
      this.moveUfos();
      if (this.alreadyShoot) this.updateMissile();
    });
  }

  /*
   * Método de gestión de UFO. Crea los UFOs según el número de UFOs
   * introducido por el usuario en preferencias
   */
  private createUfos() {
    const rect = this.playContent.nativeElement.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const newUfos: Ufo[] = [];
    const bottoms: number[] = [];

    for (let i = 0; i < this.numUfos; i++) {
      let y: number;
      do {
        y = (Math.random() * 0.7 + 0.25) * (h - 60);
      } while (bottoms.some(b => Math.abs(b - y) < 60)); // Evita solapamiento
      bottoms.push(y);

      newUfos.push({
        id: i,
        x: Math.random() * (w - 60 - 30),
        y,
        step: Math.random() < 0.5 ? -this.UFO_HSTEP : this.UFO_HSTEP,
        src: 'assets/img/ufo.png',
      });
    }

    this.ufos.set(newUfos);
  }

  // Método asociado al ufo para que se mueve en horizontal
  private moveUfos() {
    const w = this.playContent.nativeElement.clientWidth;

    this.ufos.update(list =>
      list.map(ufo => {
        let step = ufo.step;
        if (ufo.x + 60 + this.MARGIN > w || ufo.x + step < 0) step = -step;
        return { ...ufo, x: ufo.x + step, step };
      })
    );
  }

  /*
   * Método de control del teclado: Flechas para mover el misil, espacio para disparar
   */
  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    if (this.endGame || this.alreadyShoot) return;
    
    if (e.key === 'ArrowLeft') this.moveMissile(-5);
    if (e.key === 'ArrowRight') this.moveMissile(5);
    if (e.key === ' ') this.pullTrigger();
  }

  // Mueve el misil
  private moveMissile(delta: number) {
    const contentW = this.playContent.nativeElement.clientWidth;
    const next = this.missileX() + delta;
    if (next >= 0 && next + 40 + this.MARGIN < contentW) this.missileX.set(next);
  }

  // Lanza el misil
  private pullTrigger() {
    if (this.alreadyShoot) return;
    this.alreadyShoot = true;
    this.missileY.set(5); // Reiniciar posición
  }

  /*
   * Gestiona el movimiento del misil
   */
  private updateMissile() {
    const nextY = this.missileY() + 8; // Velocidad del misil
    const contentH = this.playContent.nativeElement.clientHeight;
    this.missileY.set(nextY);

    const ufosList = this.ufos();
    for (const ufo of ufosList) {
      if (this.hit(ufo)) {
        this.onUfoHit(ufo);
        return;
      }
    }

    if (nextY > contentH) {
      this.alreadyShoot = false;
      this.missileY.set(5);
      this.score -= 25;

      // -25 Puntos flotantes desde contador de puntos
      const panel = this.panelPoints.nativeElement;
      const x = panel.offsetLeft + panel.offsetWidth / 2;
      const y = panel.offsetTop + panel.offsetHeight / 2;
      this.addFloatingScore(x-80, y, "-25", "#f0d439ff", 40);
    }
  }

  // Chequea si el misil ha impactado con un UFO
  private hit(ufo: Ufo) {
    const mx = this.missileX();
    const my = this.missileY();

    return (
      my + 70 > ufo.y &&
      my + 70 < ufo.y + 60 &&
      mx + 20 > ufo.x &&
      mx + 20 < ufo.x + 60
    );
  }

  // Gestión del impacto con un UFO
  private onUfoHit(ufo: Ufo) {
    this.alreadyShoot = false;
    this.score += 100;

    // +100 Puntos flotantes desde ufo golpeado
    const contentH = this.playContent.nativeElement.clientHeight;
    const top = contentH - ufo.y - 60;
    this.addFloatingScore(ufo.x + 30, top - 20, "+100", "#00ff00", 20);

    this.ufos.update(list =>
      list.map(u => u.id === ufo.id ? { ...u, src: 'assets/img/explosion.gif?' + Date.now() } : u)
    );

    this.missileY.set(5); // Reiniciar misil

    setTimeout(() => {
      this.ufos.update(list =>
        list.map(u => u.id === ufo.id ? { ...u, src: 'assets/img/ufo.png' } : u)
      );
    }, 1000);
  }


  // Mostrar cuando de texto indicando si se suma o restan puntos
  private addFloatingScore(x: number, y: number, value: string, color: string, size: number) {
    const id = this.floatingId++;
    const score: FloatingScore = { id, x, y, value, color, size };
    this.floatingScores.update(list => [...list, score]);

    setTimeout(() => {
      this.floatingScores.update(list => list.filter(s => s.id !== id));
    }, 800);
  }

  /*
   * Cronómetro: Lee el tiempo de juego de las preferencias y lanza el
   * contador regresivo. Al llegar a 0, finaliza el juego
   */
  private startChrono() {
    this.chronoId = setInterval(() => {
      if (this.time < 1) {
        this.time = 0;
        this.finishGame();
      } else {
        this.time--;
      }
    }, 1000);
  }

  /*
   * Fin de juego: Detiene todos los procesos, muestra la puntuación final
   */
  private finishGame() {
    this.endGame = true;
    clearInterval(this.chronoId);
    this.chronoId = null;

    this.gameLoop?.unsubscribe();
    this.gameLoop = undefined;

    setTimeout( () => {
      const ratio = this.prefs.time / 60;
      if (ratio > 1) this.text1 = `Time penalty: ${this.score}`+ ` / ` + `${ratio}`;
      this.score = Math.round(this.score / ratio);

      if (this.numUfos > 1) this.text2 = `Number of UFOs penalty: -${(this.numUfos - 1) * 50}`;
      this.score = this.score - ((this.numUfos - 1) * 50);
      console.log("Score(1): " + this.score);

      if (this.sendResult) this.sendResultAPI();
    })
  }

  /*
   * Enviar resultados al API. Si el usuario está logado y ha marcado la opción 
   * en la pantalla de preferencias, se enviará el resultado de la partida al API
   */
  private sendResultAPI() {
    if(this.userService.isLoggedIn()) {
      const token: string = this.tokenService.getToken()!;
      if ( token == null ) {
        this.toast.show('You do not have any token, your result will not be sent', 'warning');
        return;
      }
      console.log("Score(2): " + this.score);
      this.resultsService.sendResults(this.score, this.numUfos, this.prefs.time, token).subscribe({
        next: (response: any) => {
          if (response.status == "201") {
            // Actualizar el token para tener otros 10 minutos
            const token: any = response.headers.get('Authorization');
            if (token) {
              this.tokenService.deleteToken();
              this.tokenService.saveToken(response.headers.get("Authorization"));
            }
            // Mensaje a usuario
            this.toast.show('Your result has been sent successfully', 'success');
          }
        },
        error: (error: any) => {
          if (error.status === 401) {
            this.toast.show(`Authorization error: ${error.status} - Login again`, 'error');
          } else {
            this.toast.show(`Error: ${error.message ?? error}`, 'error');
          }
        }
      })
    } else {
      this.toast.show('You are not currenty logged in, your result will not be sent', 'warning');
    }
  }
}