import { Grid } from "./grid";
import { Level } from "./level";
import { TileType } from "./types";

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

  static forLevel(level: Level): MovementMap {
    return new MovementMap(level.grid);
  }

  isBlocked(x: number, y: number): boolean {
    return this._blocked[y][x];
  }
}
