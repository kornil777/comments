import { comments, setComments } from "./constants.js";
import { renderComments } from "./render.js";
import { escapeHtml } from "./escapeHtml.js";
import { postComment, toggleLike, fetchComments } from "../api.js";
import { getToken, login, register, removeToken, getCurrentUser } from "./auth.js";

// Показать/скрыть предложение авторизации
export function showAuthSuggestion(show) {
  const authSuggestion = document.getElementById('authSuggestion');
  if (authSuggestion) {
    authSuggestion.style.display = show ? 'block' : 'none';
  }
  
  // Также управляем видимостью комментариев
  const commentsList = document.getElementById('commentsList');
  if (commentsList) {
    commentsList.style.display = show ? 'none' : 'block';
  }
  const titleHtml = document.getElementById('titleHead');
  if (titleHtml) {
    titleHtml.style.display = show ? 'block' : 'none';
  }
}

// Функция для создания формы логина через JS
function createLoginForm() {
  const authContainer = document.getElementById('authContainer');
  
  if (!authContainer) return;
  
  authContainer.innerHTML = `
    <div class="add-form" id="loginForm" style="margin-bottom: 30px; margin-top: 20px;">
      <h3 style="color: white; margin-top: 0; margin-bottom: 20px;">Вход</h3>
      <input type="text" id="loginLogin" placeholder="Логин" class="add-form-name" />
      <input type="password" id="loginPassword" placeholder="Пароль" class="add-form-name" style="margin-top: 10px;" />
      <div id="loginError" style="color: #ff4444; margin-top: 10px; min-height: 20px;"></div>
      <div class="add-form-row" style="margin-top: 15px;">
        <button id="loginButton" class="add-form-button" style="margin-right: 10px;">Войти</button>
        <a href="#" id="showRegister" style="color: #bcec30; text-decoration: none; line-height: 40px; margin-left: 10px;">Регистрация</a>
      </div>
    </div>
  `;
  
  // Показываем контейнер
  authContainer.style.display = 'block';
}

// Функция для создания формы регистрации через JS
function createRegisterForm() {
  
  const authContainer = document.getElementById('authContainer');
  
  if (!authContainer) return;
  
  authContainer.innerHTML = `
    <div class="add-form" id="registerForm" style="margin-bottom: 30px; margin-top: 20px;">
      <h3 style="color: white; margin-top: 0; margin-bottom: 20px;">Регистрация</h3>
      <input type="text" id="registerName" placeholder="Имя" class="add-form-name" />
      <input type="text" id="registerLogin" placeholder="Логин" class="add-form-name" style="margin-top: 10px;" />
      <input type="password" id="registerPassword" placeholder="Пароль" class="add-form-name" style="margin-top: 10px;" />
      <div id="registerError" style="color: #ff4444; margin-top: 10px; min-height: 20px;"></div>
      <div class="add-form-row" style="margin-top: 15px;">
        <button id="registerButton" class="add-form-button" style="margin-right: 10px;">Зарегистрироваться</button>
        <a href="#" id="showLogin" style="color: #bcec30; text-decoration: none; line-height: 40px; margin-left: 10px;">Войти</a>
      </div>
    </div>
  `;
  
  // Показываем контейнер
  authContainer.style.display = 'block';
}

// Показать форму логина (скрывает комментарии и показывает форму)
export function showLoginForm() {
  // Скрываем предложение авторизации
  showAuthSuggestion(false);
  // Скрываем комментарии
  const commentsList = document.getElementById('commentsList');
  if (commentsList) {
    commentsList.style.display = 'none';
  }
  // Создаем форму логина
  createLoginForm();
  initAuthHandlers();
}
 
// Показать форму регистрации (скрывает комментарии и показывает форму)
function showRegisterForm() {
  // Скрываем предложение авторизации
  showAuthSuggestion(false);
  
  // Скрываем комментарии

  const commentsList = document.getElementById('commentsList');
  if (commentsList) {
    commentsList.style.display = 'none';
  };

 

  // Создаем форму регистрации
  createRegisterForm();
  initAuthHandlers();
}

