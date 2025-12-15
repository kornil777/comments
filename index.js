import { renderComments } from "./modules/render.js";
import { initEventHandlers } from "./modules/eventHandlers.js";
import { setComments } from "./modules/constants.js";
import { fetchComments } from "./api.js";

document.querySelector(".comments").innerHTML =
  "Пожалуйста подождите, загружаю комментарии...";

fetchComments().then((data) => {
  setComments(data);
  renderComments();
  initEventHandlers();
}).catch((error) => {
  console.error("Ошибка загрузки комментариев:", error);
  document.querySelector(".comments").innerHTML = 
    "Ошибка загрузки комментариев. Пожалуйста, попробуйте позже.";
});