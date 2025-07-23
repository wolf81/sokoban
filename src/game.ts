import { Level } from "./level";
import {
  SceneManager,
  InputListener,
  AssetLoader,
  ServiceLocator,
  Timer,
  Renderer,
} from "./lib/ignite";
import { GameScene } from "./scenes/game_scene";
import { Settings } from "./settings";
import { Spritesheet } from "./spritesheet";
// import { UI } from "./core/ui";
// import { LoadingScene } from "./scenes/loading_scene";

/**
 * The Game class contains the core game logic.
 */
export class Game {
  private _sceneManager: SceneManager;
  private _inputListener: InputListener;
  private _assetLoader: AssetLoader;

  constructor(canvas: HTMLCanvasElement) {
    this._inputListener = new InputListener(canvas);
    ServiceLocator.register(InputListener, this._inputListener);

    this._sceneManager = new SceneManager(canvas.width, canvas.height);
    ServiceLocator.register(SceneManager, this._sceneManager);

    this._assetLoader = new AssetLoader();
    ServiceLocator.register(AssetLoader, this._assetLoader);

    // UI.init(canvas);
  }

  async init(): Promise<void> {
    await this._assetLoader.preload();

    this._assetLoader.loadSpriteSheet("sokoban_spritesheet");

    this._sceneManager.switch(new GameScene(0));
  }

  update(dt: number) {
    this._sceneManager.update(dt);

    if (this._inputListener.wasKeyReleased("F1")) {
      Settings.showFps = !Settings.showFps;
      Settings.showDraws = !Settings.showDraws;
    }

    this._inputListener.update();

    Timer.update(dt);
    // UI.update();
  }

  draw(renderer: Renderer) {
    this._sceneManager.draw(renderer);
  }
}
