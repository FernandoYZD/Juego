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
        animate('5000ms linear', style({ transform: 'translateX(100px)' }))
      ]),
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
  barcos = 2
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
      console.log(userId) 
      console.log(e.userId.turn) 
      if(userId === e.userId.turn){
        this.sum = 0
        this.prende();
        console.log("Te toca")
      }
    });

    this.echo.channel('game-cancel-game').listen('.game-cancel-event', (e: any) => {
      console.log("HA salido")
      console.log(e)
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
        title: "Zorra for you!",
        text: "Has perdido",
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
        console.log(response.data)
        console.log("User: " +userId)
        if(userId === response.data.turn){
          this.prende();
          console.log("Te toca")
        }
      }
    )
  }
  ngAfterViewInit() {
    this.barraDisparos = true
    this.firstDivWidth = this.firstDiv.nativeElement.getBoundingClientRect().height;
    console.log(this.firstDivWidth);
    const divElement = this.elementRef.nativeElement.querySelector('#miDiv');
    if (divElement) {
      const rect = divElement.getBoundingClientRect();
      console.log('Rect:', rect);
      this.markerXShip = rect.left;
      this.markerYShip = rect.top
      console.log(this.markerXShip);
      console.log(this.markerYShip);
      if(this.markerXShip <= this.markerX + 60 &&  this.markerX -60 <= this.markerXShip ){
        this.barcos -= 1
        this.vida = this.barcos / 2
        if(this.barcos <= 0){
          const id = localStorage.getItem('game')
          let user = JSON.parse(localStorage.getItem('user') || '{}');
          let use = { 'win': user.user }
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
    console.log(this.vida)
    if(this.vida > 0){
      this.isVisible = false; 
      let game = localStorage.getItem('game');
      this.gameservice.turn(game).subscribe(
        (response) =>{
          console.log("Había una vez un barco chiquito")
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
    console.log('Coordenadas del mouse dentro del div:');
    console.log('X:', this.markerX);
    console.log('Y:', this.markerY);

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
          console.log("Partida finalizada")
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