import { renderComments } from "./modules/render.js";
import { initEventHandlers, initAuthHandlers } from "./modules/eventHandlers.js";
import { setComments } from "./modules/constants.js";
import { fetchComments } from "./api.js";

document.querySelector(".comments").innerHTML =
  "Пожалуйста подождите, загружаю комментарии...";

// Загружаем комментарии и инициализируем
fetchComments()
  .then((data) => {
    setComments(data);
    renderComments();
    initEventHandlers();
    initAuthHandlers();
  })
  .catch((error) => {
    console.error("Ошибка загрузки комментариев:", error);
    document.querySelector(".comments").innerHTML = 
      "<li style='color: white; text-align: center; padding: 20px;'>Ошибка загрузки комментариев. Пожалуйста, попробуйте позже.</li>";
  });