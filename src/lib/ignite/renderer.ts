import { Sprite } from "../../spritesheet";

type Drawable = HTMLCanvasElement | HTMLImageElement;

export type TextAlign = "left" | "right" | "center";

/**
 * Use the Renderer class to draw graphics and text on the canvas.
 */
export class Renderer {
  private _ctx: CanvasRenderingContext2D;
  private _draws: number = 0;

  /**
   * The number of draw calls since startFrame() was called.
   */
  get drawCount() {
    return this._draws;
  }

  constructor(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
  }

  /**
   * Call startFrame() when a new frame is being rendered. Internally this
   * method will reset the draws count and clear the render context.
   */
  startFrame() {
    this._draws = 0;
    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);
  }

  /**
   * Draw a rectangle in a color.
   * @param x The x position, in pixels.
   * @param y The y position, in pixels.
   * @param w The width, in pixels.
   * @param h The height, in pixels.
   * @param color The color.
   */
  drawRect(x: number, y: number, w: number, h: number, color: string) {
    this._draws += 1;
    this._ctx.fillStyle = color;
    this._ctx.fillRect(x, y, w, h);
  }

  /**
   * Draw an image on the render context.
   * @param image The image to draw.
   * @param x The x position, in pixels.
   * @param y The y position, in pixels.
   */
  drawImage(image: Drawable, x: number, y: number) {
    this._draws += 1;
    this._ctx.drawImage(image, x, y);
  }

  // // TODO: Just return width / height?
  // measureText(text: string, font: string): TextMetrics {
  //   // TODO: Maybe cache a number of texts/fonts.
  //   this._ctx.font = font;
  //   return this._ctx.measureText(text);
  // }

  /**
   * Draw text on the render context.
   * @param text The text to draw.
   * @param x The x position, in pixels.
   * @param y The y position, in pixels.
   * @param options Text draw options, such as text alignment, font and color.
   */
  drawText(
    text: string,
    x: number,
    y: number,
    options: Partial<{
      font: string;
      color: string;
      align: TextAlign;
    }> = {}
  ) {
    this._draws += 1;

    if (options.font) {
      this._ctx.font = options.font;
    }

    const metrics = this._ctx.measureText(text);
    const h =
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    switch (options.align) {
      case "center":
        x -= metrics.width / 2;
        break;
      case "right":
        x -= metrics.width;
        break;
    }

    this._draws += 1;
    this._ctx.fillStyle = options.color ?? "#ffffff";
    this._ctx.fillText(text, x, y + h / 2);
  }

  drawSprite(image: HTMLImageElement, sprite: Sprite, x: number, y: number) {
    this._ctx.drawImage(
      image,
      sprite.x,
      sprite.y,
      sprite.w,
      sprite.h,
      x,
      y,
      sprite.w,
      sprite.h
    );
  }
}
