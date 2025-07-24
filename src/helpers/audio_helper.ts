import { AssetLoader, ServiceLocator } from "../lib/ignite";

export const AudioHelper = {
  playAudio(name: string) {
    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const audio = assetLoader.getAudio(name);
    audio.currentTime = 0; // Rewind if playing.
    audio.play();
  },

  playRandomFootstep() {
    const idx = Math.floor(Math.random() * 4);
    this.playAudio("footstep_concrete_00" + idx);
  },
};
