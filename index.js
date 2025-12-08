import { renderComments } from "./modules/render.js";
import { initEventHandlers, addComment } from "./modules/eventHandlers.js";
import { setComments } from "./modules/constants.js";
import { fetchComments, postComment } from "./api.js";

document.querySelector(".comments").innerHTML =
  "Пожалуйста подождите, загружаю комментарии...";
fetchComments().then((data) => {
  setComments(data);
  renderComments();
});

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
  document.querySelector(".form-loading").style.display = "block";
  document.querySelector(".add-form").style.display = "none";

  // addComment(name, text);
  postComment(text, name)
    .then((data) => {
      document.querySelector(".form-loading").style.display = "none";
      document.querySelector(".add-form").style.display = "flex";
      setComments(data);
      renderComments();
      nameInput.value = "";
      textInput.value = "";
    })
    .catch((error) => {
      document.querySelector(".form-loading").style.display = "none";
      document.querySelector(".add-form").style.display = "flex";

      if (error.message === "Failed to fetch") {
        alert("Нет соединения, попробуйте позже");
      }
      if (error.message === "Ошибка сервера") {
        alert("Ошибка сервера");
      }
      if (error.message === "Неверный запрос") {
        alert("Имя и комментарий должны быть не менее 3-х символов");
      }
    });
  // nameInput.value = "";
  // textInput.value = "";
});
