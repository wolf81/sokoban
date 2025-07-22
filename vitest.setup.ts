import { DOMParser } from "@xmldom/xmldom";

// @ts-ignore
global.DOMParser = DOMParser;

// Manually define global Node constants (browser values)
global.Node = {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
  // Add more if needed: COMMENT_NODE: 8, etc.
} as unknown as typeof Node;
