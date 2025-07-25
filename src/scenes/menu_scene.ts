import { CANVAS_H, CANVAS_W } from "../constants";
import { Level } from "../core/level";
import { Control, ControlState, UI } from "../core/ui";
import { AudioHelper } from "../helpers/audio_helper";
import {
  ServiceLocator,
  SceneManager,
  Scene,
  Layout,
  Tidy,
  Renderer,
} from "../lib/ignite";
import { GameScene } from "./game_scene";

export class MenuScene extends Scene {
  private _level: Level | undefined;

  private _continueButton = UI.button("Continue", {
    size: 32,
    textColor: "b48000",
    onClick: () => continueGame(this._level!),
  });

  private _layout: Layout<Control> = Tidy.border([
    UI.panel(),
    Tidy.border(
      [
        Tidy.vstack<Control>(
          [
            UI.label("PusherMan!", { size: 40, textColor: "#b48000" }),
            this._continueButton,
            UI.button("New Game", {
              size: 32,
              textColor: "b48000",
              onClick: () => startGame(),
            }),
          ],
          {
            spacing: 20,
          }
        ),
      ],
      {
        margin: Tidy.margin(16, 16, 16, 16),
      }
    ),
  ]);

  constructor() {
    super();

    // Create the menu panel in the center of the screen.
    // The contents will automatically stretch to fit width, but we need to
    // determine height manually in this case.
    const w = 300;
    const h = 40 + (64 + 20) * 4 + 32;
    const x = (CANVAS_W - w) / 2;
    const y = (CANVAS_H - h) / 2;
    this._layout.reshape(x, y, w, h);

    this._level = Level.load();
    this._continueButton.widget.isEnabled = this._level !== undefined;
  }

  update(dt: number): void {
    for (let widget of this._layout.widgets()) {
      widget.update(dt);
    }
  }

  draw(renderer: Renderer): void {
    for (let widget of this._layout.widgets()) {
      widget.draw(renderer);
    }
  }
}

function startGame() {
  AudioHelper.playSound("click5");
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new GameScene(0));
}

function continueGame(level: Level) {
  AudioHelper.playSound("click5");
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new GameScene(level));
}
