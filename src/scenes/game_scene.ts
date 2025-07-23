import { TILE_H, TILE_W } from "../constants";
import { Grid } from "../grid";
import { TextureHelper } from "../helpers/texture_helper";
import { Level } from "../level";
import { AssetLoader, Renderer, Scene, ServiceLocator } from "../lib/ignite";
import { TileType } from "../types";

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

function createBackground(level: Level): HTMLCanvasElement {
  const assetLoader = ServiceLocator.resolve(AssetLoader);
  const image = assetLoader.getImage("sokoban_spritesheet")!;
  const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet")!;

  const w = level.grid.w * TILE_W;
  const h = level.grid.h * TILE_H;
  return TextureHelper.generate(w, h, (ctx) => {
    for (let y = 0; y < level.grid.h; y++) {
      for (let x = 0; x < level.grid.w; x++) {
        const spriteIndex = getSpriteIndex(TileType.Floor);
        const sprite = spriteSheet[spriteIndex];
        ctx.drawImage(
          image,
          sprite.x,
          sprite.y,
          sprite.w,
          sprite.h,
          x * TILE_W,
          y * TILE_H,
          sprite.w,
          sprite.h
        );
      }
    }
  });
}

export class GameScene extends Scene {
  private _level: Level;
  private _background: HTMLCanvasElement;

  constructor(levelIndex: number) {
    super();

    this._level = loadLevel(levelIndex);
    this._background = createBackground(this._level);
  }

  update(dt: number): void {}

  draw(renderer: Renderer): void {
    renderer.drawImage(this._background, 0, 0);

    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const image = assetLoader.getImage("sokoban_spritesheet")!;
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet")!;

    for (let y = 0; y < this._level.grid.h; y++) {
      for (let x = 0; x < this._level.grid.w; x++) {
        const tile = Grid.getTile(this._level.grid, x, y);
        if (tile === TileType.Floor) continue;

        const spriteIndex = getSpriteIndex(tile);
        const sprite = spriteSheet[spriteIndex];
        renderer.drawSprite(image, sprite, x * TILE_W, y * TILE_H);
      }
    }

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

    for (let goal of this._level.goals) {
      const spriteIndex = getSpriteIndex(TileType.Goal);
      const sprite = spriteSheet[spriteIndex];
      renderer.drawSprite(
        image,
        sprite,
        goal.pos.x * TILE_W,
        goal.pos.y * TILE_H
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
