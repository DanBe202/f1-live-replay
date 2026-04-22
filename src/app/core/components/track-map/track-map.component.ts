import {Component, computed, input} from '@angular/core';
import {CircuitData, Coordinates} from '../../types/circuit.type';
import {TrackCarsComponent} from '../track-car/track-cars.component';
import {CarPath} from '../../types/car.type';


export interface TrackScale {
  minX: number;
  minY: number;
  maxRange: number;
  offsetX: number;
  offsetY: number;
}

@Component({
  selector: 'app-track-map',
  templateUrl: './track-map.component.svg',
  imports: [
    TrackCarsComponent
  ]
})
export class TrackMapComponent {
  readonly circuitData = input.required<CircuitData>()
  readonly carsPaths = input.required<CarPath[]>()

  readonly scale = computed(() => {
    const data = this.circuitData().corners;

    if (!data) {
      throw new Error( `${data}` );
    }
    const minX = Math.min(...data.map(corner => corner.trackPosition.x));
    const maxX = Math.max(...data.map(corner => corner.trackPosition.x));
    const minY = Math.min(...data.map(corner => corner.trackPosition.y));
    const maxY = Math.max(...data.map(corner => corner.trackPosition.y));
    const rangeX = maxX - minX;
    const rangeY = maxY - minY;
    const maxRange = Math.max(rangeX, rangeY);
    const offsetX = (this.usableSize - (rangeX / maxRange * this.usableSize)) / 2;
    const offsetY = (this.usableSize - (rangeY / maxRange * this.usableSize)) / 2
    return { minX, minY, maxRange, offsetX, offsetY } as TrackScale;
  })

  readonly scaledCarsPaths = computed(() => {
    return this.scaleCarsLocation(this.carsPaths());
  });

  readonly svgSize = 1500;
  readonly padding = 100;
  readonly usableSize = this.svgSize - (this.padding * 2);

  private scaleCoordinates(coordinates: Coordinates): Coordinates {
    const scaleX = this.padding + this.scale().offsetX + ((coordinates.x - this.scale().minX) / this.scale().maxRange) * this.usableSize;
    const scaleY = this.padding + this.scale().offsetY + (((coordinates.y - this.scale().minY) / this.scale().maxRange)) * this.usableSize;
    return { x: scaleX, y: scaleY };
  }

  protected scaleTrackCorners(data: CircuitData): CircuitData {
    return {
      ...data,
      corners: data.corners.map(corner => {
        return {
          ...corner,
          trackPosition: this.scaleCoordinates(corner.trackPosition)
        }
      })
    }
  }

  protected scaleCarsLocation(carsPaths: CarPath[]): CarPath[] {
    return carsPaths.map(carPath => {
      return {
        ...carPath,
        location: carPath.location.map((location) => {
          const scaledLocation = this.scaleCoordinates({x: location.x, y: location.y});
          return {
            ...location,
            x: scaledLocation.x,
            y: scaledLocation.y
          }
        })
      }
    })
  }

  protected getTrackLayoutCoordinates(data: CircuitData): string {
    if (!data?.x || !data?.y || !Array.isArray(data.x) || !Array.isArray(data.y)) return '';

    return data.x.map((x, i) => {
      const scaled = this.scaleCoordinates({x: x, y: data.y[i]});
      return `${scaled.x},${scaled.y}`;
    }).join(' ');
  }
}
