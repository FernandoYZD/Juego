import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { GameService } from '../core/services/game.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import Echo from 'laravel-echo';
import Swal from 'sweetalert2';
import Pusher from 'pusher-js';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translateX(-100%)' }),
        animate('{{ tiempo }}', style({ transform: 'translateX(100px)' }))
    ], { params: { tiempo: '8000ms linear' } }),
    ]),
    trigger('slideInOut4', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translateX(-100%)' }),
        animate('{{ tiempo }}', style({ transform: 'translateX(100px)' }))
    ], { params: { tiempo: '7500ms linear' } }),
    ]),
    trigger('slideInOut3', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translateX(-100%)' }),
        animate('{{ tiempo }}', style({ transform: 'translateX(100px)' }))
    ], { params: { tiempo: '6000ms linear' } }),
    ]),
    trigger('slideInOut2', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translateX(-100%)' }),
        animate('{{ tiempo }}', style({ transform: 'translateX(100px)' }))
    ], { params: { tiempo: '4000ms linear' } }),
    ]),
    trigger('slideInOut1', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translateX(-100%)' }),
        animate('{{ tiempo }}', style({ transform: 'translateX(100px)' }))
    ], { params: { tiempo: '2000ms linear' } }),
    ]),
    trigger('slideUpDown', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translatey(0%)' }),
        animate('2000ms linear', style({ transform: 'translatey({{firstDivWidth}}px)' }))
      ],{ params: { firstDivWidth: '0' } } ),
    ])
  ]
})

export class GameComponent implements OnInit {
  barraDisparos = true
  barcos = 10
  vida = this.barcos / 2
  echo: Echo
  isVisible = false; 
  isVisibleMissile = true;
  showMarker = false;
  sum = 0;
  markerX = 0;
  markerY = 0;
  markerXShip = 0;
  markerYShip = 0;
  @ViewChild('firstDiv') firstDiv!: ElementRef<HTMLDivElement>;
  firstDivWidth!: number;


  constructor(private elementRef: ElementRef, private gameservice: GameService, private router: Router){
    (window as any).Pusher = Pusher;
    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'GoofNBCH',
      cluster: 'mt1',
      encrypted: true,
      wsHost: window.location.hostname,
      wsPort: 6001,
      disableStats: true,
      forceTLS: false,
    });
 
  }

  ngOnInit(): void {      
    let user = JSON.parse(localStorage.getItem('user') || '{}');
    let userId = user.id; 

    this.echo.channel('turn-game').listen('.turn-game-event', (e: any) => {
      if(userId === e.userId.turn){
        this.sum = 0
        this.prende();
      }
    });

    this.echo.channel('game-cancel-game').listen('.game-cancel-event', (e: any) => {
      if(e.cancel.is_active){
        let user = JSON.parse(localStorage.getItem('user') || '{}');
        let name = user.name;
        const win = {"win": name}
        this.gameservice.win(id, win).subscribe(
          (response) =>{
            localStorage.removeItem('game')
            Swal.fire({
              title: "El contrincante ha huido!",
              text: "Ganaste",
              icon: "success"
              }).then((result) => {
                this.router.navigate(['/home']);
            });
          },
          (error) => {
            Swal.fire({
              title: 'Error',
              text: error.error.msg,
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
        })
      }
    });
    
    this.echo.channel('win-game').listen('.win-game-event', (e: any) => {
      Swal.fire({
        title: "Lo siento, has perdido!",
        text: `Barcos restantes: ${this.vida} `,
        icon: "info"
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/home']);
          }
      });
         
    });
    
    const id = localStorage.getItem('game')
    this.gameservice.info(id).subscribe(
      (response) =>{
        if(userId === response.data.turn){
          this.prende();
        }
      },
      (error) => {
        if(error.status == 404){
          this.router.navigate(['/home']);
        }
      }
    )
  }
  ngAfterViewInit() {
    this.barraDisparos = true
    this.firstDivWidth = this.firstDiv.nativeElement.getBoundingClientRect().height;
    const divElement = this.elementRef.nativeElement.querySelector('#miDiv');
    if (divElement) {
      const rect = divElement.getBoundingClientRect();
      this.markerXShip = rect.left;
      this.markerYShip = rect.top
      if(this.markerXShip <= this.markerX + 60 &&  this.markerX -60 <= this.markerXShip ){
        this.barcos -= 1
        this.vida = this.barcos / 2
        if(this.barcos <= 0){
          const id = localStorage.getItem('game')
          let user = JSON.parse(localStorage.getItem('user') || '{}');
          let use = { 'win': user.name }
          this.gameservice.win(id, use).subscribe(
            (response) =>{
              this.isVisible = false
              this.isVisibleMissile = false
              localStorage.removeItem('game')
              Swal.fire({
                title: "Victoria!",
                text: "Has ganado",
                icon: "success"
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.router.navigate(['/home']);
                  }
              });
            },
            (error) => {
              Swal.fire({
                title: 'Error',
                text: error.error.msg,
                icon: 'error',
                confirmButtonText: 'Aceptar'
              });
          })
        }
      }
    } else {
      console.error('No se pudo encontrar el barco');
    }
  }
  onAnimationDone() {
    if(this.vida > 0){
      this.isVisible = false; 
      let game = localStorage.getItem('game');
      this.gameservice.turn(game).subscribe(
        (response) =>{
          Swal.fire({
            title: "Turno finalizado!",
            text: `Aún te quedan ${this.vida} barcos`,
            icon: "info"
            })
        },
        (error) => {
          if(error.status == 401){
            this.router.navigate(['/login']);
          }
          Swal.fire({
            title: 'Error turno',
            text: error.error.msg,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        }
      )
  
    }
  }
  onAnimationDonee() {
    this.ngAfterViewInit()
    this.isVisibleMissile = false; // Oculta el div

  }
  startAnimation() {
  }
  handleMouseDown(event: MouseEvent) {
    this.barraDisparos = false
    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    this.markerX = event.clientX - rect.left;
    this.markerY = event.clientY - rect.top;
    this.showMarker = true;
    this.firstDivWidth -=this.markerY

    if (this.sum < 2){
      this.isVisibleMissile = true; 
    }
    this.sum++;
    
  }
  prende(){
    this.isVisible = true
  }
  ngOnDestroy(): void {
    if(this.echo){
      const id = localStorage.getItem('game')
      this.gameservice.cancel(id).subscribe(
        (response) =>{
          localStorage.removeItem('game')
          Swal.fire({
            title: "Partida finalizada!",
            text: "Bye >:/",
            icon: "error"
            }).then((result) => {
              this.router.navigate(['/home']);
          });
        },
        (error) => {
          Swal.fire({
            title: 'Error',
            text: error.error.msg,
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
      })
      this.echo.disconnect();
    }
  }
  
}