// Показать информацию о пользователе
export function showUserInfo() {
  const user = getCurrentUser();
  if (user) {
    // Проверяем, существует ли элемент userName
    const userNameElement = document.getElementById('userName');
    const userInfoElement = document.getElementById('userInfo');
    const authorNameElement = document.getElementById('authorName');
    
    if (userNameElement) {
      userNameElement.textContent = user.name;
    }
    
    if (userInfoElement) {
      userInfoElement.style.display = 'block';
    }
    
    if (authorNameElement) {
      authorNameElement.value = user.name;
    }
    
    // Очищаем контейнер авторизации
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
      authContainer.innerHTML = '';
      authContainer.style.display = 'none';
    }
  }
}

// Функция для обработки лайков
async function handleLikeClick(event) {
  event.stopPropagation();
  
  const commentId = event.target.getAttribute("data-id");
  
  if (!getToken()) {
    showLoginForm();
    alert("Для оценки комментария требуется авторизация");
    return;
  }
  
  try {
    // Показываем индикатор загрузки на кнопке
    const button = event.target;
    button.style.opacity = '0.7';
    button.style.pointerEvents = 'none';
    
    // Отправляем запрос на сервер для переключения лайка
    const result = await toggleLike(commentId);
    
    // Обновляем локальный массив комментариев
    const commentIndex = comments.findIndex((c) => c.id === commentId);
    if (commentIndex !== -1) {
      const updatedComments = [...comments];
      updatedComments[commentIndex].likes = result.likes;
      updatedComments[commentIndex].isLiked = result.isLiked;
      setComments(updatedComments);
      renderComments();
      initEventHandlers();
    }
  } catch (error) {
    console.error("Ошибка при установке лайка:", error);
    
    if (error.message === "Требуется авторизация") {
      showLoginForm();
      alert("Для оценки комментария требуется авторизация");
    } else if (error.message.includes("Ошибка сервера")) {
      alert("Сервер сломался, попробуйте позже");
    } else {
      alert("Произошла ошибка при установке лайка");
    }
  }
}

// Функция для обработки цитирования
function handleCommentClick(event) {
  if (!event.target.closest(".like-button")) {
    const commentId = event.currentTarget.querySelector(".like-button").getAttribute("data-id");
    const commentToQuote = comments.find((c) => c.id === commentId);
    
    if (commentToQuote) {
      document.getElementById("textInput").value = `> ${escapeHtml(commentToQuote.text)}\n\n`;
      document.getElementById("textInput").focus();
      
      // Если не авторизован, показываем форму входа
      if (!getToken()) {
        showLoginForm();
      }
    }
  }
}

function createAddForm() {
  
  const addForm = document.getElementById('add-form');
  
  if (!addForm) return;
  
  addForm.innerHTML = `
    <div class="add-form" style="margin-top: 48px;">
       
        <input
          type="text"
          class="add-form-name"
          id="authorName"
          placeholder="Автор"
          readonly
          style="background-color: #333; color: white; border: 1px solid #555; cursor: not-allowed;"
        />
        <textarea
          type="textarea"
          class="add-form-text"
          placeholder="Введите ваш комментарий"
          rows="4"
          id="textInput"
        ></textarea>
        <div class="add-form-row">
          <button class="add-form-button" id="addButton">Написать</button>
        </div>
      </div>

     
      <div class="form-loading" style="display: none; margin-top: 20px; color: white;">
        Комментарий добавляется...
      </div>
  `;
  
  // Показываем контейнер
  addForm.style.display = 'block';
}

createAddForm();


