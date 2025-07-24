import { TILE_W, TILE_H } from "../constants";
import { Grid } from "../core/grid";
import { Level } from "../core/level";
import { Vector, ServiceLocator, AssetLoader } from "../lib/ignite";
import { Sprite } from "../spritesheet";
import { Dir, TileType } from "../types";
import { TextureHelper } from "./texture_helper";

export const LevelHelper = {
  generateBackground(level: Level) {
    const w = level.grid.w * TILE_W;
    const h = level.grid.h * TILE_H;
    const playerPos = level.player.pos;

    // Find visible grid positions "inside" the map, including the walls.
    // This is achieved by floodfilling the visible array starting from player
    // position.
    const visible: boolean[][] = Array.from({ length: h }, () =>
      Array(w).fill(false)
    );

    const dirs = [Dir.N, Dir.W, Dir.S, Dir.E, Dir.NW, Dir.SW, Dir.NE, Dir.SE];
    const queue: [Vector] = [playerPos];
    while (queue.length > 0) {
      const p = queue.pop()!;
      if (p.x < 0 || p.x >= w || p.y < 0 || p.y >= h) continue;
      if (visible[p.y][p.x]) continue;
      if (Grid.getTile(level.grid, p.x, p.y) === TileType.Wall) {
        visible[p.y][p.x] = true;
        continue;
      }

      visible[p.y][p.x] = true;

      for (let dir of dirs) {
        queue.push(Vector.add(p, dir));
      }
    }

    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const image = assetLoader.getImage("sokoban_spritesheet")!;
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet")!;

    return TextureHelper.generate(w, h, (ctx) => {
      for (let y = 0; y < level.grid.h; y++) {
        for (let x = 0; x < level.grid.w; x++) {
          if (!visible[y][x]) continue;

          const tile = Grid.getTile(level.grid, x, y);
          switch (tile) {
            case TileType.Wall:
              drawSprite(ctx, image, spriteSheet[1], x * TILE_W, y * TILE_H);
              break;
            default:
              drawSprite(ctx, image, spriteSheet[69], x * TILE_W, y * TILE_H);
              break;
          }
        }
      }

      for (let goal of level.goals) {
        drawSprite(
          ctx,
          image,
          spriteSheet[72],
          goal.pos.x * TILE_W,
          goal.pos.y * TILE_H
        );
      }
    });
  },
};

function drawSprite(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  sprite: Sprite,
  x: number,
  y: number
) {
  ctx.drawImage(
    image,
    sprite.x,
    sprite.y,
    sprite.w,
    sprite.h,
    x,
    y,
    sprite.w,
    sprite.h
  );
}
