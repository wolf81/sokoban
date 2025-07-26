import { Box, Entity, Goal, Player } from "./entity";
import { Grid } from "./grid";
import { Assert, Vector, XmlNode, XmlParser } from "../lib/ignite";
import { ActionType, TileType } from "../types";

const STORAGE_NAME = "state.json";

export type Level = {
  index: number;
  grid: Grid;
  player: Player;
  boxes: Box[];
  goals: Goal[];
  turns: number;
  moves: { type: ActionType; dir: Vector }[];
};

export const Level = {
  /**
   * Parse a level from an XML document.
   * @param xml The XML document to parse.
   * @param levelIndex The level index.
   * @returns A level on success, otherwise an error.
   */
  parse(xml: XmlNode, levelIndex: number): Level {
    const levelNodes = XmlParser.findNodes(xml, "Level");

    Assert.true(levelIndex < levelNodes.length, "Index out of bounds.");

    const levelNode = levelNodes[levelIndex];
    const w = Number(levelNode.attributes["Width"]);
    const h = Number(levelNode.attributes["Height"]);
    const grid = Grid.new(w, h);

    const boxes: Box[] = [];
    const goals: Goal[] = [];
    let player: Player | undefined = undefined;

    for (let y = 0; y < levelNode.children.length; y++) {
      const lineNode = levelNode.children[y];
      const text = lineNode.text ?? "";

      for (let x = 0; x < text.length; x++) {
        const char = text[x];
        for (let tileType of getTileTypes(char)) {
          Grid.setTile(grid, x, y, TileType.Floor);

          switch (tileType) {
            case TileType.Floor:
              continue;
            case TileType.Wall:
              Grid.setTile(grid, x, y, TileType.Wall);
              continue;
            case TileType.Player:
              player = Entity.player(x, y);
              continue;
            case TileType.Box:
              boxes.push(Entity.box(x, y));
              continue;
            case TileType.Goal:
              goals.push(Entity.goal(x, y));
              continue;
          }
        }
      }
    }

    Assert.defined(player, "No player found in level.");

    return {
      index: levelIndex,
      grid: grid,
      player: player!,
      boxes: boxes,
      goals: goals,
      turns: 0,
      moves: [],
    };
  },

  save(level: Level) {
    const json = JSON.stringify(level);
    localStorage.setItem(STORAGE_NAME, json);
  },

  load(): Level | undefined {
    const json = localStorage.getItem(STORAGE_NAME);
    if (json === null) return undefined;
    return JSON.parse(json);
  },
};

/**
 * Iterate over the tile types for given char. Some characters represent
 * multiple tile types and thus can be iterated over multiple times.
 * @param char
 * @returns
 */
function* getTileTypes(char: string): Generator<TileType> {
  switch (char) {
    case " ":
      yield TileType.Floor;
      return;
    case "#":
      yield TileType.Wall;
      return;
    case "@":
      yield TileType.Player;
      return;
    case "+":
      yield TileType.Player;
      yield TileType.Goal;
      return;
    case "$":
      yield TileType.Box;
      return;
    case "*":
      yield TileType.Box;
      yield TileType.Goal;
      return;
    case ".":
      yield TileType.Goal;
      return;
  }

  throw new Error(`No entity type defined for character: ${char}`);
}
