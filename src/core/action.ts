import { Vector } from "../lib/ignite";
import { ActionType } from "../types";
import { Box } from "./entity";
import { Level } from "./level";

const ANIM_FRAME_COUNT = Math.floor(0.2 * 60);

export type MoveAction = {
  type: ActionType.Move;
  frame: number;
  pos: Vector;
  dir: Vector;
};

export type PushAction = {
  type: ActionType.Push;
  frame: number;
  pos: Vector;
  dir: Vector;
  box: Box;
};

export type IdleAction = {
  type: ActionType.Idle;
};

export type Action = MoveAction | PushAction | IdleAction;

export const Action = {
  idle(): IdleAction {
    return { type: ActionType.Idle };
  },

  move(pos: Vector, dir: Vector): MoveAction {
    return { type: ActionType.Move, frame: 0, pos: pos, dir: dir };
  },

  push(pos: Vector, dir: Vector, box: Box): PushAction {
    return { type: ActionType.Push, frame: 0, pos: pos, dir: dir, box: box };
  },

  update(action: Action, level: Level, dt: number) {
    const player = level.player;

    switch (action.type) {
      case ActionType.Idle:
        return;
      case ActionType.Move:
        const toPos = Vector.add(action.pos, action.dir);
        action.frame += 1;
        const t = action.frame / ANIM_FRAME_COUNT;

        if (t >= 1) {
          player.pos = toPos;
          player.action = Action.idle();
        } else {
          player.pos = Vector.lerp(action.pos, toPos, t);
        }
        break;
      case ActionType.Push:
        break;
    }
  },
};
