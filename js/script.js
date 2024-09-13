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
            <label>
                <input type="checkbox" class="vtt-checkbox" data-filename="${fileData.name}" 
                    ${getCookie(fileData.name) === 'true' ? 'checked' : ''}>
                <a href="${fileData.url}" target="_blank">
                    ${fileData.name}
                </a>
            </label>
        </li>
    `);
    vttList.innerHTML = vttItems.join('');

    // Add event listeners to checkboxes
    document.querySelectorAll('.vtt-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            setCookie(this.dataset.filename, this.checked, 365);
        });
    });
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
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

// Get the images and modals
var img1 = document.getElementById("myImg1");
var img2 = document.getElementById("myImg2");
var modal1 = document.getElementById("myModal1");
var modal2 = document.getElementById("myModal2");
var modalImg1 = document.getElementById("img01");
var modalImg2 = document.getElementById("img02");
var captionText1 = document.getElementById("caption1");
var captionText2 = document.getElementById("caption2");

// Function to open modal
function openModal(img, modal, modalImg, captionText) {
    modal.style.display = "block";
    modalImg.src = img.src;
    captionText.innerHTML = img.alt;
    captionText.className = "modal-caption";
    
    // Store the original image source
    modalImg.dataset.originalSrc = img.src;
}

// Set up click events for images
img1.onclick = function() {
    openModal(this, modal1, modalImg1, captionText1);
}
img2.onclick = function() {
    openModal(this, modal2, modalImg2, captionText2);
}

// Function to extract URL from caption
function extractUrl(caption) {
    const match = caption.match(/<a href="([^"]+)">/);
    return match ? match[1] : null;
}

// Handle clicks on modal images
modalImg1.onclick = function(event) {
    event.stopPropagation();
    const url = extractUrl(captionText1.innerHTML);
    if (url) {
        window.open(url, '_blank');
    } else {
        console.log("No URL found in caption");
    }
}

modalImg2.onclick = function(event) {
    event.stopPropagation();
    const url = extractUrl(captionText2.innerHTML);
    if (url) {
        window.open(url, '_blank');
    } else {
        console.log("No URL found in caption");
    }
}

// Get the <span> elements that close the modals
var spans = document.getElementsByClassName("close");

// Set up click events for close buttons
for (var i = 0; i < spans.length; i++) {
    spans[i].onclick = function(event) {
        event.stopPropagation();
        this.parentElement.style.display = "none";
    }
}

// Close the modal when clicking outside of it
window.onclick = function(event) {
    if (event.target == modal1) {
        modal1.style.display = "none";
    }
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
}