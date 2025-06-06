"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// functions/createNote.ts
var createNote_exports = {};
__export(createNote_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(createNote_exports);
var handler = async (event) => {
  const { title, content } = JSON.parse(event.body || "{}");
  const note = {
    id: Date.now().toString(),
    title,
    content,
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Note created!",
      note
    })
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
