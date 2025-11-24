// Начальные данные комментариев
export const initialComments = [
  {
    id: 1,
    name: 'Глеб Фокин',
    date: '12.02.22 12:18',
    text: 'Это будет первый комментарий на этой странице',
    likes: 3,
    isLiked: false
  },
  {
    id: 2,
    name: 'Варвара Н.',
    date: '13.02.22 19:22',
    text: 'Мне нравится как оформлена эта страница! ❤',
    likes: 75,
    isLiked: true
  }
];

// Переменная для хранения текущих комментариев
export let comments = [...initialComments];

// Переменная для хранения ID комментария, на который отвечаем
export let replyingTo = null;

// Функция для обновления комментариев
export function setComments(newComments) {
  comments = newComments;
}

// Функция для установки состояния цитирования
export function setReplyingTo(commentId) {
  replyingTo = commentId;
}