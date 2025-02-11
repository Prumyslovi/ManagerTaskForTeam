import { configureStore } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userId: null,
  firstName: null,
  lastName: null,
  activeContent: 'home',
  restrictedContent: '',
  isVisibleRegistrationForm: false,
  isVisibleEnterForm: false,
  users: []
};

// Редуктор для обновления состояния
const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'auth/login':
      return {
        ...state,
        isLoggedIn: true,
        userId: action.payload.userId,
        firstName: action.payload.firstName, // Обновление имени
        lastName: action.payload.lastName,   // Обновление фамилии
      };
    case 'auth/logout':
      return {
        ...state,
        isLoggedIn: false,
        userId: null,
        firstName: null, // Очистка имени
        lastName: null,  // Очистка фамилии
      };
    case 'setActiveContent':
      return {
        ...state,
        activeContent: action.payload,
      };
    case 'setRestrictedContent':
      return {
        ...state,
        restrictedContent: action.payload,
      };
    case 'toggleVisibility':
      return {
        ...state,
        [action.payload]: !state[action.payload],
      };
    case 'setFirstName':  // Экшен для обновления имени
      return {
        ...state,
        firstName: action.payload,
      };
    case 'setLastName':   // Экшен для обновления фамилии
      return {
        ...state,
        lastName: action.payload,
      };
    case 'setUsers':
      return {
        ...state,
        users: action.payload,
      };
    default:
      return state;
  }
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;
