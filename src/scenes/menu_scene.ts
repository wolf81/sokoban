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
  private _guideLabel = UI.label("", { textColor: "#b48000", lines: 2 });

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
      description: "Win by moving each box on a goal",
    },
    {
      imageName: "finish_2",
      description: "Win by moving each box on a goal",
    },
    {
      imageName: "finish_3",
      description: "Win by moving each box on a goal",
    },
    { imageName: "finish_3", description: "Win by moving each box on a goal" },
  ];
  private _guideStep: number = this._guide.length - 1;

  private _resetLevelsButton = UI.button("Reset Levels", {
    fontSize: 32,
    textColor: "#b48000",
    onClick: async () => await this.resetLevels().then(() => this.updateUI()),
  });

  private _importLevelsButton = UI.button("Import Levels", {
    fontSize: 32,
    textColor: "#b48000",
    onClick: async () => await this.importLevels().then(() => this.updateUI()),
  });

  private _continueButton = UI.button("Continue", {
    fontSize: 32,
    textColor: "b48000",
    onClick: () => continueGame(this._level!),
  });

  private _layout: Layout<Control> = Tidy.border(
    [
      Tidy.hstack([
        Tidy.vstack(
          [
            newPanel([
              UI.label("Pusherman", {
                textColor: "#b48000",
                fontSize: 36,
                width: 320,
              }),
              this._continueButton,
              UI.button("New Game", {
                fontSize: 32,
                textColor: "#b48000",
                onClick: () => newGame(),
              }),
              this._importLevelsButton,
              this._resetLevelsButton,
            ]),
          ],
          {
            spacing: 64,
          }
        ),
        UI.flexSpace("horizontal"),
        Tidy.vstack([
          UI.flexSpace("vertical"),
          newPanel([
            UI.label("Instructions", { fontSize: 32, textColor: "#b48000" }),
            this._guideView,
            this._guideLabel,
          ]),
        ]),
      ]),
    ],
    { margin: Tidy.margin(64, 64, 64, 64) }
  );

  constructor() {
    super();

    this._layout.reshape(0, 0, CANVAS_W, CANVAS_H);

    this._level = Level.load();
    this._continueButton.widget.isEnabled = this._level != null;

    let levels = localStorage.getItem("levels.xml");
    this._resetLevelsButton.widget.isEnabled = levels != null;
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

  updateUI() {
    Level.reset();
    this._continueButton.widget.isEnabled = false;

    const levels = localStorage.getItem("levels.xml");
    this._resetLevelsButton.widget.isEnabled = levels != null;
  }

  resetLevels(): Promise<void> {
    return new Promise((resolve, _) => {
      localStorage.removeItem("levels.xml");
      resolve();
    });
  }

  importLevels(): Promise<void> {
    Level.reset();

    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".slc";
      input.style.display = "none";

      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          reject(new Error("No file selected"));
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          var xmlString = reader.result as string;
          localStorage.setItem("levels.xml", xmlString);
          resolve();
          document.body.removeChild(input);
        };
        reader.onerror = () => {
          reject(reader.error);
          document.body.removeChild(input);
        };

        reader.readAsText(file);
      };

      document.body.appendChild(input);
      input.click();
    });
  }
}

function newPanel(
  children: Layout<Control>[] | Layout<Control>
): Layout<Control> {
  return Tidy.border(
    [
      UI.panel(),
      Tidy.border(
        Tidy.vstack<Control>(children, {
          spacing: 16,
        }),
        { margin: Tidy.margin(32, 32, 32, 32) }
      ),
    ],
    { stretch: "none" }
  );
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
