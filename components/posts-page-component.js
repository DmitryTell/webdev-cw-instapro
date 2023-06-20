import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { posts, page, currentLogin, goToPage, getToken, renderApp } from "../index.js";
import { deletePost, dislikePost, likePost } from "../api.js";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale";

export function renderPostsPageComponent({ appEl }) {
  let isScrolled = false;

  const render = () => {
    const listHtml = posts.map(post => {
      return `
        <li class="post">
          <div class="post-header" data-user-id="${post.user.id}">
            <img src="${post.user.imageUrl}" class="post-header__user-image">
            <p class="post-header__user-name">${post.user.name}</p>
            ${
              currentLogin == post.user.login ?
                '<a href="" class="delete-link">Удалить</a>' : ''
            }
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
            ${
              formatDistanceToNow(new Date(post.createdAt), {locale: ru})
            }
          </p>
        </li>`;
    }).join('');
    
    const appHtml = `
      <div class="page-container">
        <div class="header-container" id="header"></div>
        <ul class="posts">
          ${listHtml}
        </ul>
      </div>
      ${
        isScrolled ? `
          <a href="#header" id="up-link">
            <img src="./assets/images/up-arrow.svg" id="up-arrow">
          </a>` : ''
      }`;
  
    appEl.innerHTML = appHtml;
  
    renderHeaderComponent({
      element: document.querySelector(".header-container"),
    });

    window.addEventListener('scroll', function scrollWin() {
      if (this.pageYOffset > 300) {
        isScrolled = true;

        render();
        
        this.removeEventListener('scroll', scrollWin);
      }
    });

    document.querySelector('#up-link')
    ?.addEventListener('click', () => {
      isScrolled = false;

      renderApp();
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
  
    [...document.querySelectorAll('.delete-link')].forEach((delEl, index) => {
      delEl?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
  
        deletePost({
          token: getToken(),
          id: posts[index].id
        }).then(() => {
          return goToPage(page);
        });
      });
    });
  }

  render();
}
