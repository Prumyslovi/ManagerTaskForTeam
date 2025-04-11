const API_URL = 'http://localhost:5062/api';

export const fetchComments = async (taskId) => {
  const response = await fetch(`/${API_URL}/Comment/GetCommentsByTaskId/${taskId}`);
  return response.json();
}

export const addComment = async (commentData) => {
  const response = await fetch('/${API_URL}/Comment/AddComment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(commentData),
  });
  return response.json();
}