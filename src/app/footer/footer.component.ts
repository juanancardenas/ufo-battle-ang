import { Component, ElementRef, AfterViewInit , ViewChild } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements AfterViewInit  {

  @ViewChild('year') year!: ElementRef;

  ngAfterViewInit () {
    // Poner el año actual en el footer
    this.year.nativeElement.textContent = new Date().getFullYear();
  }
}