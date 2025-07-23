import { TILE_H, TILE_W } from "./constants";
import { Grid } from "./grid";
import {
  Assert,
  AssetLoader,
  Renderer,
  ServiceLocator,
  XmlNode,
  XmlParser,
} from "./lib/ignite";
import { TileType } from "./types";

export type Level = {
  id: number;
  grid: Grid;
};

export const Level = {
  parse(xml: XmlNode, levelIndex: number): Level {
    const levelNodes = XmlParser.findNodes(xml, "Level");

    Assert.true(levelIndex < levelNodes.length, "Index out of bounds.");

    const levelNode = levelNodes[levelIndex];
    const id = Number(levelNode.attributes["Id"]);
    const w = Number(levelNode.attributes["Width"]);
    const h = Number(levelNode.attributes["Height"]);
    const grid = Grid.create(w, h);

    for (let y = 0; y < levelNode.children.length; y++) {
      const lineNode = levelNode.children[y];
      const text = lineNode.text ?? "";

      for (let x = 0; x < text.length; x++) {
        const char = text[x];
        for (let tileType of getTileTypes(char)) {
          switch (tileType) {
            case TileType.Wall:
            case TileType.Floor:
            case TileType.Goal:
              Grid.setTile(grid, x, y, tileType);
              break;
            default:
              break;
          }
        }
      }
    }

    return {
      id: id,
      grid: grid,
    };
  },

  draw(level: Level, renderer: Renderer) {
    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const image = assetLoader.getImage("sokoban_spritesheet")!;
    const spriteSheet = assetLoader.getSpriteSheet("sokoban_spritesheet")!;

    for (let y = 0; y < level.grid.h; y++) {
      for (let x = 0; x < level.grid.w; x++) {
        const tile = Grid.getTile(level.grid, x, y);

        const spriteIndex = getSpriteIndex(tile);
        const sprite = spriteSheet[spriteIndex];
        renderer.drawSprite(image, sprite, x * TILE_W, y * TILE_H);
      }
    }
  },
};

function getSpriteIndex(tile: TileType): number {
  switch (tile) {
    case TileType.Wall:
      return 3;
    case TileType.Floor:
      return 71;
    case TileType.Goal:
      return 55;
  }
  throw new Error(`No sprite index defined for tile type: ${tile}`);
}

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
