import { CANVAS_H, CANVAS_W, TILE_H, TILE_W } from "../constants";
import { LevelHelper } from "../helpers/level_helper";
import { Level } from "../core/level";

import {
  AssetLoader,
  Camera,
  InputAction,
  InputListener,
  Renderer,
  Runloop,
  Scene,
  SceneManager,
  ServiceLocator,
  Timer,
  Vector,
} from "../lib/ignite";
import { MovementMap } from "../core/movement_map";
import { ActionType, Dir } from "../types";
import { Action } from "../core/action";
import { Actor, Box } from "../core/entity";
import { AudioHelper } from "../helpers/audio_helper";
import { MenuScene as MenuScene } from "./menu_scene";
import { LevelsLoader } from "../helpers/levels_loader";

export class GameScene extends Scene {
  private _level: Level;
  private _background: HTMLCanvasElement;
  private _inputListener: InputListener;
  private _camera: Camera;
  private _movementMap: MovementMap;
  private _nextDir: Vector = Vector.zero;
  private _checkFinished: boolean = true;
  private _revertDelay = 0;

  constructor(level: Level | number) {
    super();

    if (typeof level === "number") {
      this._level = LevelsLoader.loadLevel(Number(level));
    } else {
      this._level = level;
    }

    this._inputListener = ServiceLocator.resolve(InputListener);

    this._background = LevelHelper.generateBackground(this._level);
    this._movementMap = MovementMap.forLevel(this._level);
    this._camera = new Camera();
    this._camera.scale = 0.75;

    // Move camera in order to show level in the center of the canvas.
    const maxW = Math.floor(CANVAS_W / TILE_W / this._camera.scale);
    const maxH = Math.floor(CANVAS_H / TILE_H / this._camera.scale);
    this._camera.pos.x = -((maxW - this._level.grid.w) / 2) * TILE_W;
    this._camera.pos.y = -((maxH - this._level.grid.h) / 2) * TILE_H;
  }

  start() {
    this._level = LevelsLoader.loadLevel(0);
    this._background = LevelHelper.generateBackground(this._level);
    this._movementMap = MovementMap.forLevel(this._level);
    this._camera = new Camera();
    this._camera.scale = 0.75;

    // Move camera in order to show level in the center of the canvas.
    const maxW = Math.floor(CANVAS_W / TILE_W / this._camera.scale);
    const maxH = Math.floor(CANVAS_H / TILE_H / this._camera.scale);
    this._camera.pos.x = -((maxW - this._level.grid.w) / 2) * TILE_W;
    this._camera.pos.y = -((maxH - this._level.grid.h) / 2) * TILE_H;
  }

  update(dt: number): void {
    this._revertDelay = Math.max(this._revertDelay - dt, 0);

    // Reload current level if F5 is pressed.
    if (this._inputListener.isInputReleased(InputAction.Start)) {
      changeLevel(this._level.index);
    }
    if (this._inputListener.isInputReleased(InputAction.Select)) {
      Level.save(this._level);
      showMenu();
    }
    if (this._level.player.action.type === ActionType.Idle) {
      if (this._inputListener.isInputDown(InputAction.ButtonA)) {
        if (this._revertDelay === 0) {
          this.tryRevertMove();
          this._revertDelay = 0.15;
        }
      }
    }

    // Buffer next direction if key is pressed.
    this._nextDir = Dir.None;
    if (this._inputListener.isInputDown(InputAction.DPadU)) {
      this._nextDir = Dir.N;
    } else if (this._inputListener.isInputDown(InputAction.DPadL)) {
      this._nextDir = Dir.W;
    } else if (this._inputListener.isInputDown(InputAction.DPadD)) {
      this._nextDir = Dir.S;
    } else if (this._inputListener.isInputDown(InputAction.DPadR)) {
      this._nextDir = Dir.E;
    }

    // If player has stopped moving, check win condition & determine next move.
    if (this._level.player.action.type === ActionType.Idle) {
      // Check win condition, if needed.
      if (this._checkFinished) {
        this._checkFinished = false;

        let goalPositions = this._level.goals.map((g) => g.pos);
        let boxes = Array.from(this._level.boxes);
        let remaining = boxes.length;

        for (let box of boxes) {
          box.spriteIndex = 20;

          for (let i = 0; i < goalPositions.length; i++) {
            if (Vector.isEqual(box.pos, goalPositions[i])) {
              box.spriteIndex = 10;
              remaining -= 1;
              goalPositions.splice(i, 1);
              break;
            }
          }
        }

        // All boxes reached goal positions, so transition to next level.
        if (remaining === 0) {
          Timer.after(0.2, () => AudioHelper.playSound("jingles_SAX02"));
          Timer.after(1.0, () => changeLevel(this._level.index + 1));
        }
      }

      // If a direction is buffered, try to move in buffered direction.
      if (this._nextDir !== Dir.None) {
        const nextDir = Vector.clone(this._nextDir);
        const isMoving = this.tryMove(nextDir);
        const isPushing = !isMoving && this.tryPush(nextDir);

        // The player is either moving or pushing, so add a turn.
        if (isMoving || isPushing) {
          this._level.turns += 1;
        }

        // The player pushed a box, so check the win condition once player
        // stops moving.
        if (isPushing) {
          this._checkFinished = true;
        }
      }
    }

    // Keep track of last position for smooth animation interpolation in draw()
    this._level.player.lastPos = Vector.clone(this._level.player.pos);
    for (let box of this._level.boxes) {
      box.lastPos = Vector.clone(box.pos);
    }

    // Finally update player action with current time.
    Action.update(this._level.player.action, this._level, dt);
  }

