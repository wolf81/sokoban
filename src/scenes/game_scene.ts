import { Camera } from "../camera";
import { TILE_H, TILE_W } from "../constants";
import { LevelHelper } from "../helpers/level_helper";
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
    case TileType.Box:
      return 10;
    case TileType.Player:
      return 78;
  }

  throw new Error(`No sprite defined for tile: ${tile}`);
}

export class GameScene extends Scene {
  private _level: Level;
  private _background: HTMLCanvasElement;
  private _camera: Camera;

  constructor(levelIndex: number) {
    super();

    this._level = loadLevel(levelIndex);
    this._background = LevelHelper.generateBackground(this._level);
    this._camera = new Camera();
    this._camera.scale = 0.75;
  }

  update(dt: number): void {}

  draw(renderer: Renderer): void {
    renderer.applyCamera(this._camera);

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

    renderer.applyCamera();
  }
}
