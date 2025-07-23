import { Level } from "../level";
import { AssetLoader, Renderer, Scene, ServiceLocator } from "../lib/ignite";

function loadLevel(index: number): Level {
  const assetLoader = ServiceLocator.resolve(AssetLoader);
  const levelXml = assetLoader.getXml("levels");
  return Level.parse(levelXml, index);
}

export class GameScene extends Scene {
  private _level: Level;

  constructor(levelIndex: number) {
    super();

    this._level = loadLevel(levelIndex);
  }

  update(dt: number): void {}

  draw(renderer: Renderer): void {
    Level.draw(this._level, renderer);
  }
}
