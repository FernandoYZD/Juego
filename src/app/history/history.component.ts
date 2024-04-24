import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {
  historys: any[] = [];

  constructor(private authservice: AuthService, private router: Router){}

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
    
  }
}
