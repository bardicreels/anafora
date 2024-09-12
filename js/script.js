let vttData = {};

async function loadVTTData() {
    try {
        const response = await fetch('data/vtt_content.json');
        vttData = await response.json();
        console.log('VTT data loaded successfully');
    } catch (error) {
        console.error('Error loading VTT data:', error);
    }
}

function searchVTTContent(keyword) {
    const results = [];
    for (const [filename, fileData] of Object.entries(vttData)) {
        const matches = fileData.content.filter(item => 
            item.text.toLowerCase().includes(keyword.toLowerCase())
        );
        if (matches.length > 0) {
            results.push({ 
                filename, 
                name: fileData.name, 
                url: fileData.url, 
                matches 
            });
        }
    }
    return results;
}

function getYoutubeLink(filename, timestampz) {
    const videoId = filename.split('-').pop().split('.')[0];
    const [minutes, seconds] = timestamp.split(':');
    const totalSeconds = parseInt(minutes) * 60 + parseInt(seconds);
    return `https://www.youtube.com/watch?v=${videoId}&t=${totalSeconds}s`;
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    if (!resultsDiv) {
        console.error('Results div not found');
        return;
    }
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No results found.</p>';
    } else {
        const resultHtml = results.map((result, index) => `
            <div class="video-result" style="animation: fadeIn 0.5s ease-out ${index * 0.1}s both;">
                <h3>${result.name}</h3>
                <ul>
                    ${result.matches.map(match => `
                        <li class="result-item">
                            <a href="${result.url}&t=${getTimestampSeconds(match.timestamp)}" target="_blank" class="timestamp">
                                <strong>${getStartTimecode(match.timestamp)}</strong>
                            </a>
                            <span class="result-text">${match.text}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
        resultsDiv.innerHTML = `<h2>Search Results:</h2>${resultHtml}`;
    }
}

function getTimestampSeconds(timestamp) {
    const [start] = timestamp.split(' --> ');
    const [minutes, seconds] = start.split(':');
    return parseInt(minutes) * 60 + parseInt(seconds);
}

function getStartTimecode(timestamp) {
    return timestamp.split(' --> ')[0];
}

function initializeSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    if (!searchForm || !searchInput) {
        console.error('Search form or input not found');
        return;
    }

    searchInput.placeholder = "Search video History";

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
            const results = searchVTTContent(keyword);
            displayResults(results);
        }
    });
}

function populateVTTList() {
    const vttList = document.getElementById('vtt-files');
    if (!vttList) {
        console.error('VTT list element not found');
        return;
    }

    const vttItems = Object.values(vttData).map(fileData => `
        <li>
            <a href="${fileData.url}" target="_blank">
                ${fileData.name}
            </a>
        </li>
    `);
    vttList.innerHTML = vttItems.join('');
}

async function initialize() {
    await loadVTTData();
    initializeSearch();
    populateVTTList();
}

// Run the initialize function when the DOM is fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function shakeElement(element) {
    const originalPosition = element.style.transform;
    const shakeIntensity = 0.3; // Slightly increased for visibility
    let beatCount = 0;
    const beatsPerCycle = 2;
    const cycleCount = 3; // Number of heartbeat cycles

    function heartbeatShake() {
        if (beatCount >= beatsPerCycle * cycleCount) {
            element.style.transform = originalPosition;
            return;
        }

        const currentBeat = beatCount % beatsPerCycle;
        const xShift = (Math.random() - 0.5) * shakeIntensity;
        const yShift = (Math.random() - 0.5) * shakeIntensity;

        if (currentBeat === 0) {
            // First beat: quick, strong shake
            element.style.transform = `translate(${xShift * 1.5}px, ${yShift * 1.5}px)`;
            setTimeout(() => {
                element.style.transform = originalPosition;
                setTimeout(heartbeatShake, 100); // Short pause before second beat
            }, 50);
        } else {
            // Second beat: slightly weaker shake
            element.style.transform = `translate(${xShift}px, ${yShift}px)`;
            setTimeout(() => {
                element.style.transform = originalPosition;
                setTimeout(heartbeatShake, 600); // Longer pause before next cycle
            }, 50);
        }

        beatCount++;
    }

    heartbeatShake();
}

// Get the modal
var modal = document.getElementById("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementById("myImg");
var modalImg = document.getElementById("img01");
var captionText = document.getElementById("caption");
img.onclick = function(){
  modal.style.display = "block";
  modalImg.src = this.src;
  captionText.innerHTML = this.alt;
}

// Close the modal when clicking anywhere
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Get all images with class 'modal-image'
var images = document.getElementsByClassName("modal-image");

// Set up click event for all modal images
for (var i = 0; i < images.length; i++) {
    images[i].onclick = function(){
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    }
}

// Add this after the click event setup
for (var i = 0; i < images.length; i++) {
    images[i].onmouseover = function() {
        this.style.opacity = "0.7";
    }
    images[i].onmouseout = function() {
        this.style.opacity = "1";
    }
}

// Get all images within the claims section
var claimImages = document.querySelectorAll('#claims-section img');

// Set up click event for all claim images
claimImages.forEach(function(img) {
    img.onclick = function(){
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    }
});