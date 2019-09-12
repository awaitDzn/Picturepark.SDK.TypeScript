import { Directive, EventEmitter, Output, ElementRef, OnInit } from '@angular/core';
import * as Hammer from 'hammerjs';

@Directive({
  selector: '[ppHammerActions]'
})
export class HammerActionsDirective implements OnInit {
  private singletapEventName = 'singletap';
  private doubletapEventName = 'doubletap';
  private pressEventName = 'press';
  private manager: any;

  @Output() singleTap = new EventEmitter();
  @Output() singleClick = new EventEmitter();
  @Output() doubleTap = new EventEmitter();
  @Output() doubleClick = new EventEmitter();
  @Output() press = new EventEmitter();

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    // create a recognizer
    this.manager = new Hammer.Manager(this.el.nativeElement);

    // set up events
    const singleTap = new Hammer.Tap({ event: this.singletapEventName });
    const doubleTap = new Hammer.Tap({ event: this.doubletapEventName, taps: 2 });
    const press = new Hammer.Press({ time: 500 });

    // register events
    this.manager.add([doubleTap, singleTap, press]);

    doubleTap.recognizeWith(singleTap);
    singleTap.requireFailure([doubleTap]);

    // register callback
    this.manager.on(`${this.singletapEventName} ${this.doubletapEventName} ${this.pressEventName}`, (event: PointerEvent) => {
      this.handleEvent(event);
    });
  }

  isTouchEvent(event: PointerEvent) {
    return event.pointerType === 'touch';
  }

  handleEvent(event: PointerEvent) {
    switch (event.type) {
      case this.singletapEventName: {
        this.isTouchEvent(event) ? this.singleTap.emit(event) : this.singleClick.emit(event);
        break;
      }
      case this.doubletapEventName: {
        this.isTouchEvent(event) ? this.doubleTap.emit(event) : this.doubleClick.emit(event);
        break;
      }
      case this.pressEventName: {
        if (this.isTouchEvent(event)) { this.press.emit(event); }
        break;
      }
    }
  }
}
