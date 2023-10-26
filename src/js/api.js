async function searchVideos(query) {
    try {
        const response = await axios.get(`https://pixabay.com/api/videos/?key=${apiKey}&q=${query}&safesearch=false&page=${currentPage}&per_page=${perPage}`);
       
        const data = response.data;
        return data.hits;
    } catch (error) {
        console.error('Error fetching data:', error);
        redirectTo404Page();
        return [];
    }
}
function renderVideos(videos) {
    videos.forEach(video => {
        const card = document.createElement('div');
        card.classList.add('video-card');
        card.innerHTML = `
           <iframe id="vimeo-player" src="${video.videos.tiny.url}" width="640" height="360" frameborder="0"
    allowfullscreen allow="encrypted-media" autoplay="false"></iframe>
            <div class="info">
                <p class="info-item"><b>Likes</b></br> ${image.likes}</p>
                <p class="info-item"><b>Views</b></br> ${image.views}</p>
                <p class="info-item"><b>Comments</b></br> ${image.comments}</p>
                <p class="info-item"><b>Downloads</b></br> ${image.downloads}</p>
            </div>
        `;
        gallery.appendChild(card);
    });
    isGalleryLoaded = true;
}

const searchTypeRadioButtons = document.querySelectorAll('input[name="search-type"]');


function performSearch() {
  const searchType = document.querySelector('input[name="search-type"]:checked').value;
  const query = searchQueryInput.value;

  // Perform the search based on the selected type
  if (searchType === 'images') {
    // Fetch images based on the query using the image API endpoint
    fetchImages(query);
  } else if (searchType === 'videos') {
    // Fetch videos based on the query using the video API endpoint
    fetchVideos(query);
  }
}