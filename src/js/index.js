import NewsApiService from './axiosFetch';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import '../sass/index.scss';

let lightbox = new SimpleLightbox('.photo-card a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});

const refs = {
  searchForm: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};
let isShown = 0;
const newsApiService = new NewsApiService();

refs.searchForm.addEventListener('submit', search);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const options = {
  rootMargin: '50px',
  root: null,
  threshold: 0.3,
};
const observer = new IntersectionObserver(onLoadMore, options);

function search(element) {
  element.preventDefault();

  refs.gallery.innerHTML = '';
  newsApiService.query =
    element.currentTarget.elements.searchQuery.value.trim();
  newsApiService.resetPage();

  if (newsApiService.query === '') {
    Notify.warning('Please, fill the main field');
    return;
  }

  isShown = 0;
  fetchGallery();
  onRenderGallery(hits);
}

function onLoadMore() {
  newsApiService.incrementPage();
  fetchGallery();
}

async function fetchGallery() {
  refs.loadMoreBtn.classList.add('is-hidden');

  const result = await newsApiService.fetchGallery();
  const { hits, total } = result;
  isShown += hits.length;

  if (!hits.length) {
    Notify.failure(
      `Sorry, there are no images matching your search query. Please try again.`
    );
    refs.loadMoreBtn.classList.add('is-hidden');
    return;
  }

  onRenderGallery(hits);
  isShown += hits.length;

  if (isShown < total) {
    Notify.success(`Hooray! We found ${total} images !!!`);
    refs.loadMoreBtn.classList.remove('is-hidden');
  }

  if (isShown >= total) {
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

function onRenderGallery(elements) {
  const markup = elements
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card">
    <a href="${largeImageURL}">
      <img class="photo-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
       <p class="info-item">
        <b>Likes</b>
        ${likes}
      </p>
      <p class="info-item">
        <b>Views</b>
        ${views}
      </p>
      <p class="info-item">
        <b>Comments</b>
        ${comments}
      </p>
      <p class="info-item">
        <b>Downloads</b>
        ${downloads}
      </p>
    </div>
    </div>`;
      }
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}