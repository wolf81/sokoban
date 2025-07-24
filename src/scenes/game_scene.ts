import { Camera } from "../camera";
import { TILE_H, TILE_W } from "../constants";
import { LevelHelper } from "../helpers/level_helper";
import { Level } from "../level";

import {
  AssetLoader,
  InputListener,
  Renderer,
  Scene,
  ServiceLocator,
  Vector,
} from "../lib/ignite";
import { MovementMap } from "../movement_map";
import { Dir, TileType } from "../types";

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
  private _inputListener: InputListener;
  private _camera: Camera;
  private _movementMap: MovementMap;

  constructor(levelIndex: number) {
    super();

    this._inputListener = ServiceLocator.resolve(InputListener);

    this._level = loadLevel(levelIndex);
    this._background = LevelHelper.generateBackground(this._level);
    this._movementMap = MovementMap.forLevel(this._level);
    this._camera = new Camera();
    this._camera.scale = 0.75;
  }

  update(dt: number): void {
    if (this._inputListener.wasKeyReleased("w")) {
      this.tryMovePlayer(Dir.N);
    }
    if (this._inputListener.wasKeyReleased("a")) {
      this.tryMovePlayer(Dir.W);
    }
    if (this._inputListener.wasKeyReleased("s")) {
      this.tryMovePlayer(Dir.S);
    }
    if (this._inputListener.wasKeyReleased("d")) {
      this.tryMovePlayer(Dir.E);
    }
  }

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

  isBlocked(pos: Vector): boolean {
    return this._movementMap.isBlocked(pos.x, pos.y);
  }

  tryMovePlayer(dir: Vector): boolean {
    const nextPos = Vector.add(this._level.player.pos, dir);
    if (this.isBlocked(nextPos)) return false;

    this._level.player.pos = nextPos;
    return true;
  }
}
