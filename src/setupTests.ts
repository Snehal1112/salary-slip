import "@testing-library/jest-dom";
import {
  TextEncoder as NodeTextEncoder,
  TextDecoder as NodeTextDecoder,
} from "util";

// Polyfill TextEncoder/TextDecoder for Jest (jsdom/node environments)
// Some libraries rely on these globals. Use typed globalThis casts to avoid `any`.
type MaybeGlobal = {
  TextEncoder?: typeof NodeTextEncoder;
  TextDecoder?: typeof NodeTextDecoder;
};
const g = globalThis as unknown as MaybeGlobal;
if (typeof g.TextEncoder === "undefined") {
  g.TextEncoder = NodeTextEncoder;
  g.TextDecoder = NodeTextDecoder;
}
