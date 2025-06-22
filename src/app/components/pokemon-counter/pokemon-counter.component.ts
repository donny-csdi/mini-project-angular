import { Component, OnInit, OnDestroy, OnChanges, SimpleChanges, Input } from '@angular/core';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-pokemon-counter',
  standalone: false,
  templateUrl: './pokemon-counter.component.html',
  styleUrls: ['./pokemon-counter.component.scss']
})
export class PokemonCounterComponent implements OnInit, OnDestroy, OnChanges {
  @Input() startCount: number = 0;
  @Input() incrementBy: number = 1;
  
  counter: number = 0;
  private counterSubscription: Subscription | null = null;
  
  constructor() {
    console.log('Constructor called');
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges called with:', changes);
    
    if (changes['startCount'] && !changes['startCount'].firstChange) {
      this.counter = changes['startCount'].currentValue;
    }
  }
  
  ngOnInit(): void {
    console.log(' emang ngOnInit called');
    
    this.counter = this.startCount;

    // setInterval(() => {
    //   this.counter += this.incrementBy;
    // }, 1000);

    // this.counterSubscription = interval(1000).subscribe(() => {
    //   this.counter += this.incrementBy;
    // });
  }
  
  ngOnDestroy(): void {
    console.log('ngOnDestroy called - cleaning up subscriptions');
    
    if (this.counterSubscription) {
      this.counterSubscription.unsubscribe();
      this.counterSubscription = null;
    }
  }
  
  resetCounter(): void {
    this.counter = this.startCount;
  }
}
