import { Level } from "../core/level";
import { ServiceLocator, AssetLoader, XmlParser, XmlNode } from "../lib/ignite";

export const LevelsLoader = {
  loadLevel(index: number): Level {
    const levelsXml = localStorage.getItem("levels.xml");
    if (levelsXml !== null) {
      let xmlNode = XmlParser.parse(levelsXml);
      return Level.parse(xmlNode, index);
    }

    const assetLoader = ServiceLocator.resolve(AssetLoader);
    const xmlNode = assetLoader.getXml("levels");
    return Level.parse(xmlNode, index);
  },
};
