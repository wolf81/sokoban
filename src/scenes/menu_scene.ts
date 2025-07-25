import { CANVAS_H, CANVAS_W } from "../constants";
import { Level } from "../core/level";
import { Control, UI } from "../core/ui";
import { AudioHelper } from "../helpers/audio_helper";
import {
  ServiceLocator,
  SceneManager,
  Scene,
  Layout,
  Tidy,
  Renderer,
  AssetLoader,
  Timer,
} from "../lib/ignite";
import { GameScene } from "./game_scene";

type Instruction = {
  imageName: string;
  description: string;
};

export class MenuScene extends Scene {
  private _level: Level | undefined;

  private _guideView = UI.imageView(undefined, {
    size: { w: 320, h: 256 },
    stretch: "horizontal",
  });
  private _guideLabel = UI.label("", { textColor: "#b48000" });

  private _guide: Instruction[] = [
    { imageName: "walk-push_1", description: "Push a box to move it" },
    { imageName: "walk-push_2", description: "Push a box to move it" },
    { imageName: "walk-push_3", description: "Push a box to move it" },
    { imageName: "walk-push_3", description: "Push a box to move it" },
    { imageName: "push-goal_1", description: "Move boxes on goals" },
    { imageName: "push-goal_2", description: "Move boxes on goals" },
    { imageName: "push-goal_3", description: "Move boxes on goals" },
    { imageName: "push-goal_3", description: "Move boxes on goals" },
    {
      imageName: "finish_1",
      description: "Finish by moving each box on a goal",
    },
    {
      imageName: "finish_2",
      description: "Finish by moving each box on a goal",
    },
    {
      imageName: "finish_3",
      description: "Finish by moving each box on a goal",
    },
    { imageName: "finish_3", description: "" },
  ];
  private _guideStep: number = this._guide.length - 1;

  private _continueButton = UI.button("Continue", {
    size: 32,
    textColor: "b48000",
    onClick: () => continueGame(this._level!),
  });

  private _layout: Layout<Control> = Tidy.border(
    [
      Tidy.hstack(
        [
          Tidy.border([
            UI.panel(),
            Tidy.border(
              Tidy.vstack<Control>(
                [
                  UI.label("Pusherman", { textColor: "#b48000" }),
                  this._continueButton,
                  UI.button("New Game", {
                    size: 32,
                    textColor: "b48000",
                    onClick: () => newGame(),
                  }),
                ],
                { spacing: 20 }
              ),
              {
                margin: Tidy.margin(16, 16, 16, 16),
              }
            ),
          ]),
          Tidy.border([
            UI.panel(),
            Tidy.border(
              Tidy.vstack<Control>(
                [
                  UI.label("Instructions", { textColor: "#b48000" }),
                  this._guideView,
                  this._guideLabel,
                ],
                { spacing: 20 }
              ),
              {
                margin: Tidy.margin(16, 16, 16, 16),
              }
            ),
          ]),
        ],
        {
          stretch: "all",
          spacing: 64,
        }
      ),
    ],
    { margin: Tidy.margin(64, 64, 64, 64) }
  );

  constructor() {
    super();

    this._layout.reshape(0, 0, CANVAS_W, CANVAS_H);

    this._level = Level.load();
    this._continueButton.widget.isEnabled = this._level !== undefined;
  }

  override async init(): Promise<void> {
    this.startGuide();
  }

  override deinit(): void {
    this.stopGuide();
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

  startGuide() {
    const nextStep = () => {
      this._guideStep = (this._guideStep + 1) % this._guide.length;
      const assetLoader = ServiceLocator.resolve(AssetLoader);
      const step = this._guide[this._guideStep];

      this._guideView.widget.image = assetLoader.getImage(step.imageName);
      this._guideLabel.widget.text = step.description;

      Timer.after(1.0, () => nextStep());
    };

    nextStep();
  }

  stopGuide() {
    Timer.removeAllTimers();
  }
}

function newGame() {
  AudioHelper.playSound("click5");
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new GameScene(0));
}

function continueGame(level: Level) {
  AudioHelper.playSound("click5");
  const sceneManager = ServiceLocator.resolve(SceneManager);
  sceneManager.switch(new GameScene(level));
}