// Функция для добавления комментария
export function addComment() {
 
  const textInput = document.getElementById("textInput");
  const text = textInput.value.trim();

  if (!getToken()) {
    showLoginForm();
    alert("Для добавления комментария требуется авторизация");
    return;
  }

  if (!text) {
    alert("Пожалуйста, введите текст комментария");
    textInput.focus();
    return;
  }

  if (text.length < 3) {
    alert("Комментарий должен содержать хотя бы 3 символа");
    textInput.focus();
    return;
  }

  document.querySelector(".form-loading").style.display = "block";
  document.getElementById("addButton").disabled = true;

  postComment({ text })
    .then((data) => {
      document.querySelector(".form-loading").style.display = "none";
      document.getElementById("addButton").disabled = false;
      
      setComments(data);
      renderComments();
      initEventHandlers();
      
      textInput.value = "";
    })
    .catch((error) => {
      document.querySelector(".form-loading").style.display = "none";
      document.getElementById("addButton").disabled = false;

      if (error.message === "Требуется авторизация") {
        showLoginForm();
        alert("Для добавления комментария требуется авторизация");
      } else if (error.message.includes("содержать хотя бы 3 символа")) {
        alert("Комментарий должен содержать хотя бы 3 символа");
      } else {
        alert(error.message || "Произошла ошибка при добавлении комментария");
      }
    });
}