  draw(renderer: Renderer): void {
    // Apply camera transform.
    renderer.applyCamera(this._camera);

    renderer.drawImage(this._background, 0, 0);

    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const image = assetLoader.getImage("sokoban_spritesheet");
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet");

    // Define actor drawing in local scope, so we can re-use the spritesheet &
    // image references on every call.
    const drawActor = (actor: Actor) => {
      const sprite = spriteSheet.sprites[actor.spriteIndex];
      const ox = TILE_W / 2 - sprite.w;
      const oy = TILE_H / 2 - sprite.h;

      const pos = Vector.lerp(actor.lastPos, actor.pos, Runloop.alpha);
      renderer.drawSprite(
        image,
        sprite,
        Math.floor(pos.x * TILE_W),
        Math.floor(pos.y * TILE_H),
        ox,
        oy,
        Math.PI / 2
      );
    };

    // Draw boxes.
    for (let box of this._level.boxes) {
      drawActor(box);
    }

    // Draw player.
    drawActor(this._level.player);

    // Reset camera transform.
    renderer.applyCamera();
  }

  /**
   * Check if a position has a wall.
   * @param pos The position to check for a wall.
   * @returns True if a wall exists at target position, otherwise false.
   */
  hasWall(pos: Vector): boolean {
    return this._movementMap.isBlocked(pos.x, pos.y);
  }

  /**
   * Try to get a box at a given position.
   * @param pos The position to check for a box.
   * @returns Either a box, or undefined if no box was found at target position.
   */
  tryGetBox(pos: Vector): Box | undefined {
    for (let box of this._level.boxes) {
      if (Vector.isEqual(box.pos, pos)) return box;
    }
    return undefined;
  }

  tryRevertMove(): void {
    let move = this._level.moves.pop();
    if (!move) return;

    let player = this._level.player;

    let oppositeDir = getOpposite(move.dir);

    if (move.type === ActionType.Push) {
      let pushPos = Vector.add(player.pos, move.dir);
      let box = this.tryGetBox(pushPos);
      if (box) {
        box.pos = Vector.add(box.pos, oppositeDir);
        box.lastPos = Vector.clone(box.pos);
      }
    }

    player.pos = Vector.add(player.pos, oppositeDir);
    player.lastPos = Vector.clone(player.pos);

    let prevMove = this._level.moves[this._level.moves.length - 1];
    if (prevMove) {
      player.action = Action.idle(prevMove.dir);
    } else {
      player.action = Action.idle(Dir.S);
    }
  }

  /**
   * Try move the player in a target direction. Movement will fail if the
   * direction is blocked by a wall or box.
   * @param dir The move direction.
   * @returns True if the player is moving.
   */
  tryMove(dir: Vector): boolean {
    const pos = this._level.player.pos;
    const nextPos = Vector.add(pos, dir);
    if (this.hasWall(nextPos)) return false;
    if (this.tryGetBox(nextPos)) return false;

    this._level.player.action = Action.move(pos, dir);

    return true;
  }

  /**
   * Try push a box in the target direction.
   * @param dir The push direction.
   * @returns True if a box is being pushed, otherwise false.
   */
  tryPush(dir: Vector): boolean {
    const pos = this._level.player.pos;
    const nextPos = Vector.add(pos, dir);
    const box = this.tryGetBox(nextPos);
    if (!box) return false;

    const nextNextPos = Vector.add(nextPos, dir);
    if (this.hasWall(nextNextPos) || this.tryGetBox(nextNextPos)) {
      return false;
    }
    this._level.player.action = Action.push(pos, dir, box);

    return true;
  }
}

function changeLevel(levelIndex: number) {
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new GameScene(levelIndex));
}

function showMenu() {
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new MenuScene());
}

function getOpposite(dir: Vector): Vector {
  return Vector.mul(dir, -1);
}
