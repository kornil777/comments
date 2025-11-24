import { comments, setComments, setReplyingTo } from './constants.js';
import { renderComments } from './render.js';
import { escapeHtml } from './escapeHtml.js';
import { formatDate } from './formatDate.js';

// Функция для обработки лайков
function handleLikeClick(event) {
  event.stopPropagation();
  
  const commentId = parseInt(event.target.getAttribute('data-id'));
  const comment = comments.find(c => c.id === commentId);
  
  if (comment) {
    // Изменяем состояние в массиве данных
    if (comment.isLiked) {
      comment.likes--;
      comment.isLiked = false;
    } else {
      comment.likes++;
      comment.isLiked = true;
    }
    
    // Перерисовываем комментарии
    renderComments();
    initEventHandlers();
  }
}

// Функция для обработки цитирования
function handleCommentClick(event) {
  // Проверяем, что клик был не по лайку
  if (!event.target.closest('.like-button')) {
    const commentId = parseInt(event.currentTarget.querySelector('.like-button').getAttribute('data-id'));
    const commentToQuote = comments.find(c => c.id === commentId);
    
    if (commentToQuote) {
      // Заполняем форму для ответа
      document.getElementById('nameInput');
      document.getElementById('textInput').value = `<${escapeHtml(commentToQuote.name)}, ${escapeHtml(commentToQuote.text)}>\n\n`;
      document.getElementById('textInput').focus();
      
      // Сохраняем ID комментария, на который отвечаем
      setReplyingTo(commentId);
    }
  }
}

// Функция для добавления нового комментария
export function addComment(name, text) {
  // Экранируем введенные данные
  const safeName = escapeHtml(name);
  const safeText = escapeHtml(text);
  
  const newComment = {
    id: Date.now(),
    name: safeName,
    date: formatDate(new Date()),
    text: safeText,
    likes: 0,
    isLiked: false
  };
  
  const updatedComments = [...comments, newComment];
  setComments(updatedComments);
  renderComments();
  initEventHandlers();
  
  // Сбрасываем состояние цитирования
  setReplyingTo(null);
}

// Функция для инициализации обработчиков событий
export function initEventHandlers() {
  const likeButtons = document.querySelectorAll('.like-button');
  const commentElements = document.querySelectorAll('.comment');
  const addButton = document.getElementById('addButton');
  const nameInput = document.getElementById('nameInput');
  const textInput = document.getElementById('textInput');
  
  // Обработчики для лайков
  likeButtons.forEach(button => {
    button.addEventListener('click', handleLikeClick);
  });
  
  // Обработчики для цитирования комментариев
  commentElements.forEach(comment => {
    comment.addEventListener('click', handleCommentClick);
  });
  
  // Обработчик для кнопки "Написать"
  addButton.addEventListener('click', function() {
    const name = nameInput.value.trim();
    const text = textInput.value.trim();
    
    // Валидация полей
    if (!name) {
      alert('Пожалуйста, введите ваше имя');
      nameInput.focus();
      return;
    }
    
    if (!text) {
      alert('Пожалуйста, введите текст комментария');
      textInput.focus();
      return;
    }
    
    // Добавление нового комментария
    addComment(name, text);
    
    // Очистка полей ввода
    nameInput.value = '';
    textInput.value = '';
  });
  
  // Обработчик нажатия Enter в поле текста
  textInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      addButton.click();
    }
  });
}