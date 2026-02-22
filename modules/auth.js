const AUTH_URL = 'https://wedev-api.sky.pro/api/user';

let token = null;
let currentUser = null;

export function getToken() {
    return token || localStorage.getItem('token');
}

export function setToken(newToken) {
    token = newToken;
    localStorage.setItem('token', newToken);
}

export function removeToken() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}

export function getCurrentUser() {
    if (currentUser) return currentUser;
    
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
}

export function setCurrentUser(user) {
    currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
}

export function login({ login, password }) {
    return fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
            
        },
        body: JSON.stringify({
            login,
            password,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(error.error || 'Ошибка авторизации');
                });
            }
            return response.json();
        })
        .then((data) => {
            setToken(data.user.token);
            setCurrentUser(data.user);
            return data;
        });
}

export function register({ login, password, name }) {
    return fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            
        },
        body: JSON.stringify({
            login,
            password,
            name,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(error.error || 'Ошибка регистрации');
                });
            }
            return response.json();
        })
        .then((data) => {
            setToken(data.user.token);
            setCurrentUser(data.user);
            return data;
        });
}