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

function getYoutubeLink(filename, timestamp) {
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
        resultsDiv.innerHTML = 'No results found.';
    } else {
        const resultHtml = results.map(result => `
            <div class="video-result">
                <h3>${result.name}</h3>
                <ul>
                    ${result.matches.map(match => `
                        <li>
                            <a href="${result.url}&t=${getTimestampSeconds(match.timestamp)}" target="_blank">
                                <strong>${getStartTimecode(match.timestamp)}</strong>
                            </a>: ${match.text}
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

// Remove or comment out the shakeElementHorizontally function if not needed
