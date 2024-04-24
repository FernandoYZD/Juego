import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';
import { AuthService } from '../core/services/auth.service';
import { Router} from '@angular/router';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-verfication',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, LoginComponent],
  templateUrl: './verfication.component.html',
  styleUrl: './verfication.component.css'
})
export class VerficationComponent {
  res:any = {}
singupForm= new FormGroup({
  code: new FormControl("", [Validators.required, Validators.max(6)])
})


constructor(private authservice: AuthService, private fb: FormBuilder, private router: Router){}

onSubmit(){
  const isformSubmitted = this.singupForm.valid;
  const userData = {
    code: this.singupForm.value.code, 
    email: localStorage.getItem('email')
  };
  if(isformSubmitted){
    this.authservice.login(userData).subscribe(
      (response) => {          
        this.res = response.data
        console.log(this.res)
        localStorage.removeItem('email')
        localStorage.setItem('token', this.res.token)
        localStorage.setItem('user', JSON.stringify(this.res.user))
          Swal.fire({
            title: "Datos correctos!",
            text: "Bienvenido!!!",
            icon: "success"
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/home']);
              }
          });
        },
      (error) => {
        console.log(error)
        Swal.fire({
          title: 'Error',
          text: error.error.msg,
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      })
  }
}
}
