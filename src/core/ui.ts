import { TextureHelper } from "../helpers/texture_helper";
import {
  Vector,
  ServiceLocator,
  AssetLoader,
  Layoutable,
  Rect,
  Shape,
  Renderer,
  Elem,
  Tidy,
} from "../lib/ignite";

type FontFamily = "Jumpman";
type Drawable = HTMLCanvasElement | HTMLImageElement;
type Mouse = {
  pos: Vector;
  buttonState: "none" | "down" | "up";
};

type LabelOptions = {
  font: FontFamily;
  size: number;
  textColor: string;
  background: string;
};

type ButtonOptions = LabelOptions & {
  onClick: () => void;
  normalImage: string;
  hoverImage: string;
  activeImage: string;
};

// TODO: add aspect / scale support
type ImageViewOptions = {
  size: { w: number; h: number };
  stretch: "horizontal" | "vertical" | "all" | "none";
};

export enum ControlState {
  // Default state when no interactions happen inside the control.
  Normal,
  // Hover & highlight state, e.g. when mouse is hovering over the control.
  Hover,
  // Active & selected state, e.g. when mouse is pressed inside the control.
  Active,
  // Disabled state, no interaction possible.
  Disabled,
}

export abstract class Control implements Layoutable {
  private _state: ControlState = ControlState.Normal;

  protected _isEnabled = true;

  set isEnabled(value: boolean) {
    this._isEnabled = value;
    this.setState(
      this._isEnabled ? ControlState.Normal : ControlState.Disabled
    );
  }

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  protected _frame: Rect = Shape.rect(0, 0, 0, 0);

  get state(): ControlState {
    return this._state;
  }

  setState(state: ControlState) {
    this._state = state;
  }

  get frame(): Rect {
    return this._frame;
  }

  setFrame(rect: { x: number; y: number; w: number; h: number }): void {
    this._frame = Shape.rect(rect.x, rect.y, rect.w, rect.h);
  }

  update(dt: number): void {}

  abstract draw(renderer: Renderer): void;
}

export class ImageView extends Control {
  private _image?: Drawable;
  private _ox: number = 0;
  private _oy: number = 0;

  constructor(image?: Drawable, options?: Partial<ImageViewOptions>) {
    super();

    this._image = image;
  }

  set image(image: Drawable) {
    this._image = image;

    this._ox = Math.floor((this.frame.w - this._image.width) / 2);
    this._oy = Math.floor((this.frame.h - this._image.height) / 2);
  }

  draw(renderer: Renderer): void {
    if (!this._image) {
      return;
    }

    renderer.drawImage(
      this._image,
      this.frame.x + this._ox,
      this.frame.y + this._oy
    );
  }
}

export class Label extends Control {
  private _ox: number = 0;
  private _oy: number = 0;
  private _font: string;
  private _text: string;
  private _textColor: string;
  private _fontSize: number;
  private _backgroundName?: string;
  protected _background?: Drawable;

  set text(text: string) {
    this._text = text;
  }

  get text(): string {
    return this._text;
  }

  constructor(text: string, options?: Partial<LabelOptions>) {
    super();

    this._text = text;

    this._textColor = options?.textColor ?? "#eeeeee";
    const fontName = options?.font ?? "PoetsenOne";
    this._fontSize = options?.size ?? 24;
    this._font = `${this._fontSize}px ${fontName}`;
    this._backgroundName = options?.background;
  }

  override setFrame(rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  }): void {
    super.setFrame(rect);

    this._ox = rect.x + Math.floor(rect.w / 2);
    this._oy = rect.y + Math.floor(rect.h / 2);

    if (this._backgroundName) {
      let image: Drawable = loadImage(this._backgroundName);
      this._background = TextureHelper.stretch(image, rect.w, rect.h);
    }
  }

  draw(renderer: Renderer): void {
    if (this._background) {
      renderer.drawImage(this._background, this.frame.x, this.frame.y);
    }

    const textColor =
      this.state === ControlState.Disabled
        ? hexColorWithAlpha(this._textColor, 0.5)
        : this._textColor;

    renderer.drawText(this._text, this._ox, this._oy, {
      font: this._font,
      align: "center",
      color: textColor,
    });
  }
}

export class Panel extends Control {
  private _background!: HTMLCanvasElement;
  private _imageName: string;

  constructor(imageName: string) {
    super();
    this._imageName = imageName;
  }

  draw(renderer: Renderer): void {
    renderer.drawImage(this._background, this._frame.x, this._frame.y);
  }

  setFrame(rect: { x: number; y: number; w: number; h: number }): void {
    super.setFrame(rect);

    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const image = assetLoader.getImage(this._imageName);
    this._background = TextureHelper.stretch(image, rect.w, rect.h);
  }
}

