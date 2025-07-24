import { CANVAS_H, CANVAS_W, TILE_H, TILE_W } from "../constants";
import { LevelHelper } from "../helpers/level_helper";
import { Level } from "../core/level";

import {
  AssetLoader,
  Camera,
  InputListener,
  Renderer,
  Scene,
  SceneManager,
  ServiceLocator,
  Timer,
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

function changeLevel(levelIndex: number) {
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new GameScene(levelIndex));
}

export class GameScene extends Scene {
  private _level: Level;
  private _background: HTMLCanvasElement;
  private _inputListener: InputListener;
  private _camera: Camera;
  private _movementMap: MovementMap;
  private _nextDir: Vector = Vector.zero;
  private _checkFinished: boolean = false;

  constructor(levelIndex: number) {
    super();

    this._inputListener = ServiceLocator.resolve(InputListener);

    this._level = loadLevel(levelIndex);
    this._background = LevelHelper.generateBackground(this._level);
    this._movementMap = MovementMap.forLevel(this._level);
    this._camera = new Camera();
    this._camera.scale = 0.75;

    const maxW = Math.floor(CANVAS_W / TILE_W / this._camera.scale);
    const maxH = Math.floor(CANVAS_H / TILE_H / this._camera.scale);
    this._camera.pos.x = -((maxW - this._level.grid.w) / 2) * TILE_W;
    this._camera.pos.y = -((maxH - this._level.grid.h) / 2) * TILE_H;
  }

  update(dt: number): void {
    const action = this._level.player.action;

    if (this._inputListener.wasKeyReleased("F5")) {
      changeLevel(this._level.index);
    }

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
    if (action.type === ActionType.Idle) {
      if (this._checkFinished) {
        this._checkFinished = false;

        let boxPositions = this._level.boxes.map((b) => b.pos);
        let goalPositions = this._level.goals.map((g) => g.pos);
        let remaining = goalPositions.length;

        while (goalPositions.length > 0) {
          let gp = goalPositions.pop()!;

          for (let bp of boxPositions) {
            if (Vector.isEqual(gp, bp)) {
              remaining -= 1;
            }
          }
        }

        if (remaining === 0) {
          Timer.after(1.0, () => changeLevel(this._level.index + 1));
        }
      }

      if (this._nextDir !== Dir.None) {
        const nextDir = Vector.clone(this._nextDir);
        const didMove = this.tryMove(nextDir);
        const didPush = !didMove && this.tryPush(nextDir);

        if (didMove || didPush) {
          this._level.turns += 1;
        }

        if (didPush) {
          this._checkFinished = true;
        }
      }
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

  tryMove(dir: Vector): boolean {
    const pos = this._level.player.pos;
    const nextPos = Vector.add(pos, dir);
    if (this.isBlocked(nextPos)) return false;
    if (this.getBox(nextPos)) return false;

    this._level.player.action = Action.move(pos, dir);

    return true;
  }

  tryPush(dir: Vector): boolean {
    const pos = this._level.player.pos;
    const nextPos = Vector.add(pos, dir);
    const box = this.getBox(nextPos);
    if (!box) return false;

    const nextNextPos = Vector.add(nextPos, dir);
    if (this.isBlocked(nextNextPos) || this.getBox(nextNextPos)) {
      return false;
    }
    this._level.player.action = Action.push(pos, dir, box);

    return true;
  }
}
