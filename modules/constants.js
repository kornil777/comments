export const initialComments = [
  
];

export let comments = [...initialComments];

export let replyingTo = null;

export function setComments(newComments) {
  comments = newComments;
}

export function setReplyingTo(commentId) {
  replyingTo = commentId;
}
