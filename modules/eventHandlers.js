import { comments, setComments, setReplyingTo } from "./constants.js";
import { renderComments } from "./render.js";
import { escapeHtml } from "./escapeHtml.js";
import { formatDate } from "./formatDate.js";

function handleLikeClick(event) {
  event.stopPropagation();

  const commentId = parseInt(event.target.getAttribute("data-id"));
  const comment = comments.find((c) => c.id === commentId);

  if (comment) {
    if (comment.isLiked) {
      comment.likes--;
      comment.isLiked = false;
    } else {
      comment.likes++;
      comment.isLiked = true;
    }

    renderComments();
    initEventHandlers();
  }
}

function handleCommentClick(event) {
  if (!event.target.closest(".like-button")) {
    const commentId = parseInt(
      event.currentTarget.querySelector(".like-button").getAttribute("data-id")
    );
    const commentToQuote = comments.find((c) => c.id === commentId);

    if (commentToQuote) {
      document.getElementById("nameInput");
      document.getElementById("textInput").value =
        `<${escapeHtml(commentToQuote.name)}, ${escapeHtml(commentToQuote.text)}>\n\n`;
      document.getElementById("textInput").focus();

      setReplyingTo(commentId);
    }
  }
}

export function addComment(name, text) {
  const safeName = escapeHtml(name);
  const safeText = escapeHtml(text);

  const newComment = {
    id: Date.now(),
    name: safeName,
    date: formatDate(new Date()),
    text: safeText,
    likes: 0,
    isLiked: false,
  };

  const updatedComments = [...comments, newComment];
  setComments(updatedComments);
  renderComments();
  initEventHandlers();

  setReplyingTo(null);
}

export function initEventHandlers() {
  const likeButtons = document.querySelectorAll(".like-button");
  const commentElements = document.querySelectorAll(".comment");
  const addButton = document.getElementById("addButton");
  const nameInput = document.getElementById("nameInput");
  const textInput = document.getElementById("textInput");

  likeButtons.forEach((button) => {
    button.addEventListener("click", handleLikeClick);
  });

  commentElements.forEach((comment) => {
    comment.addEventListener("click", handleCommentClick);
  });

  textInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      addButton.click();
    }
  });
}
