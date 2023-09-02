import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '39198737-e441a494d9c878a4c9c462200';
const perPage = 40;
let currentPage = 1;
let currentQuery = '';
let isGalleryLoaded = false;
const searchForm = document.querySelector('#search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.style.display = 'none';

//!стволюємо екземпляр SimpleLightbox
const lightbox = new SimpleLightbox('.gallery a',{
    enableKeyboard: true,
});

//! робимо запит картинок 
async function searchImages(query) {
    try {
        const response = await axios.get(`https://pixabay.com/api/?key=${apiKey}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`);
        const data = response.data;
        return data.hits;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}

//! створюємо вміст галлереї
function renderImages(images) {
    images.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('photo-card');
        card.innerHTML = `
            <a href="${image.largeImageURL}" data-lightbox="image">
                <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item"><b>Likes</b> ${image.likes}</p>
                <p class="info-item"><b>Views</b> ${image.views}</p>
                <p class="info-item"><b>Comments</b> ${image.comments}</p>
                <p class="info-item"><b>Downloads</b> ${image.downloads}</p>
            </div>
        `;
        gallery.appendChild(card);
    });
    lightbox.refresh(); 
    isGalleryLoaded = true;
    loadMoreButton.style.display = 'block';
}


//! додаткове завантаження картинок
async function loadMoreImages() {
    currentPage++;
    const images = await searchImages(currentQuery);
    if (images.length === 0) {
        loadMoreButton.style.display = 'none';
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        return;
    }
    renderImages(images);
    scrollToNextGroup();
}

//! плавний скролл до нових картинок
function scrollToNextGroup() {
    const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

//! обробник пошуку з логікою на оновлення галлереї в разі зміни слова пошуку
let previousQuery = '';
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    currentPage = 1;
    currentQuery = event.target.searchQuery.value.trim();
    if (currentQuery !== previousQuery) {
        removePhotoCards();
    } 
    previousQuery = currentQuery;
    const images = await searchImages(currentQuery);
    if (images.length === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
        renderImages(images);
        Notiflix.Notify.success(`Hooray! We found ${images.length} images.`);
    }
});

//! завантаження нових вото
loadMoreButton.addEventListener('click', async () => {
    if (isGalleryLoaded) {
        const images = await searchImages(currentQuery);
        if (images.length === 0) {
            loadMoreButton.style.display = 'none';
            Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        } else {
            loadMoreImages(images);
            scrollToNextGroup();
        }
    }
});

//! знищуємо картки та оновлюємо статус кнопки 
function removePhotoCards() {
    const photoCards = document.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
        gallery.removeChild(card);
    });
    isGalleryLoaded = false;
    loadMoreButton.style.display = 'none';
}

