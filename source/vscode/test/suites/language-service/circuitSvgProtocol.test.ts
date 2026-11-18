// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { assert } from "chai";
import { getCircuitSvgSaveMessageError } from "../../../src/circuitSvgProtocol.js";

// The shape the exporter writes: glyph outlines in defs, reused by each label.
function saveMessage(rootAttributes = "", labelAttributes = "") {
  return {
    type: "qdk.circuit/save-svg",
    suggestedName: "circuit.svg",
    contents:
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${rootAttributes}>` +
      '<title>Quantum circuit</title><defs><path id="qdk-glyph-main-48" d="M0 0L1 1Z"/></defs>' +
      `<g class="gate"${labelAttributes}><use xlink:href="#qdk-glyph-main-48" transform="matrix(0.01 0 0 0.01 1 2)"/></g>` +
      "</svg>\n",
  };
}

suite("Circuit SVG save validation", () => {
  test("accepts glyph references to the exported document", () => {
    assert.isUndefined(getCircuitSvgSaveMessageError(saveMessage()));
  });

  test("rejects xml:base, which would resolve glyph references elsewhere", () => {
    const base = ' xml:base="https://example.invalid/remote.svg"';
    for (const message of [saveMessage(base), saveMessage("", base)]) {
      assert.strictEqual(
        getCircuitSvgSaveMessageError(message),
        "The generated file is not a safe standalone SVG.",
      );
    }
  });
});
