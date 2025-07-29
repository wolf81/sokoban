import { Vector } from "../lib/ignite";
import { TileType } from "../types";
import { Action } from "./action";

export type Actor = Box | Player;
export type Entity = Actor | Goal;

export type Box = {
  readonly type: TileType.Box;
  spriteIndex: number;
  pos: Vector;
  lastPos: Vector;
};

export type Player = {
  readonly type: TileType.Player;
  spriteIndex: number;
  pos: Vector;
  lastPos: Vector;
  action: Action;
};

export type Goal = {
  readonly type: TileType.Goal;
  pos: Vector;
};

export const Entity = {
  player(x: number, y: number): Player {
    return {
      type: TileType.Player,
      pos: { x: x, y: y },
      lastPos: { x: x, y: y },
      action: Action.idle(),
      spriteIndex: 82,
    };
  },

  box(x: number, y: number): Box {
    return {
      type: TileType.Box,
      pos: { x: x, y: y },
      lastPos: { x: x, y: y },
      spriteIndex: 10,
    };
  },

  goal(x: number, y: number): Goal {
    return { type: TileType.Goal, pos: { x: x, y: y } };
  },
};
