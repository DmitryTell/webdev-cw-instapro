export function saveUserToLocalStorage(user) {
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage() {
  try {
    return JSON.parse(window.localStorage.getItem("user"));
  } catch (error) {
    return null;
  }
}

export function removeUserFromLocalStorage() {
  window.localStorage.removeItem("user");
}

export function saveLoginToLocalStorage(login) {
  window.localStorage.setItem('login', login);
}

export function getLoginFromLocalStorage() {
  try {
    return window.localStorage.getItem('login');
  } catch (error) {
    return null;
  }
}

export function removeLoginFromLocalStorage() {
  window.localStorage.removeItem('login');
}