import { comments } from "./constants.js";
import { escapeHtml } from "./escapeHtml.js";

export function renderComments() {
  const commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";

  comments.forEach((comment) => {
    const commentElement = document.createElement("li");
    commentElement.classList.add("comment");

    const safeName = escapeHtml(comment.name);
    const safeText = escapeHtml(comment.text);

    const likeClass = comment.isLiked
      ? "like-button -active-like"
      : "like-button";

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
          <button class="${likeClass}" data-id="${comment.id}"></button>
        </div>
      </div>
    `;

    commentsList.appendChild(commentElement);
  });
}
