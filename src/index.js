import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '39198737-e441a494d9c878a4c9c462200';
const perPage = 40;
let currentPage = 1;
let currentQuery = '';
let isGalleryLoaded = false;

const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.style.display = 'none';
// Initialize SimpleLightbox
const lightbox = new SimpleLightbox('.gallery a',{
    close: false,
    enableKeyboard: true,
});

// Function to make an API request
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

// Function to render image cards
function renderImages(images) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = ''; 
    images.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('photo-card');
        card.innerHTML = `
            <a href="${image.largeImageURL}" data-lightbox="image">
                <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
            </a>
            <div class="info">
                <p class="info-item"><b>Likes:</b><br/> ${image.likes}</p>
                <p class="info-item"><b>Views:</b><br/> ${image.views}</p>
                <p class="info-item"><b>Comments:</b><br/> ${image.comments}</p>
                <p class="info-item"><b>Downloads:</b><br/> ${image.downloads}</p>
            </div>
        `;
        gallery.appendChild(card);
    });
    lightbox.refresh(); 
    isGalleryLoaded = true;
    loadMoreButton.style.display = 'block';
}



// Function to load more images
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

// Function to scroll to the next group of images
function scrollToNextGroup() {
    const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
    window.scrollBy({
        top: cardHeight * 2,
        behavior: "smooth",
    });
}

// Event listener for the search form
const searchForm = document.querySelector('#search-form');
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    currentPage = 1;
    currentQuery = event.target.searchQuery.value.trim();
    const images = await searchImages(currentQuery);
    if (images.length === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    } else {
        renderImages(images);
        Notiflix.Notify.success(`Hooray! We found ${images.length} images.`);
    }
});

// Event listener for the "Load more" button
loadMoreButton.addEventListener('click', loadMoreImages);