export class Button extends Label {
  private _onClick: () => void;

  private _stateBackgrounds: Map<ControlState, Drawable> = new Map<
    ControlState,
    Drawable
  >();

  constructor(title: string, options?: Partial<ButtonOptions>) {
    super(title, options);

    this._onClick = options?.onClick ? options.onClick : () => {};
  }

  override setFrame(rect: {
    x: number;
    y: number;
    w: number;
    h: number;
  }): void {
    super.setFrame(rect);

    const assetLoader = ServiceLocator.resolve(AssetLoader);

    const stateImageInfo: Map<ControlState, string> = new Map<
      ControlState,
      string
    >([
      [ControlState.Normal, "button_square_depth_flat"],
      [ControlState.Hover, "button_square_depth_gloss"],
      [ControlState.Active, "button_square_gloss"],
      [ControlState.Disabled, "button_square_depth_flat"],
    ]);

    for (let [state, imageName] of stateImageInfo) {
      const alpha = state === ControlState.Disabled ? 0.5 : 1.0;
      let image: Drawable = assetLoader.getImage(imageName);
      image = TextureHelper.stretch(image, rect.w, rect.h, 10, alpha);
      this._stateBackgrounds.set(state, image);
    }

    this._background = this._stateBackgrounds.get(ControlState.Normal)!;
  }

  override setState(state: ControlState): void {
    super.setState(state);

    this._background = this._stateBackgrounds.get(this.state)!;
  }

  update(dt: number): void {
    if (!this._isEnabled) return;

    const isHit = Shape.containsPoint(this._frame, UI.mouse.pos);
    const isPress = isHit && UI.mouse.buttonState === "down";
    const isRelease =
      this.state === ControlState.Active && UI.mouse.buttonState === "up";

    if (!isHit) {
      this.setState(ControlState.Normal);
    } else {
      this.setState(ControlState.Hover);
    }

    if (isPress && !isRelease) {
      const state =
        UI.mouse.buttonState === "down"
          ? ControlState.Active
          : ControlState.Hover;
      this.setState(state);
    }

    if (isRelease) {
      this._onClick();
      this.setState(ControlState.Normal);
    }
  }
}

class Space extends Control {
  draw(_: Renderer): void {}
}

export class UI {
  static panel(imageName: string = "button_square_border"): Elem<Panel> {
    return Tidy.elem(new Panel(imageName), {
      minSize: { w: 0, h: 0 },
      stretch: "all",
    });
  }

  static label(text: string, options?: Partial<LabelOptions>): Elem<Label> {
    return Tidy.elem(new Label(text, options), {
      minSize: { w: 0, h: options?.size ?? 48 },
      stretch: "horizontal",
    });
  }

  static button(title: string, options?: Partial<ButtonOptions>): Elem<Button> {
    return Tidy.elem(new Button(title, options), {
      minSize: { w: 192, h: 64 },
      stretch: "horizontal",
    });
  }

  // TODO: Fix ugly API, maybe support overloads?
  static imageView(
    image?: Drawable,
    options?: Partial<ImageViewOptions>
  ): Elem<ImageView> {
    const size = options?.size ?? { w: 0, h: 0 };
    const stretch = options?.stretch ?? "all";

    return Tidy.elem(new ImageView(image, options), {
      minSize: size,
      stretch: stretch,
    });
  }

  static flexSpace(stretch: "horizontal" | "vertical"): Elem<Space> {
    return Tidy.elem(new Space(), { stretch: stretch });
  }

  private static _mouse: Mouse = {
    pos: { x: 0, y: 0 },
    buttonState: "none",
  };

  static get mouse(): Mouse {
    return this._mouse;
  }

  static init(canvas: HTMLCanvasElement) {
    window.addEventListener("mousedown", (e) => {
      this._mouse.buttonState = "down";
    });

    window.addEventListener("mouseup", (e) => {
      this._mouse.buttonState = "up";
    });

    window.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this._mouse.pos.x = e.clientX - rect.left;
      this._mouse.pos.y = e.clientY - rect.top;
    });
  }

  static update() {
    if (this._mouse.buttonState === "up") {
      this._mouse.buttonState = "none";
    }
  }
}

function loadImage(name: string): Drawable {
  const assetLoader = ServiceLocator.resolve(AssetLoader);
  return assetLoader.getImage(name);
}

function hexColorWithAlpha(hex: string, alpha: number): string {
  const alphaToHex = (alpha: number) => {
    const clamped = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
    return clamped.toString(16).padStart(2, "0");
  };

  const baseColor = hex.replace(/^#/, "");
  return `#${baseColor}${alphaToHex(alpha)}`;
}
