import { comments } from "./constants.js";
import { escapeHtml } from "./escapeHtml.js";
import { getToken } from "./auth.js";

export function renderComments() {
  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";

  if (comments.length === 0) {
    commentsList.innerHTML = `
      <li style="color: white; text-align: center; padding: 20px;">
        Пока нет комментариев. Будьте первым!
      </li>
    `;
    return;
  }

  const isLoggedIn = getToken();

  comments.forEach((comment) => {
    const commentElement = document.createElement("li");
    commentElement.classList.add("comment");

    const safeName = escapeHtml(comment.name);
    const safeText = escapeHtml(comment.text);

    const likeClass = comment.isLiked
      ? "like-button -active-like"
      : "like-button";

    const likeTitle = isLoggedIn 
      ? "Поставить лайк" 
      : "Для оценки комментария требуется авторизация";

    commentElement.innerHTML = `
      <div class="comment-header">
        <div>${safeName}</div>
        <div>${comment.date}</div>
      </div>
      <div class="comment-body">
        <div class="comment-text">${safeText}</div>
      </div>
      <div class="comment-footer">
        <div class="likes">
          <span class="likes-counter">${comment.likes}</span>
          <button class="${likeClass}" data-id="${comment.id}" title="${likeTitle}"></button>
        </div>
      </div>
    `;

    commentsList.appendChild(commentElement);
  });
}