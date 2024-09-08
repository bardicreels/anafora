let videoList = [];

async function loadVideoList() {
    try {
        const response = await fetch('data/video_list.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        videoList = await response.json();
    } catch (error) {
        console.error('Error loading video list:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('The page has loaded successfully!');
    await loadVideoList();

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    async function performSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (keyword === '') {
            alert('Please enter a keyword to search.');
            return;
        }

        resultsDiv.innerHTML = 'Searching...';

        try {
            const results = await searchVTTFiles(keyword);
            displayResults(results);
        } catch (error) {
            console.error('Error during search:', error);
            resultsDiv.innerHTML = 'An error occurred during the search.';
        }
    }

    async function searchVTTFiles(keyword) {
        const results = [];
        for (const video of videoList) {
            const vttPath = `vtt/${video.vtt}`;
            try {
                const response = await fetch(vttPath);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const vttContent = await response.text();
                const matches = searchVTTContent(vttContent, keyword);
                if (matches.length > 0) {
                    results.push({ video, matches });
                }
            } catch (error) {
                console.error(`Error reading VTT file ${vttPath}:`, error);
            }
        }
        return results;
    }

    function searchVTTContent(content, keyword) {
        const lines = content.split('\n');
        const matches = [];
        let currentTimestamp = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.includes('-->')) {
                const [start] = line.split(' --> ');
                if (isValidTimestamp(start)) {
                    currentTimestamp = start;
                }
            } else if (line.toLowerCase().includes(keyword)) {
                matches.push({ timestamp: currentTimestamp, text: line });
            }
        }
        return matches;
    }

    function isValidTimestamp(timestamp) {
        // This regex checks for the format HH:MM:SS.mmm or HH:MM:SS
        return /^\d{2}:\d{2}:\d{2}(\.\d{3})?$/.test(timestamp);
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            const resultHtml = results.map(result => `
                <div class="video-result">
                    <h3>${result.video.name}</h3>
                    <ul>
                        ${result.matches.map(match => `
                            <li>
                                <a href="${getYoutubeLink(result.video.url, match.timestamp)}" target="_blank">
                                    <strong>${match.timestamp}</strong>
                                </a>: ${match.text}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `).join('');
            resultsDiv.innerHTML = `<h2>Search Results:</h2>${resultHtml}`;
        }
    }

    function getYoutubeLink(videoUrl, timestamp) {
        try {
            const url = new URL(videoUrl);
            const seconds = convertTimestampToSeconds(timestamp);
            url.searchParams.set('t', seconds);
            return url.toString();
        } catch (error) {
            console.error('Invalid video URL:', videoUrl);
            return '#'; // Return a placeholder link if the URL is invalid
        }
    }

    function convertTimestampToSeconds(timestamp) {
        const [time, milliseconds] = timestamp.split('.');
        const [hours, minutes, seconds] = time.split(':').map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (milliseconds) {
            totalSeconds += Number(milliseconds) / 1000;
        }
        return Math.floor(totalSeconds); // YouTube uses integer seconds
    }
});
