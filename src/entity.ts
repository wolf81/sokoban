import { vector } from "./lib/ignite";

export type Entity = Box | Player;

export type Box = {
  readonly kind: "box";
  pos: vector;
};

export type Player = {
  readonly kind: "player";
  pos: vector;
};

export const Entity = {
  create(char: string, x: number, y: number): Entity {
    switch (char) {
      case "@":
      case "+":
        return player(x, y);
      case "$":
      case "*":
        return box(x, y);
    }

    throw new Error(`No entity type defined for character: ${char}`);
  },
};

function player(x: number, y: number): Player {
  return { kind: "player", pos: { x: x, y: y } };
}

function box(x: number, y: number): Box {
  return { kind: "box", pos: { x: x, y: y } };
}
