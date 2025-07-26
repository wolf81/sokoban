import { AudioHelper } from "../helpers/audio_helper";
import { Vector } from "../lib/ignite";
import { ActionType, Dir } from "../types";
import { Box, Player } from "./entity";
import { Level } from "./level";

// Convert a target duration to fixed frame count, for smoother animations.
const ANIM_FRAME_COUNT = Math.floor(0.2 * 60);

/**
 * An action that represents the player moving.
 */
export type MoveAction = {
  type: ActionType.Move;
  frame: number;
  pos: Vector;
  dir: Vector;
};

/**
 * An action that represents the player pushing a box.
 */
export type PushAction = {
  type: ActionType.Push;
  frame: number;
  pos: Vector;
  dir: Vector;
  box: Box;
};

/**
 * An action that represents the player standing still.
 */
export type IdleAction = {
  type: ActionType.Idle;
  dir?: Vector;
};

export type Action = MoveAction | PushAction | IdleAction;

export const Action = {
  idle(dir?: Vector): IdleAction {
    return { type: ActionType.Idle, dir: dir };
  },

  move(pos: Vector, dir: Vector): MoveAction {
    AudioHelper.playRandomFootstep();
    return { type: ActionType.Move, frame: 0, pos: pos, dir: dir };
  },

  push(pos: Vector, dir: Vector, box: Box): PushAction {
    AudioHelper.playRandomFootstep();
    AudioHelper.playSound("push");
    return { type: ActionType.Push, frame: 0, pos: pos, dir: dir, box: box };
  },

  update(action: Action, level: Level, dt: number) {
    const player = level.player;

    switch (action.type) {
      case ActionType.Idle:
        if (action.dir) {
          let frames = getFrames(action.dir);
          player.spriteIndex = frames[frames.length - 1];
        }
        return;
      case ActionType.Move:
        movePlayer(player, action, () => {
          level.moves.push({ type: action.type, dir: action.dir });
        });
        break;
      case ActionType.Push:
        movePlayer(player, action, () => {
          level.moves.push({ type: action.type, dir: action.dir });
        });
        // A box moves in same direction as player.
        action.box.pos = Vector.add(player.pos, action.dir);
        break;
    }
  },
};

function movePlayer(
  player: Player,
  action: MoveAction | PushAction,
  onFinish: () => void
): void {
  const toPos = Vector.add(action.pos, action.dir);
  action.frame += 1;
  const t = action.frame / ANIM_FRAME_COUNT;

  const frames = getFrames(action.dir);
  const frameIdx = Math.floor(action.frame / frames.length);
  player.spriteIndex = frames[frameIdx];

  if (t >= 1) {
    player.pos = toPos;
    player.action = Action.idle();
    onFinish();
  } else {
    player.pos = Vector.lerp(action.pos, toPos, t);
  }
}

function getFrames(dir: Vector): number[] {
  let frames: number[] = [86, 85, 87, 85];
  if (Vector.isEqual(dir, Dir.S)) {
    frames = [83, 82, 84, 82];
  }
  if (Vector.isEqual(dir, Dir.W)) {
    frames = [98, 97, 99, 97];
  }
  if (Vector.isEqual(dir, Dir.E)) {
    frames = [95, 94, 96, 94];
  }
  return frames;
}
