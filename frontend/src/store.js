import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  auth: {
    isLoggedIn: false,
    memberId: null,
    isLoading: false,
    errorMessage: '',
    showPassword: false,
    success: null,
    loading: false,
    error: null,
    showPasswordReplay: false,
  },
  content: {
    activeContent: 'home',
    restrictedContent: '',
  },
};

const authReducer = (state = initialState.auth, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isLoggedIn: true, memberId: action.payload.memberId };
    case 'LOGOUT':
      return { ...state, isLoggedIn: false, memberId: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SUCCESS':
      return { ...state, success: action.payload };
    case 'TOGGLE_PASSWORD':
      return { ...state, showPassword: !state.showPassword };
    case 'TOGGLE_PASSWORD_REPLAY':
      return { ...state, showPasswordReplay: !state.showPasswordReplay };
    case 'SET_SHOW_PASSWORD':
      return { ...state, showPassword: action.payload };
    case 'SET_SHOW_PASSWORD_REPLAY':
      return { ...state, showPasswordReplay: action.payload };
    default:
      return state;
  }
};

const contentReducer = (state = initialState.content, action) => {
  switch (action.type) {
    case 'SET_CONTENT':
      return { ...state, activeContent: action.payload };
    case 'SET_RESTRICTED':
      return { ...state, restrictedContent: action.payload };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
  },
});

export default store;