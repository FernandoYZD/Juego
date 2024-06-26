import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GameService } from '../core/services/game.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../core/services/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router} from '@angular/router';
import { response } from 'express';
import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  
  enablebuttonLogout: boolean = true
  enablebuttonUnirse: boolean = true
  games: any[] = [];
  echo:Echo;
  constructor(private gameservice: GameService, private authservice: AuthService, private router: Router){
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
  history(): void {  
    this.authservice.history().subscribe(
      (response) =>{
        this.router.navigate(['/history']);

      },)
  }
  logout(): void {  
    console.log("Bye")
    this.enablebuttonLogout = false
    this.authservice.logout().subscribe(
      (response) =>{
        localStorage.removeItem("token")
        this.enablebuttonLogout = true
        Swal.fire({
          title: "Cuenta cerrada!",
          text: "Bye :(",
          icon: "success"
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/login']);
            }
        });
      },
      (error) => {
        this.enablebuttonLogout = true
        Swal.fire({
          title: 'Error',
          text: error.error.msg,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      })
  }
  ngOnInit(): void {
    this.gameservice.cancelAll().subscribe()
    
    this.gameservice.search().subscribe(
      (response) =>{
        this.games = response.data
      },
      (error) => {
        if(error.status == 401){
          this.router.navigate(['/login']);
        }
        Swal.fire({
          title: 'Aviso',
          text: error.error.msg,
          icon: 'info',
          confirmButtonText: 'Aceptar'
        });
      }
    )

    this.echo.channel('games-game').listen('.games-event', (e: any) => {
      let user = JSON.parse(localStorage.getItem('user') || '{}');
      let userId = user.id;
      if (e.games.user_1 !== userId) {
        const id = localStorage.getItem('game');
        this.authservice.userName(id).subscribe(
          (response) =>{
            e.games.user_1 = response.data.name
          },
          (error) => {
          e.games.user_1 = "Nombre no encontrado"
            if(error.status == 401){
              this.router.navigate(['/login']);Swal.fire({
                title: 'Aviso',
                text: error.error.msg,
                icon: 'info',
                confirmButtonText: 'Aceptar'
              });
            }
            
          }
        )
        this.games.push(e.games)
      }
    });
  }
  unirse(id:Number): void{
    this.enablebuttonUnirse = false
    localStorage.setItem('game', id.toString());
    this.gameservice.start(id).subscribe(
      (response) =>{
        this.enablebuttonUnirse = true
        Swal.fire({
          title: 'Partida iniciada',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
        this.router.navigate(['/game']);
      },
      (error) => {
        this.enablebuttonUnirse = true
        if(error.status == 401){
          this.router.navigate(['/login']);
        }
        Swal.fire({
          title: 'Error',
          text: error.error.msg,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    )
  }
  newGame(): void {  
      this.gameservice.create().subscribe(
        (response) =>{
          localStorage.setItem('game', response.data.id)
          Swal.fire({
            title: "Partida creada!",
            text: "Espere a que un jugador entre",
            icon: "success"
            });
            this.router.navigate(['/cancel']);
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
