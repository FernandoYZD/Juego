import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private url:string = "http://127.0.0.1:8000/api/user/"; 
  constructor(private http: HttpClient) {}
  
  public register(body: any){
    return this.http.post(this.url + "register", body);
  }

  public code(body: any){
    return this.http.post(this.url + "code", body);
  }
  public login(body: any):Observable<any>{
    return this.http.post(this.url + "login", body);
  }
  public logout(){
    let token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);    
    return this.http.post(`${this.url}logout`,{}, { headers: headers });
  }
  public history():Observable<any>{
    let token = localStorage.getItem('token')
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.url}historial`, { headers: headers });
  } 
}
