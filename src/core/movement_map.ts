import { Grid } from "./grid";
import { Level } from "./level";
import { TileType } from "../types";

/**
 * The movement map is used to determine movable coordinates. A coordinate that
 * contains a wall is not movable. The movement map doesn't take into account
 * box coordinates.
 */
export class MovementMap {
  private _blocked: boolean[][];

  private constructor(grid: Grid) {
    this._blocked = Array.from({ length: grid.h }, () =>
      Array(grid.w).fill(false)
    );

    for (let y = 0; y < grid.h; y++) {
      for (let x = 0; x < grid.w; x++) {
        this._blocked[y][x] = Grid.getTile(grid, x, y) === TileType.Wall;
      }
    }
  }

  /**
   * Create a movement map for a given level.
   * @param level
   * @returns
   */
  static forLevel(level: Level): MovementMap {
    return new MovementMap(level.grid);
  }

  /**
   * Check whether a coordinate is blocked.
   * @param x
   * @param y
   * @returns True is the target coordinate is blocked.
   */
  isBlocked(x: number, y: number): boolean {
    return this._blocked[y][x];
  }
}
