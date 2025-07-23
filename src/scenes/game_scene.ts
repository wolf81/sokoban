import { TILE_H, TILE_W } from "../constants";
import { Grid } from "../grid";
import { TextureHelper } from "../helpers/texture_helper";
import { Level } from "../level";
import {
  AssetLoader,
  Renderer,
  Scene,
  ServiceLocator,
  Vector,
} from "../lib/ignite";
import { Sprite } from "../spritesheet";
import { Dir, TileType } from "../types";

function loadLevel(index: number): Level {
  const assetLoader = ServiceLocator.resolve(AssetLoader);
  const levelXml = assetLoader.getXml("levels");
  return Level.parse(levelXml, index);
}

function getSpriteIndex(tile: TileType): number {
  switch (tile) {
    case TileType.Wall:
      return 1; // 5
    case TileType.Floor:
      return 69;
    case TileType.Goal:
      return 72;
    case TileType.Box:
      return 10;
    case TileType.Player:
      return 78;
  }
}

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

function newBackground(level: Level): HTMLCanvasElement {
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
}

export class GameScene extends Scene {
  private _level: Level;
  private _background: HTMLCanvasElement;

  constructor(levelIndex: number) {
    super();

    this._level = loadLevel(levelIndex);
    this._background = newBackground(this._level);
  }

  update(dt: number): void {}

  draw(renderer: Renderer): void {
    renderer.drawImage(this._background, 0, 0);

    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const image = assetLoader.getImage("sokoban_spritesheet")!;
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet")!;

    for (let box of this._level.boxes) {
      const spriteIndex = getSpriteIndex(TileType.Box);
      const sprite = spriteSheet[spriteIndex];
      renderer.drawSprite(
        image,
        sprite,
        box.pos.x * TILE_W,
        box.pos.y * TILE_H
      );
    }

    const spriteIndex = getSpriteIndex(TileType.Player);
    const sprite = spriteSheet[spriteIndex];
    renderer.drawSprite(
      image,
      sprite,
      this._level.player.pos.x * TILE_W,
      this._level.player.pos.y * TILE_H
    );
  }
}
