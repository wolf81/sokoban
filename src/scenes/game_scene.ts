import { Camera } from "../camera";
import { TILE_H, TILE_W } from "../constants";
import { LevelHelper } from "../helpers/level_helper";
import { Level } from "../core/level";

import {
  AssetLoader,
  InputListener,
  Renderer,
  Scene,
  ServiceLocator,
  Vector,
} from "../lib/ignite";
import { MovementMap } from "../core/movement_map";
import { ActionType, Dir, TileType } from "../types";
import { Action } from "../core/action";
import { Box } from "../core/entity";

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
  private _nextDir: Vector = Vector.zero;

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
    const action = this._level.player.action;

    // Buffer next direction if key is pressed.
    this._nextDir = Dir.None;
    if (this._inputListener.isKeyDown("w")) {
      this._nextDir = Dir.N;
    } else if (this._inputListener.isKeyDown("a")) {
      this._nextDir = Dir.W;
    } else if (this._inputListener.isKeyDown("s")) {
      this._nextDir = Dir.S;
    } else if (this._inputListener.isKeyDown("d")) {
      this._nextDir = Dir.E;
    }

    // If idle and direction is queued, try to move
    if (action.type === ActionType.Idle && this._nextDir !== Dir.None) {
      this.tryMovePlayer(Vector.clone(this._nextDir));
    }

    Action.update(this._level.player.action, this._level, dt);
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
      this._level.player.pos.y * TILE_H,
      (TILE_W - sprite.w) / 2,
      (TILE_H - sprite.h) / 2
    );

    renderer.applyCamera();
  }

  isBlocked(pos: Vector): boolean {
    return this._movementMap.isBlocked(pos.x, pos.y);
  }

  getBox(pos: Vector): Box | undefined {
    for (let box of this._level.boxes) {
      if (Vector.isEqual(box.pos, pos)) return box;
    }
    return undefined;
  }

  isPlayerMoving(): boolean {
    return this._level.player.action.type !== ActionType.Idle;
  }

  tryMovePlayer(dir: Vector): boolean {
    const pos = this._level.player.pos;
    const nextPos = Vector.add(pos, dir);
    if (this.isBlocked(nextPos)) return false;

    const box = this.getBox(nextPos);
    if (box) {
      const nextNextPos = Vector.add(nextPos, dir);
      if (this.isBlocked(nextNextPos) || this.getBox(nextNextPos)) {
        return false;
      }
      this._level.player.action = Action.push(pos, dir, box);
    } else {
      this._level.player.action = Action.move(pos, dir);
    }

    return true;
  }
}
