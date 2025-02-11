// actions.js

export const login = (userId, firstName, lastName) => ({
    type: 'auth/login',
    payload: { userId, firstName, lastName },
  });
  
  export const logout = () => ({
    type: 'auth/logout',
  });
  
  export const setActiveContent = (content) => ({
    type: 'setActiveContent',
    payload: content,
  });
  
  export const setRestrictedContent = (content) => ({
    type: 'setRestrictedContent',
    payload: content,
  });
  
  export const toggleVisibility = (form) => ({
    type: 'toggleVisibility',
    payload: form,
  });
  
  export const setFirstName = (firstName) => ({
    type: 'setFirstName',
    payload: firstName,
  });
  
  export const setLastName = (lastName) => ({
    type: 'setLastName',
    payload: lastName,
  });
  
  export const setUsers = (users) => ({
    type: 'setUsers',
    payload: users,
  });