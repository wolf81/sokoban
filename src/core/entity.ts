import {
  AssetLoader,
  ServiceLocator,
  SpriteAnimation,
  SpriteAnimations,
  SpriteAnimator,
  Vector,
} from "../lib/ignite";
import { TileType } from "../types";
import { Action } from "./action";

export type Actor = Box | Player;
export type Entity = Actor | Goal;

export type Box = {
  readonly type: TileType.Box;
  pos: Vector;
  lastPos: Vector;
  animator: SpriteAnimator;
  animations: SpriteAnimations;
};

export type Player = {
  readonly type: TileType.Player;
  pos: Vector;
  lastPos: Vector;
  action: Action;
  animator: SpriteAnimator;
  animations: SpriteAnimations;
};

export type Goal = {
  readonly type: TileType.Goal;
  pos: Vector;
};

export const Entity = {
  player(x: number, y: number): Player {
    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet");
    return {
      type: TileType.Player,
      pos: { x: x, y: y },
      lastPos: { x: x, y: y },
      action: Action.idle(),
      animator: SpriteAnimator.new("idleS"),
      animations: {
        idleS: SpriteAnimation.new(spriteSheet, [82], 1, true),
        idleN: SpriteAnimation.new(spriteSheet, [85], 1, true),
        idleW: SpriteAnimation.new(spriteSheet, [97], 1, true),
        idleE: SpriteAnimation.new(spriteSheet, [94], 1, true),
        moveS: SpriteAnimation.new(spriteSheet, [83, 82, 84, 82], 0.12, true),
        moveN: SpriteAnimation.new(spriteSheet, [86, 85, 87, 85], 0.12, true),
        moveW: SpriteAnimation.new(spriteSheet, [98, 97, 99, 97], 0.12, true),
        moveE: SpriteAnimation.new(spriteSheet, [95, 94, 96, 94], 0.12, true),
      },
    };
  },

  box(x: number, y: number): Box {
    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet");
    return {
      type: TileType.Box,
      pos: { x: x, y: y },
      lastPos: { x: x, y: y },
      animator: SpriteAnimator.new("normal"),
      animations: {
        normal: SpriteAnimation.new(spriteSheet, [20], 1.0, true),
        active: SpriteAnimation.new(spriteSheet, [10], 1.0, true),
      },
    };
  },

  goal(x: number, y: number): Goal {
    return { type: TileType.Goal, pos: { x: x, y: y } };
  },
};
