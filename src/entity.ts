import { Vector } from "./lib/ignite";
import { TileType } from "./types";

export type Entity = Box | Player | Goal;

export type Box = {
  readonly type: TileType.Box;
  pos: Vector;
};

export type Player = {
  readonly type: TileType.Player;
  pos: Vector;
};

export type Goal = {
  readonly type: TileType.Goal;
  pos: Vector;
};

export const Entity = {
  player(x: number, y: number): Player {
    return { type: TileType.Player, pos: { x: x, y: y } };
  },

  box(x: number, y: number): Box {
    return { type: TileType.Box, pos: { x: x, y: y } };
  },

  goal(x: number, y: number): Goal {
    return { type: TileType.Goal, pos: { x: x, y: y } };
  },
};
