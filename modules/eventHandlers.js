import { comments, setComments } from "./constants.js";
import { renderComments } from "./render.js";
import { escapeHtml } from "./escapeHtml.js";
import { postComment } from "../api.js";

// Функция для обработки лайков
function handleLikeClick(event) {
  event.stopPropagation();
  
  const commentId = parseInt(event.target.getAttribute("data-id"));
  const commentIndex = comments.findIndex((c) => c.id === commentId);
  
  if (commentIndex !== -1) {
    const updatedComments = [...comments];
    const comment = updatedComments[commentIndex];
    
    if (comment.isLiked) {
      comment.likes--;
      comment.isLiked = false;
    } else {
      comment.likes++;
      comment.isLiked = true;
    }
    
    setComments(updatedComments);
    renderComments();
    initEventHandlers();
  }
}

// Функция для обработки цитирования
function handleCommentClick(event) {
  // Проверяем, что клик был не по лайку
  if (!event.target.closest(".like-button")) {
    const commentId = parseInt(
      event.currentTarget.querySelector(".like-button").getAttribute("data-id")
    );
    const commentToQuote = comments.find((c) => c.id === commentId);
    
    if (commentToQuote) {
      document.getElementById("nameInput");
      document.getElementById("textInput").value =
        `<${escapeHtml(commentToQuote.name)},
         ${escapeHtml(commentToQuote.text)}>\n\n`;
      document.getElementById("textInput").focus();
    
    }
  }
}

export function addComment() {
  const nameInput = document.getElementById("nameInput");
  const textInput = document.getElementById("textInput");
  
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

  postComment({ name, text })
    .then((data) => {
   
      document.querySelector(".form-loading").style.display = "none";
      document.querySelector(".add-form").style.display = "flex";
      
      setComments(data);
      renderComments();
      initEventHandlers();
      
    
      nameInput.value = "";
      textInput.value = "";
    })
    .catch((error) => {
      document.querySelector(".form-loading").style.display = "none";
      document.querySelector(".add-form").style.display = "flex";

      if (error.message === "Failed to fetch" || error.message.includes("NetworkError")) {
        alert("Кажется, у вас сломался интернет, попробуйте позже");
      } else if (error.message === "Ошибка сервера") {
        alert("Сервер сломался, попробуй позже");
      } else if (error.message === "Неверный запрос") {
        alert("Имя и комментарий должны быть не менее 3-х символов");
      } else {
        alert(error.message || "Произошла ошибка");
      }
    });
}


export function initEventHandlers() {
  const likeButtons = document.querySelectorAll(".like-button");
  const commentElements = document.querySelectorAll(".comment");
  const addButton = document.getElementById("addButton");

  
  likeButtons.forEach((button) => {
    
    button.replaceWith(button.cloneNode(true));
  });

  
  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", handleLikeClick);
  });

  
  commentElements.forEach((comment) => {
    comment.addEventListener("click", handleCommentClick);
  });

  if (addButton) {
    addButton.addEventListener("click", addComment);
  }

  
  const textInput = document.getElementById("textInput");
  if (textInput) {
    textInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        addComment();
      }
    });
  }
}