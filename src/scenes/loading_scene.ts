import { CANVAS_H, CANVAS_W } from "../constants";
import {
  ServiceLocator,
  AssetLoader,
  SceneManager,
  Scene,
  Renderer,
} from "../lib/ignite";
import { MenuScene } from "./menu_scene";

async function startLoading(): Promise<void> {
  const assetLoader = ServiceLocator.resolve(AssetLoader);
  await assetLoader.preload();

  assetLoader.loadSpriteSheet("sokoban_spritesheet");
}

function showMainMenu() {
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new MenuScene());
}

export class LoadingScene extends Scene {
  private _isLoading: boolean = false;
  private _time: number = 0;
  private _suffix: string = "";

  update(dt: number): void {
    this._time += dt * 3;

    // Create suffix: Loading. → Loading.. → Loading... → Loading.
    this._suffix = "";
    const dots = Math.floor(this._time % 4);
    for (let i = 0; i < dots; i++) {
      this._suffix += ".";
    }

    if (this._isLoading) return;
    this._isLoading = true;

    startLoading().then((_) => showMainMenu());
  }

  draw(renderer: Renderer): void {
    let text = `Loading${this._suffix}`;
    renderer.drawText(text, CANVAS_W / 2, CANVAS_H / 2, {
      align: "center",
      font: "32px fantasy",
    });
  }
}
