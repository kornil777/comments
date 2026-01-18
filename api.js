import { getToken } from "./modules/auth.js";

const host = "https://wedev-api.sky.pro/api/v2/alex-kornilov";

function getHeaders() {
    const token = getToken();
    const headers = {
        
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

export const fetchComments = () => {
    return fetch(`${host}/comments`)
        .then((res) => {
            if (!res.ok) {
                throw new Error('Ошибка загрузки комментариев');
            }
            return res.json();
        })
        .then((responseData) => {
            return responseData.comments.map(comment => {
                const date = new Date(comment.date);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(-2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                
                return {
                    id: comment.id,
                    name: comment.author.name,
                    date: formattedDate,
                    text: comment.text,
                    likes: comment.likes,
                    isLiked: comment.isLiked || false,
                };
            });
        });
};

export const postComment = ({ text }) => {
    const token = getToken();
    if (!token) {
        return Promise.reject(new Error("Требуется авторизация"));
    }

    return fetch(`${host}/comments`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text }),
    })
        .then((response) => {
            if (response.status === 401) {
                throw new Error("Требуется авторизация");
            }
            if (response.status === 500) {
                throw new Error("Ошибка сервера");
            }
            if (response.status === 400) {
                return response.json().then((error) => {
                    throw new Error(error.error || "Неверный запрос");
                });
            }
            if (response.status === 201) {
                return response.json();
            }
            throw new Error(`Неизвестная ошибка: ${response.status}`);
        })
        .then(() => {
            return fetchComments();
        });
};

export const toggleLike = (commentId) => {
    const token = getToken();
    if (!token) {
        return Promise.reject(new Error("Требуется авторизация"));
    }

    return fetch(`${host}/comments/${commentId}/toggle-like`, {
        method: "POST",
        headers: getHeaders(),
    })
        .then((response) => {
            if (response.status === 401) {
                throw new Error("Требуется авторизация");
            }
            if (response.status === 500) {
                throw new Error("Ошибка сервера");
            }
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            return data.result;
        });
};