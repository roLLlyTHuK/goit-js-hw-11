import axios from 'axios';
// import Notiflix from 'notiflix';
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
const gallery = document.querySelector('.gallery');
// const loadMoreButton = document.querySelector('.load-more');
// loadMoreButton.style.display = 'none';
const guard = document.querySelector('.js-guard');
//!observer
const options = {
  root: null,
  rootMargin: '300px',
 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
        
      loadMoreImages();
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
    // loadMoreButton.style.display = 'block';
}


//! додаткове завантаження картинок
async function loadMoreImages() {
  if (isGalleryLoaded) {
    currentPage++;
    const images = await searchImages(currentQuery);
    if (images.length === 0) {
      // Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: "We're sorry, but you've reached the end of search results.",
      });
      observer.unobserve(guard); // Отключаем наблюдение
    } else {
      renderImages(images);
      scrollToNextGroup();
    }
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
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    currentQuery = event.target.searchQuery.value.trim();
    if (currentQuery === '') {
        // Notiflix.Notify.warning('Please enter a search query.');
        Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Your search is empty!!!',
  })
        return;
    }
    currentPage = 1;
    if (currentQuery !== previousQuery) {
        removePhotoCards();
    } 
    previousQuery = currentQuery;
    showLoader();
    const images = await searchImages(currentQuery)
    hideLoader();
    if (images.length === 0) {
        // Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
        Swal.fire({
  icon: 'error',
  title: 'Oops...',
  text: 'Sorry, there are no images matching your search query. Please try again.',
  
})
    } else {
        renderImages(images);
        // Notiflix.Notify.success(`Hooray! We found ${images.length} images.`);
        const text = `Hooray! We found ${images.length} images.`
        Swal.fire({
  position: 'center',
  icon: 'success',
            title: text,
  width: '400px',
  showConfirmButton: false,
  timer: 1000
})
    }
});

//! завантаження нових вото
// loadMoreButton.addEventListener('click', async () => {
//     if (isGalleryLoaded) {
//         const images = await searchImages(currentQuery);
//         if (images.length === 0) {
//             loadMoreButton.style.display = 'none';
//             Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
//         } else {
//             loadMoreImages(images);
//             scrollToNextGroup();
//         }
//     }
// });

//! скидання галлереї та кнопки loadMoreButton
function removePhotoCards() {
    const photoCards = document.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
        gallery.removeChild(card);
    });
    isGalleryLoaded = false;
    // loadMoreButton.style.display = 'none';
}

