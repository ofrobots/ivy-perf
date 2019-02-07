import { Component, OnInit } from '@angular/core';
import { Hero } from './hero';
 
@Component({
  selector: 'app-heroes',
  template: `
  <h2>{{hero.name}} Details</h2>
  <div><span>id: </span>{{hero.id}}</div>
  <div>
    <label>name:
      <input (click)="onClick()" placeholder="name">
    </label>
  </div>
  `,
})
export class HeroesComponent implements OnInit {
  hero: Hero = {
    id: 1,
    name: 'Windstorm'
  };

  onClick() {
  }

  constructor() { }
 
  ngOnInit() {
  }
 
}