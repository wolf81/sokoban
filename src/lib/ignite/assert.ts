export class Assert {
  static true(condition: boolean, message: string) {
    if (condition) return;

    throw new Error(message);
  }

  static defined(obj: any, message: string) {
    if (obj) return;

    throw new Error(message);
  }

  static false(condition: boolean, message: string) {
    if (!condition) return;

    throw new Error(message);
  }
}
