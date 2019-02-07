import { Component } from "@angular/core";

@Component({
    selector: 'app-root',
    template: `
    <h1>{{title}}</h1>
    <app-heroes></app-heroes>
    `
})
export class TohComponent {
    title = 'Tour of Heroes';
}