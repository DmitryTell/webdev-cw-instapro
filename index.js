import { addNewPost, getPosts, getUserPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getLoginFromLocalStorage,
  getUserFromLocalStorage,
  removeLoginFromLocalStorage,
  removeUserFromLocalStorage,
  saveLoginToLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];
export let currentLogin = getLoginFromLocalStorage();

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;

  return token;
};

export const logout = () => {
  user = null;
  currentLogin = null;

  removeUserFromLocalStorage();
  removeLoginFromLocalStorage();

  return goToPage(POSTS_PAGE);
};

export const goToPage = (newPage, data) => {
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;

      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;

      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;

          renderApp();
        })
        .catch((error) => {
          console.error(error);

          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      page = LOADING_PAGE;

      renderApp();

      return getUserPosts({
        token: getToken(),
        id: data.userId
      }).then(newPosts => {
        posts = newPosts;
        page = USER_POSTS_PAGE;

        renderApp();
      });
    }

    page = newPage;

    renderApp();
    return;
  }

  throw new Error("страницы не существует");
};

export const renderApp = () => {
  const appEl = document.getElementById("app");
  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;

        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      setLogin: (newLogin) => {
        currentLogin = newLogin;

        saveLoginToLocalStorage(currentLogin);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
      appEl,
      onAddPostClick({ description, imageUrl }) {
        addNewPost({
          token: getToken(),
          description,
          imageUrl
        }).then(() => {
          return goToPage(POSTS_PAGE);
        });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl
    });
  }
};

goToPage(POSTS_PAGE);