import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  historys: any[] = [];
  echo: Echo

  constructor(private authservice: AuthService, private router: Router){
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
    this.authservice.history().subscribe(
      (response) =>{
        this.historys = response.data
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

    this.echo.channel('history-game').listen('.history-game-event', (e: any) => {
        this.historys.push(e.hostorial)
    });
    
  }
}
