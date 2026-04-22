import {CarLocation, CarPath} from '../../types/car.type';

interface InterpolationState {
  startX: number;
  startY: number;
  targetLocation: CarLocation;
  progress: number;
  prevDistance: number;
  currentDistance: number;
  durationMs: number;
}

export class F1PositionInterpolator {
  private readonly locationQueue = new Map<number, CarLocation[]>();
  private readonly activeInterpolations = new Map<number, InterpolationState>();

  public addData(carsPaths: CarPath[]) {
    for (const car of carsPaths) {
      const driverId = car.driver_number;
      if (!this.locationQueue.has(driverId)) {
        this.locationQueue.set(driverId, []);
      }
      this.locationQueue.get(driverId)!.push(...car.location);
    }
  }

  public update(deltaMS: number, currentMap: Map<number, CarLocation>): Map<number, CarLocation> {
    const updatedLocations = new Map(currentMap);
    let hasChanges = false;

    this.locationQueue.forEach((queue, driverId) => {
      let interpolator = this.activeInterpolations.get(driverId);
      let remainingDelta = deltaMS;

      while (remainingDelta > 0) {
        if (!interpolator || interpolator.progress >= 1) {
          const nextInterp = this.trySetupNextNode(queue, interpolator);
          if (!nextInterp) break;
          interpolator = nextInterp;
          this.activeInterpolations.set(driverId, interpolator);
        }

        const msRemainingInNode = (1 - interpolator.progress) * interpolator.durationMs;

        if (remainingDelta >= msRemainingInNode) {
          remainingDelta -= msRemainingInNode;
          interpolator.progress = 1;
        } else {
          interpolator.progress += remainingDelta / interpolator.durationMs;
          remainingDelta = 0;
        }
      }

      if (interpolator) {
        const rawProgress = Math.min(interpolator.progress, 1);
        const easedProgress = this.applyKinematicEasing(rawProgress, interpolator.prevDistance, interpolator.currentDistance);
        const currentX = this.lerp(interpolator.startX, interpolator.targetLocation.x, easedProgress);
        const currentY = this.lerp(interpolator.startY, interpolator.targetLocation.y, easedProgress);

        updatedLocations.set(driverId, {
          ...interpolator.targetLocation,
          x: currentX,
          y: currentY
        });
        hasChanges = true;
      }
    });

    return hasChanges ? updatedLocations : currentMap;
  }

  private trySetupNextNode(queue: CarLocation[], currentInterpolator?: InterpolationState): InterpolationState | null {
    if (queue.length === 0) return null;

    const nextLoc = queue.shift()!;
    const startX = currentInterpolator ? currentInterpolator.targetLocation.x : nextLoc.x;
    const startY = currentInterpolator ? currentInterpolator.targetLocation.y : nextLoc.y;

    const currentDistance = Math.hypot(nextLoc.x - startX, nextLoc.y - startY);
    const prevDistance = currentInterpolator ? currentInterpolator.currentDistance : currentDistance;

    let durationMs = 285;
    if (currentInterpolator?.targetLocation?.date && nextLoc.date) {
      const timeDiff = new Date(nextLoc.date).getTime() - new Date(currentInterpolator.targetLocation.date).getTime();
      if (timeDiff > 0 && timeDiff < 2000) {
        durationMs = timeDiff;
      }
    }

    return {
      startX,
      startY,
      targetLocation: nextLoc,
      progress: currentInterpolator ? (currentInterpolator.progress - 1) : 0,
      prevDistance,
      currentDistance,
      durationMs
    };
  }

  private applyKinematicEasing(progress: number, prevVelocity: number, currentVelocity: number): number {
    const sumV = prevVelocity + currentVelocity;
    if (sumV <= 0) return progress;
    return (2 * prevVelocity * progress + (currentVelocity - prevVelocity) * progress * progress) / sumV;
  }

  private lerp(start: number, end: number, progress: number): number {
    return start + (end - start) * progress;
  }
}
