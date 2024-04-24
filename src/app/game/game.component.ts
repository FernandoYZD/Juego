import { Component, OnInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { GameService } from '../core/services/game.service';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translateX(-1360%)' }),
        animate('5000ms linear', style({ transform: 'translateX(100%)' }))
      ]),
      

    ]),
    trigger('slideUpDown', [
      transition(':enter', [
        style({ position: 'absolute', transform: 'translatey(0%)' }),
        animate('2000ms linear', style({ transform: 'translatey(3000%)' }))
      ]),
      

    ])
  ]
})
export class GameComponent implements OnInit {
  isVisible = true; // Inicialmente visible
  isVisibleMissile = true; // Inicialmente visible
  showMarker = false;
  sum = 0;
  markerX = 0;
  markerY = 0;
  markerXShip = 0;
  markerYShip = 0;
  

  constructor(private elementRef: ElementRef, private gameservice: GameService) { }

  ngOnInit(): void {  
  }
  ngAfterViewInit() {
    const divElement = this.elementRef.nativeElement.querySelector('#miDiv');
    if (divElement) {
      const rect = divElement.getBoundingClientRect();
      console.log('Rect:', rect);
      this.markerXShip = rect.left;
      this.markerYShip = rect.top
      console.log(this.markerXShip);
      console.log(this.markerYShip);
      if(this.markerXShip <= this.markerX + 60 &&  this.markerX -60 <= this.markerXShip ){
        console.log("pium")
      }
    } else {
      console.error('No se pudo encontrar el elemento con ID "miDiv"');
    }
  }
  
  
  
  onAnimationDone() {
    // Esta función se ejecutará al finalizar la animación
    this.isVisible = false; // Oculta el div
  }
  onAnimationDonee() {
    this.ngAfterViewInit()
    this.isVisibleMissile = false; // Oculta el div

  }

  startAnimation() {
  }

  handleMouseDown(event: MouseEvent) {
    if (this.sum < 2){
      this.isVisibleMissile = true; // Oculta el div
    }
    this.sum++;

    const container = event.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    this.markerX = event.clientX - rect.left;
    this.markerY = event.clientY - rect.top;
    this.showMarker = true;

    console.log('Coordenadas del mouse dentro del div:');
    console.log('X:', this.markerX);
    console.log('Y:', this.markerY);
  }
}
