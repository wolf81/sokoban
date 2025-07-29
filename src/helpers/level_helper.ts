import { TILE_W, TILE_H } from "../constants";
import { Grid } from "../core/grid";
import { Level } from "../core/level";
import { Vector, ServiceLocator, AssetLoader, Sprite } from "../lib/ignite";
import { Dir, TileType } from "../types";
import { TextureHelper } from "./texture_helper";

export const LevelHelper = {
  /**
   * Draw the wall floor and goal tiles in a single image, to reduce draw calls.
   * @param level The level to draw the background image for.
   * @returns A background image.
   */
  generateBackground(level: Level) {
    const w = level.grid.w * TILE_W;
    const h = level.grid.h * TILE_H;
    const playerPos = level.player.pos;

    // Find visible grid positions "inside" the map, including the walls.
    // This is achieved by flood filling the visible area starting from player
    // position.
    const visible: boolean[][] = Array.from({ length: h }, () =>
      Array(w).fill(false)
    );

    // Flood fill from player position outwards, until walls are reached.
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

    // Generate a texture using the coordinates from the flood fill.
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

/**
 * Draw a sprite on a context.
 * @param ctx The context to draw on.
 * @param image The sprite atlas image.
 * @param sprite The sprite (coords in atlas image).
 * @param x The x coord of the target draw position.
 * @param y The y coord of the target draw position.
 */
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
