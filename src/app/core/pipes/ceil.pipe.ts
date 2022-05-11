import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ceil'
})
export class CeilPipe implements PipeTransform {

  transform(val: number): number {
    return Math.ceil(val);
  }

}
