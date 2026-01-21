import { renderComments } from "./modules/render.js";
import { initEventHandlers, showLoginForm, showUserInfo } from "./modules/eventHandlers.js";
import { setComments } from "./modules/constants.js";
import { fetchComments } from "./api.js";
import { getToken, getCurrentUser } from "./modules/auth.js";

// При загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const token = getToken();
  const user = getCurrentUser();
  
  // Всегда загружаем комментарии
  document.querySelector(".comments").innerHTML =
    "Пожалуйста подождите, загружаю комментарии...";
  
  fetchComments()
    .then((data) => {
      setComments(data);
      renderComments();
      
      // Показываем форму комментариев только если авторизован
      if (token && user) {
        const addForm = document.querySelector('.add-form');
        if (addForm) {
          addForm.style.display = 'flex';
        }
        
        const authorName = document.getElementById('authorName');
        if (authorName) {
          authorName.value = user.name;
        }
        
        // Показываем информацию о пользователе
        showUserInfo();
        
        // Скрываем предложение авторизации
        const authSuggestion = document.getElementById('authSuggestion');
        if (authSuggestion) {
          authSuggestion.style.display = 'none';
        }
      } else {
        // Если не авторизован, показываем предложение авторизоваться
        const authSuggestion = document.getElementById('authSuggestion');
        if (authSuggestion) {
          authSuggestion.style.display = 'block';
        }
        
        // Скрываем форму комментариев
        const addForm = document.querySelector('.add-form');
        if (addForm) {
          addForm.style.display = 'none';
        }
      }
      
      initEventHandlers();
    })
    .catch((error) => {
      console.error("Ошибка загрузки комментариев:", error);
      document.querySelector(".comments").innerHTML = 
        "<li style='color: white; text-align: center; padding: 20px;'>Ошибка загрузки комментариев. Пожалуйста, попробуйте позже.</li>";
    });
});