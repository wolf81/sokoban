import { Sprite, SpriteSheet } from "./spritesheet";

export type SpriteAnimationFrame = {
  sprite: Sprite;
  duration: number;
};

export type SpriteAnimation = {
  frames: SpriteAnimationFrame[];
  isLooping: boolean;
};

export type SpriteAnimations = Record<string, SpriteAnimation>;

export type SpriteAnimator = {
  current: string;
  elapsed: number;
  frameIndex: number;
};

export const SpriteAnimator = {
  new(
    current: string,
    elapsed: number = 0,
    frameIndex: number = 0
  ): SpriteAnimator {
    return {
      current: current,
      elapsed: elapsed,
      frameIndex: frameIndex,
    };
  },

  getFrame(
    animator: SpriteAnimator,
    animations: SpriteAnimations
  ): SpriteAnimationFrame {
    const animation = animations[animator.current];
    return animation.frames[animator.frameIndex];
  },

  update(animator: SpriteAnimator, animations: SpriteAnimations, dt: number) {
    animator.elapsed += dt;

    const animation = animations[animator.current];

    while (animator.elapsed >= animation.frames[animator.frameIndex].duration) {
      animator.elapsed -= animation.frames[animator.frameIndex].duration;
      animator.frameIndex += 1;

      if (animator.frameIndex >= animation.frames.length) {
        if (animation.isLooping) {
          animator.frameIndex = 0;
        } else {
          animator.frameIndex = animation.frames.length - 1;
          break;
        }
      }
    }
  },
};

export const SpriteAnimation = {
  new(
    sheet: SpriteSheet,
    sprites: number[],
    frameDuration: number,
    isLooping: boolean
  ): SpriteAnimation {
    const frames = sprites.map((index) => ({
      sprite: sheet.sprites[index],
      duration: frameDuration,
    }));

    return { frames: frames, isLooping: isLooping };
  },
};
