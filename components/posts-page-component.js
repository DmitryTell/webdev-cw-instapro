import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, goToPage, getToken, renderApp } from "../index.js";
import { dislikePost, likePost } from "../api.js";

export function renderPostsPageComponent({ appEl }) {
  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */
  const listHtml = posts.map(post => {
    return `
      <li class="post">
        <div class="post-header" data-user-id="${post.user.id}">
          <img src="${post.user.imageUrl}" class="post-header__user-image">
          <p class="post-header__user-name">${post.user.name}</p>
        </div>
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}">
        </div>
        <div class="post-likes">
          <button data-post-id="${post.id}" class="like-button">
            <img src="${
              post.isLiked ? 
                './assets/images/like-active.svg' :
                './assets/images/like-not-active.svg'
            }">
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${
              post.likes.length > 0 ? post.likes[post.likes.length - 1].name : '0'
            }</strong> ${
              post.likes.length > 1 ? `и <strong>еще ${
                post.likes.length - 1
              }</strong>` : ''
            }
          </p>
        </div>
        <p class="post-text">
          <span class="user-name">${post.user.name}</span>
          ${post.description}
        </p>
        <p class="post-date">
          ${post.createdAt}
        </p>
      </li>`;
  }).join('');
  
  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${listHtml}
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

  for (let userEl of document.querySelectorAll(".post-header")) {
    userEl.addEventListener("click", () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }

  [...document.querySelectorAll('.like-button')].forEach((likeEl, index) => {
    likeEl.addEventListener('click', () => {
      if (posts[index].isLiked) {
        dislikePost({
          token: getToken(),
          id: posts[index].id
        }).then(newPost => {
          posts.splice(index, 1, newPost);

          renderApp();
        }).catch(error => alert(error.message));
      } else {
        likePost({
          token: getToken(),
          id: posts[index].id
        }).then(newPost => {
          posts.splice(index, 1, newPost);

          renderApp();
        }).catch(error => alert(error.message));
      }
    });
  });
}
