import { renderComments } from './modules/render.js';
import { initEventHandlers } from './modules/eventHandlers.js';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Первоначальный рендер комментариев
  renderComments();
  
  // Инициализация обработчиков событий
  initEventHandlers();
});