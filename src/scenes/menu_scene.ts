import { CANVAS_H, CANVAS_W } from "../constants";
import { Level } from "../core/level";
import { AudioHelper } from "../helpers/audio_helper";
import {
  ServiceLocator,
  SceneManager,
  Scene,
  Layout,
  Renderer,
  AssetLoader,
  Timer,
  UI,
  Style,
} from "../lib/ignite";
import { GameScene } from "./game_scene";

type Instruction = {
  imageName: string;
  description: string;
};

export class MenuScene extends Scene {
  private _level: Level | undefined;

  private readonly _layout: Layout;

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

  /*
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
  */

  constructor() {
    super();

    UI.setStyle(uiStyle);

    this._layout = UI.layout();

    this._level = Level.load();

    const label = UI.label("Pusherman");

    const newGameButton = UI.button("New Game", {
      options: {
        click: () => newGame(),
      },
    });

    const continueButton = UI.button("Continue", {
      options: {
        enabled: () => this._level != null,
        click: () => continueGame(this._level!),
      },
    });

    const importButton = UI.button("Import Levels", {
      options: {
        click: async () => await this.importLevels().then(this.updateUI),
      },
    });

    const levels = localStorage.getItem("levels.xml");
    const resetButton = UI.button("Reset Levels", {
      options: {
        enabled: () => levels != null,
        click: async () => await this.resetLevels().then(this.updateUI),
      },
    });

    const panel1 = UI.panel([
      label,
      continueButton,
      newGameButton,
      importButton,
      resetButton,
    ]);
    this._layout.addChild(
      panel1,
      { x: 64, y: 64 },
      { anchor: "top-left", size: { w: 320, h: "wrap" } }
    );

    const guideView = UI.imageView(undefined, {
      // size: { w: 320, h: 256 },
      // stretch: "horizontal",
    });
    const guideLabel = UI.label("");
    // private _guideLabel = UI.label("", { textColor: "#b48000", lines: 2 });

    const panel2 = UI.panel([guideView, guideLabel]);
    this._layout.addChild(
      panel2,
      { x: CANVAS_W - 64, y: CANVAS_H - 64 },
      { anchor: "bottom-right", size: { w: "wrap", h: "wrap" } }
    );

    this._layout.resize(CANVAS_W, CANVAS_H);
  }

  override async init(): Promise<void> {
    this.startGuide();
  }

  override deinit(): void {
    this.stopGuide();
  }

  update(dt: number): void {
    this._layout.update(dt);
  }

  draw(renderer: Renderer): void {
    this._layout.draw(renderer);
  }

  startGuide() {
    const nextStep = () => {
      this._guideStep = (this._guideStep + 1) % this._guide.length;
      const assetLoader = ServiceLocator.resolve(AssetLoader);
      const step = this._guide[this._guideStep];

      // this._guideView.widget.image = assetLoader.getImage(step.imageName);
      // this._guideLabel.widget.text = step.description;

      Timer.after(1.0, () => nextStep());
    };

    nextStep();
  }

  stopGuide() {
    Timer.removeAllTimers();
  }

  updateUI() {
    Level.reset();

    // this._continueButton.widget.isEnabled = false;
    // const levels = localStorage.getItem("levels.xml");
    // this._resetLevelsButton.widget.isEnabled = levels != null;
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