// Инициализация обработчиков авторизации
function initAuthHandlers() {
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const logoutButton = document.getElementById("logoutButton");
  const showRegisterLink = document.getElementById("showRegister");
  const showLoginLink = document.getElementById("showLogin");
  const authSuggestionLink = document.getElementById("authSuggestionLink");
  
  // Обработчик для ссылки в предложении авторизации
  if (authSuggestionLink) {
    authSuggestionLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }
  
  // Обработчики для переключения между формами входа и регистрации
  if (showRegisterLink) {
    showRegisterLink.addEventListener("click", (e) => {
      e.preventDefault();
      showRegisterForm();
    });
  }
  
  if (showLoginLink) {
    showLoginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showLoginForm();
    });
  }
  
  // Вход
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      const loginInput = document.getElementById("loginLogin");
      const passwordInput = document.getElementById("loginPassword");
      
      if (!loginInput || !passwordInput) return;
      
      const loginValue = loginInput.value.trim();
      const passwordValue = passwordInput.value.trim();
      
      if (!loginValue || !passwordValue) {
        const loginError = document.getElementById("loginError");
        if (loginError) {
          loginError.textContent = "Заполните все поля";
        }
        return;
      }
      
      login({ login: loginValue, password: passwordValue })
        .then(() => {
          const loginError = document.getElementById("loginError");
          if (loginError) {
            loginError.textContent = "";
          }
          
          if (loginInput) loginInput.value = "";
          if (passwordInput) passwordInput.value = "";
          
          // Показываем информацию о пользователе
          showUserInfo();
          
          // Скрываем форму авторизации
          const authContainer = document.getElementById('authContainer');
          if (authContainer) {
            authContainer.innerHTML = '';
            authContainer.style.display = 'none';
          }
          
          // Загружаем комментарии заново
          const commentsList = document.querySelector(".comments");
          if (commentsList) {
            commentsList.innerHTML = "Пожалуйста подождите, загружаю комментарии...";
            commentsList.style.display = 'block';
          }
          
          fetchComments()
            .then((data) => {
              setComments(data);
              renderComments();
              initEventHandlers();
              
              // Показываем форму комментариев
              const addForm = document.querySelector('.add-form');
              if (addForm) {
                addForm.style.display = 'flex';
              }
              
              // Заполняем поле автора
              const user = getCurrentUser();
              const authorName = document.getElementById('authorName');
              if (authorName && user) {
                authorName.value = user.name;
              }
              
              // Скрываем предложение авторизации
              showAuthSuggestion(false);
              
              // alert("Вы успешно вошли!");
            })
            .catch((error) => {
              console.error("Ошибка загрузки комментариев:", error);
              const commentsList = document.querySelector(".comments");
              if (commentsList) {
                commentsList.innerHTML = 
                  "<li style='color: white; text-align: center; padding: 20px;'>Ошибка загрузки комментариев.</li>";
              }
            });
        })
        .catch((error) => {
          const loginError = document.getElementById("loginError");
          if (loginError) {
            loginError.textContent = error.message;
          }
        });
    });
    
  }
  
  // Регистрация
  if (registerButton) {
    registerButton.addEventListener("click", () => {
      const nameInput = document.getElementById("registerName");
      const loginInput = document.getElementById("registerLogin");
      const passwordInput = document.getElementById("registerPassword");
      
      if (!nameInput || !loginInput || !passwordInput) return;
      
      const nameValue = nameInput.value.trim();
      const loginValue = loginInput.value.trim();
      const passwordValue = passwordInput.value.trim();
      
      if (!nameValue || !loginValue || !passwordValue) {
        const registerError = document.getElementById("registerError");
        if (registerError) {
          registerError.textContent = "Заполните все поля";
        }
        return;
      }
      
      register({ name: nameValue, login: loginValue, password: passwordValue })
        .then(() => {
          const registerError = document.getElementById("registerError");
          if (registerError) {
            registerError.textContent = "";
          }
          
          if (nameInput) nameInput.value = "";
          if (loginInput) loginInput.value = "";
          if (passwordInput) passwordInput.value = "";
          
          // Показываем информацию о пользователе
          showUserInfo();
          
          // Скрываем форму авторизации
          const authContainer = document.getElementById('authContainer');
          if (authContainer) {
            authContainer.innerHTML = '';
            authContainer.style.display = 'none';
          }
          
          // Загружаем комментарии заново
          const commentsList = document.querySelector(".comments");
          if (commentsList) {
            commentsList.innerHTML = "Пожалуйста подождите, загружаю комментарии...";
            commentsList.style.display = 'block';
          }
          
          fetchComments()
            .then((data) => {
              setComments(data);
              renderComments();
              initEventHandlers();
              
              // Показываем форму комментариев
              const addForm = document.querySelector('.add-form');
              if (addForm) {
                addForm.style.display = 'flex';
              }
              
              // Заполняем поле автора
              const user = getCurrentUser();
              const authorName = document.getElementById('authorName');
              if (authorName && user) {
                authorName.value = user.name;
              }
              
              // Скрываем предложение авторизации
              showAuthSuggestion(false);
              
              alert("Регистрация успешна!");
            })
            .catch((error) => {
              console.error("Ошибка загрузки комментариев:", error);
              const commentsList = document.querySelector(".comments");
              if (commentsList) {
                commentsList.innerHTML = 
                  "<li style='color: white; text-align: center; padding: 20px;'>Ошибка загрузки комментариев.</li>";
              }
            });
        })
        .catch((error) => {
          const registerError = document.getElementById("registerError");
          if (registerError) {
            registerError.textContent = error.message;
          }
        });
    });
  }
  
  // Выход
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      removeToken();
      
      // Скрываем информацию о пользователе
      const userInfo = document.getElementById('userInfo');
      if (userInfo) {
        userInfo.style.display = 'none';
      }
      
      // Скрываем форму комментариев
      const addForm = document.querySelector('.add-form');
      if (addForm) {
        addForm.style.display = 'none';
      }
      
      // Очищаем поле автора
      const authorName = document.getElementById('authorName');
      if (authorName) {
        authorName.value = '';
      }
      
      // Очищаем контейнер авторизации
      const authContainer = document.getElementById('authContainer');
      if (authContainer) {
        authContainer.innerHTML = '';
        authContainer.style.display = 'none';
      }
      
      // Показываем предложение авторизации
      showAuthSuggestion(true);
      
      // Обновляем комментарии для отображения правильного состояния лайков
      fetchComments()
        .then((data) => {
          setComments(data);
          renderComments();
          initEventHandlers();
        })
        .catch((error) => {
          console.error("Ошибка загрузки комментариев:", error);
        });

        const commentsList = document.getElementById('commentsList');
  if (commentsList) {
    commentsList.style.display = 'block';
  }
  
        
      // alert("Вы вышли из системы");
      
    });
  }
}


// Функция для инициализации обработчиков событий
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
  
  // Инициализация обработчиков авторизации
  initAuthHandlers();
}