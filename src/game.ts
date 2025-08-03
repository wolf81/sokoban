import {
  SceneManager,
  InputListener,
  AssetLoader,
  ServiceLocator,
  Timer,
  Renderer,
  InputAction,
  UI,
  Style,
} from "./lib/ignite";
import { LoadingScene } from "./scenes/loading_scene";
import { Settings } from "./settings";

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
  }

  async init(): Promise<void> {
    this._sceneManager.switch(new LoadingScene());
  }

  update(dt: number) {
    this._sceneManager.update(dt);

    if (this._inputListener.isInputReleased(InputAction.ButtonL)) {
      Settings.showFps = !Settings.showFps;
      Settings.showDraws = !Settings.showDraws;
    }

    this._inputListener.update();

    Timer.update(dt);
  }

  draw(renderer: Renderer) {
    this._sceneManager.draw(renderer);
  }
}

const uiStyle: Style = {
  button: {
    font: "32px PoetsenOne",
    minSize: { w: 192, h: 64 },
    textColor: "#b48000",
    background: {
      normal: "button_square_depth_flat",
      hover: "button_square_depth_gloss",
      active: "button_square_gloss",
    },
  },
  label: {
    font: "36px PoetsenOne",
    textColor: "#b48000",
    align: "center",
    padding: 10,
  },
  panel: {
    background: "button_square_border",
    padding: 16,
    spacing: 16,
  },
  imageView: {
    minSize: { w: 320, h: 256 },
  },
};

UI.setStyle(uiStyle);
