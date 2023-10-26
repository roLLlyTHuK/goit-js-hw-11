import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Swal from 'sweetalert2';
import 'sweetalert2/src/sweetalert2.scss';


const apiKey = '39198737-e441a494d9c878a4c9c462200';
const perPage = 40;
let currentPage = 1;
let currentQuery = '';
let isGalleryLoaded = false;
const searchForm = document.querySelector('#search-form');
const searchToggle = document.querySelector('#search-toggle');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');
//!observer
const options = {
  root: null,
  rootMargin: '300px',
 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
        
      loadMore();
    }
  });
}, options);
observer.observe(guard);
//!loader
const loader = document.querySelector('.loader');
function showLoader() {
    loader.style.display = 'block';
}
function hideLoader() {
    loader.style.display = 'none';
}

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
        redirectTo404Page();
        return [];
    }
}
//! робимо запит відео
async function searchVideos(query) {
    try {
        const response = await axios.get(`https://pixabay.com/api/videos/?key=${apiKey}&q=${query}&safesearch=false&page=${currentPage}&per_page=10`);
       
        const data = response.data;
        return data.hits;
    } catch (error) {
        console.error('Error fetching data:', error);
        redirectTo404Page();
        return [];
    }
}

function redirectTo404Page() {
    // window.location.href = '404.html';
    window.open('404.html', '_blank');
}

//! створюємо вміст галлереї картинок
function renderImages(images) {
    images.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('photo-card');
        card.innerHTML = `
            <a href="${image.largeImageURL}" data-lightbox="image">
                <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item"><b>Likes</b></br> ${image.likes}</p>
                <p class="info-item"><b>Views</b></br> ${image.views}</p>
                <p class="info-item"><b>Comments</b></br> ${image.comments}</p>
                <p class="info-item"><b>Downloads</b></br> ${image.downloads}</p>
            </div>
        `;
        gallery.appendChild(card);
    });
    lightbox.refresh(); 
    isGalleryLoaded = true;
}
//! створюємо вміст галлереї відео
function renderVideos(videos) {
    videos.forEach(video => {
        const card = document.createElement('div');
        card.classList.add('video-card');
        card.innerHTML = `
  <iframe id="vimeo-player" src="${video.videos.tiny.url}" width="640" height="360" frameborder="0"
    autoplay="false" allowfullscreen></iframe>
            <div class="info">
                <p class="info-item"><b>Likes</b></br> ${video.likes}</p>
                <p class="info-item"><b>Views</b></br> ${video.views}</p>
                <p class="info-item"><b>Comments</b></br> ${video.comments}</p>
                <p class="info-item"><b>Downloads</b></br> ${video.downloads}</p>
            </div>
        `;
        gallery.appendChild(card);
    });
    isGalleryLoaded = true;
}

//! додаткове завантаження картинок
async function loadMore() {
    if (isGalleryLoaded) {
        currentPage++;
        showLoader();
        
        if (searchToggle.checked) {
            const videos = await searchVideos(currentQuery);
            if (videos.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "We're sorry, but you've reached the end of search results for videos.",
                });
                observer.unobserve(guard);
            } else {
                // Обработка загруженных видео
                renderVideos(videos);
                scrollToNextGroup();
            }
        } else {
            const images = await searchImages(currentQuery);
            if (images.length === 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "We're sorry, but you've reached the end of search results for images.",
                });
                observer.unobserve(guard);
            } else {
                // Обработка загруженных изображений
                renderImages(images);
                scrollToNextGroup();
            }
        }
        
        hideLoader();
    }
}


//! плавний скролл до нових картинок
function scrollToNextGroup() {
    const { height: cardHeight } = gallery.firstElementChild.getBoundingClientRect();
    window.scrollBy({
        top: cardHeight,
        behavior: "smooth",
    });
}

//! обробник пошуку з логікою на оновлення галлереї в разі зміни слова пошуку
let previousQuery = '';
let previousToggler= false;
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    currentQuery = event.target.searchQuery.value.trim();
    currentToggler = event.target.checked;
    if (currentQuery === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Your search is empty!!!',
        })
        return;
    }
    currentPage = 1;
    if (currentQuery !== previousQuery || previousToggler !== currentToggler) {
        removeCards();
    } 
    previousQuery = currentQuery;
    showLoader();
       
    if (searchToggle.checked) {
        const videos = await searchVideos(currentQuery);
        // Обработка результатов поиска видео
           if (videos.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Sorry',
                text: 'There are no images matching your search query. Please try another query.',
      
            })
        } else {
            renderVideos(videos);
            const text = `Hooray! We found ${videos.length} videos.`
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: text,
                width: '400px',
                showConfirmButton: false,
                timer: 1000
            })
        }
    } else {
        const images = await searchImages(currentQuery);
        // Обработка результатов поиска изображений
        if (images.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Sorry',
                text: 'There are no images matching your search query. Please try another query.',
      
            })
        } else {
            renderImages(images);
            const text = `Hooray! We found ${images.length} images.`
            Swal.fire({
                position: 'top-end',
                icon: 'success',
                title: text,
                width: '400px',
                showConfirmButton: false,
                timer: 1000
            })
        }
    }

    hideLoader();
});




//! скидання галлереї
function removeCards() {
    const photoCards = document.querySelectorAll('.photo-card');
    const videoCards = document.querySelectorAll('.video-card');
    photoCards.forEach(card => {
        gallery.removeChild(card);
    });
    videoCards.forEach(card => {
        gallery.removeChild(card);
    });
    isGalleryLoaded = false;
}
const area = document.querySelector('.area');
function renderBackground() {
        const backgroundList = document.createElement('ul');
        backgroundList.classList.add('circles');
        backgroundList.innerHTML = `
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            `
        area.appendChild(backgroundList);
    };
renderBackground();