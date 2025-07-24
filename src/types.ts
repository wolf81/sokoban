import { Vector } from "./lib/ignite";

export enum TileType {
  Floor = 0,
  Wall,
  Player,
  Box,
  Goal,
}

export enum ActionType {
  Idle = 0,
  Move,
  Push,
}

export const Dir = {
  None: Vector.zero,
  N: Vector.new(0, -1),
  S: Vector.new(0, 1),
  W: Vector.new(-1, 0),
  E: Vector.new(1, 0),
  NW: Vector.new(-1, -1),
  SW: Vector.new(-1, 1),
  SE: Vector.new(1, 1),
  NE: Vector.new(1, -1),
} as const;
