import { renderComments } from "./modules/render.js";
import { initEventHandlers } from "./modules/eventHandlers.js";
import { addComment } from "./modules/eventHandlers.js";

renderComments();

// fetch("https://wedev-api.sky.pro/api/v1/:personal-key/comments")
// .then((response) => {
//   return response.json()
// })
// .then((data) => {
//   console.log(data)
// })

initEventHandlers();
addButton.addEventListener("click", function () {
  const name = nameInput.value.trim();
  const text = textInput.value.trim();

  if (!name) {
    alert("Пожалуйста, введите ваше имя");
    nameInput.focus();
    return;
  }

  if (!text) {
    alert("Пожалуйста, введите текст комментария");
    textInput.focus();
    return;
  }

  addComment(name, text);

  nameInput.value = "";
  textInput.value = "";
});
