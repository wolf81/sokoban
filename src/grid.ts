import { TileType } from "./types";

export type Tile = {
  type: TileType;
  sprite: number;
};

export type Grid = {
  w: number;
  h: number;
  values: TileType[];
};

export const Grid = {
  create(w: number, h: number): Grid {
    const values: TileType[] = [];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let i = y * w + x;
        values[i] = TileType.Floor;
      }
    }

    return {
      w: w,
      h: h,
      values: values,
    };
  },

  setTile(grid: Grid, x: number, y: number, tile: TileType) {
    grid.values[y * grid.w + x] = tile;
  },

  getTile(grid: Grid, x: number, y: number): TileType {
    return grid.values[y * grid.w + x];
  },
};
