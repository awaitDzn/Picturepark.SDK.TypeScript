import { Directive, EventEmitter, Output, HostListener } from '@angular/core';

//  @debounce() decorator
export function debounce(milliseconds: number = 300): MethodDecorator {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    let timeout: any = null

    const original = descriptor.value;

    descriptor.value = function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => original.apply(this, args), milliseconds);
    };

    return descriptor;
  };
}

@Directive({
  selector: '[ppHammerActions]'
})
export class HammerActionsDirective {

  @Output() ppSingleTap = new EventEmitter();
  @Output() ppSingleClick = new EventEmitter();
  @Output() ppDoubleTap = new EventEmitter();
  @Output() ppDoubleClick = new EventEmitter();
  @Output() ppPress = new EventEmitter();

  @HostListener('tap', ['$event'])
  @debounce()
  onTap(event) {

    if (event.tapCount === 1) {
      // single
      this.isTouchEvent(event) ? this.ppSingleTap.emit(event) : this.ppSingleClick.emit(event);
    } else {
      // double
      this.isTouchEvent(event) ? this.ppDoubleTap.emit(event) : this.ppDoubleClick.emit(event);
    }
  }

  @HostListener('press', ['$event'])
  onPress(event) {
    // available only for touch event
    if (this.isTouchEvent(event)) { this.ppPress.emit(event); }
  }

  isTouchEvent(event: PointerEvent) {
    return event.pointerType === 'touch';
  }
}