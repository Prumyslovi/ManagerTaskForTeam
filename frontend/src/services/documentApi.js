import axios from 'axios';

const API_URL = 'http://localhost:5062/api';

axios.defaults.withCredentials = true;

export const fetchDocuments = async (teamId) => {
  const response = await axios.get(`${API_URL}/Documents/GetAllDocuments/${teamId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export const fetchDocumentContent = async (documentId) => {
  const response = await axios.get(`${API_URL}/Documents/GetDocumentContent/${documentId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export const createDocument = async (documentData) => {
  const response = await axios.post(`${API_URL}/Documents/AddDocument`, documentData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export const updateDocument = async (documentId, documentData) => {
  const response = await axios.put(`${API_URL}/Documents/UpdateDocument/${documentId}`, documentData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export const fetchDocumentChanges = async (documentId) => {
  const response = await axios.get(`${API_URL}/Documents/GetChanges/${documentId}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}

export const fetchAllDocuments = async (teamId) => {
  const response = await fetch(`http://localhost:5062/api/documents/GetAllDocuments/${teamId}`, {
    credentials: 'include',
  });
  return response.json();
}