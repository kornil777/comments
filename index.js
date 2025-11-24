import { renderComments } from "./modules/render.js";
import { initEventHandlers } from "./modules/eventHandlers.js";

document.addEventListener("DOMContentLoaded", function () {
  renderComments();

  initEventHandlers();
});
