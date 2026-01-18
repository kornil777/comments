import { comments, setComments } from "./constants.js";
import { renderComments } from "./render.js";
import { escapeHtml } from "./escapeHtml.js";
import { postComment, toggleLike } from "../api.js";
import { getToken, login, register, removeToken, getCurrentUser } from "./auth.js";

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
        const originalTitle = button.getAttribute('title');
        button.setAttribute('title', 'Загрузка...');
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
            // При цитировании не заполняем имя, только текст
            document.getElementById("textInput").value = `> ${escapeHtml(commentToQuote.text)}\n\n`;
            document.getElementById("textInput").focus();
            
            // Если не авторизован, показываем форму входа
            if (!getToken()) {
                showLoginForm();
            }
        }
    }
}

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
                alert(error.message || "Произошла ошибка");
            }
        });
}

// Функции для управления формами
function showLoginForm() {
    hideCommentForm();
    hideAuthPrompt();
    hideRegisterForm();
    document.getElementById("loginForm").style.display = "flex";
}

function showRegisterForm() {
    hideCommentForm();
    hideAuthPrompt();
    hideLoginForm();
    document.getElementById("registerForm").style.display = "flex";
}

function hideLoginForm() {
    document.getElementById("loginForm").style.display = "none";
}

function hideRegisterForm() {
    document.getElementById("registerForm").style.display = "none";
}

function hideAuthForms() {
    hideLoginForm();
    hideRegisterForm();
}

function showCommentForm() {
    hideAuthPrompt();
    hideAuthForms();
    document.querySelector(".add-form").style.display = "flex";
}

function hideCommentForm() {
    document.querySelector(".add-form").style.display = "none";
}

function showAuthPrompt() {
    document.querySelector(".auth-prompt").style.display = "block";
}

function hideAuthPrompt() {
    document.querySelector(".auth-prompt").style.display = "none";
}

function showUserInfo() {
    const user = getCurrentUser();
    if (user) {
        document.getElementById("userName").textContent = user.name;
        document.getElementById("userInfo").style.display = "block";
        hideAuthForms();
        hideAuthPrompt();
        showCommentForm();
    } else {
        document.getElementById("userInfo").style.display = "none";
        hideCommentForm();
        hideAuthForms();
        showAuthPrompt();
    }
}

// Инициализация обработчиков авторизации
export function initAuthHandlers() {
    const loginButton = document.getElementById("loginButton");
    const registerButton = document.getElementById("registerButton");
    const logoutButton = document.getElementById("logoutButton");
    const showRegisterLink = document.getElementById("showRegister");
    const showLoginLink = document.getElementById("showLogin");
    const authPromptLoginLink = document.getElementById("authPromptLogin");
    const authPromptRegisterLink = document.getElementById("authPromptRegister");
    
    // Показываем/скрываем формы в зависимости от авторизации
    showUserInfo();
    
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
    
    // Обработчики для ссылок в приглашении авторизоваться
    if (authPromptLoginLink) {
        authPromptLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }
    
    if (authPromptRegisterLink) {
        authPromptRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            showRegisterForm();
        });
    }
    
    // Вход
    if (loginButton) {
        loginButton.addEventListener("click", () => {
            const loginInput = document.getElementById("loginLogin");
            const passwordInput = document.getElementById("loginPassword");
            
            const loginValue = loginInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            
            if (!loginValue || !passwordValue) {
                document.getElementById("loginError").textContent = "Заполните все поля";
                return;
            }
            
            login({ login: loginValue, password: passwordValue })
                .then(() => {
                    document.getElementById("loginError").textContent = "";
                    loginInput.value = "";
                    passwordInput.value = "";
                    showUserInfo();
                    alert("Вы успешно вошли!");
                })
                .catch((error) => {
                    document.getElementById("loginError").textContent = error.message;
                });
        });
    }
    
    // Регистрация
    if (registerButton) {
        registerButton.addEventListener("click", () => {
            const nameInput = document.getElementById("registerName");
            const loginInput = document.getElementById("registerLogin");
            const passwordInput = document.getElementById("registerPassword");
            
            const nameValue = nameInput.value.trim();
            const loginValue = loginInput.value.trim();
            const passwordValue = passwordInput.value.trim();
            
            if (!nameValue || !loginValue || !passwordValue) {
                document.getElementById("registerError").textContent = "Заполните все поля";
                return;
            }
            
            register({ name: nameValue, login: loginValue, password: passwordValue })
                .then(() => {
                    document.getElementById("registerError").textContent = "";
                    nameInput.value = "";
                    loginInput.value = "";
                    passwordInput.value = "";
                    showUserInfo();
                    alert("Регистрация успешна!");
                })
                .catch((error) => {
                    document.getElementById("registerError").textContent = error.message;
                });
        });
    }
    
    // Выход
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            removeToken();
            showUserInfo();
            alert("Вы вышли из системы");
            
            // Перезагружаем комментарии
            import("../api.js").then(({ fetchComments }) => {
                fetchComments().then((data) => {
                    setComments(data);
                    renderComments();
                    initEventHandlers();
                });
            });
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
}