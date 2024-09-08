let videoList = [];

async function loadVideoList() {
    try {
        const response = await fetch('data/video_list.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        videoList = await response.json();
        displaySearchableFiles();
    } catch (error) {
        console.error('Error loading video list:', error);
    }
}

function displaySearchableFiles() {
    const vttFilesList = document.getElementById('vtt-files');
    vttFilesList.innerHTML = '';
    videoList.forEach(video => {
        const li = document.createElement('li');
        li.textContent = video.name;
        vttFilesList.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    console.log('The page has loaded successfully!');
    await loadVideoList();

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const wordCloudContainer = document.getElementById('wordCloud');

    searchButton.addEventListener('click', performSearch);

    async function performSearch() {
        const keyword = searchInput.value.trim().toLowerCase();
        if (keyword === '') {
            alert('Please enter a keyword to search.');
            return;
        }

        resultsDiv.innerHTML = 'Searching...';

        try {
            const results = await searchFiles(keyword);
            displayResults(results);
        } catch (error) {
            console.error('Error during search:', error);
            resultsDiv.innerHTML = 'An error occurred during the search.';
        }
    }

    async function searchFiles(keyword) {
        const results = [];
        for (const video of videoList) {
            try {
                const content = await fetchFile(`data/${video.vtt}`);
                const matches = searchContent(content, keyword, video.vtt);
                results.push(...matches);
            } catch (error) {
                console.error(`Error searching file ${video.vtt}:`, error);
            }
        }
        return results;
    }

    async function fetchFile(file) {
        const response = await fetch(file);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.text();
    }

    function searchContent(content, keyword, file) {
        const lines = content.split('\n');
        const results = [];
        let currentTimecode = '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('-->')) {
                currentTimecode = line.trim();
            } else if (line.toLowerCase().includes(keyword)) {
                results.push({
                    file: file.split('/').pop(),
                    content: line.trim(),
                    lineNumber: i + 1,
                    timecode: currentTimecode
                });
            }
        }
        return results;
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            const groupedResults = groupResultsByFile(results);
            resultsDiv.innerHTML = Object.entries(groupedResults).map(([file, fileResults]) => {
                const videoInfo = videoList.find(video => video.vtt === file);
                const videoName = videoInfo ? videoInfo.name : 'Unknown Video';
                return `
                    <div class="file-results">
                        <h3>${videoName}</h3>
                        ${fileResults.map(result => `
                            <p>
                                <strong>Time:</strong> 
                                <a href="${getYoutubeLink(file, result.timecode)}" target="_blank">
                                    ${result.timecode}
                                </a><br>
                                ${highlightKeyword(escapeHtml(result.content), searchInput.value.trim())}
                            </p>
                        `).join('')}
                    </div>
                `;
            }).join('<hr>');
        }
    }

    function getYoutubeLink(filename, timecode) {
        const videoInfo = videoList.find(video => video.vtt === filename);
        if (!videoInfo) {
            console.error(`Video info not found for ${filename}`);
            return '#';
        }
        const seconds = convertTimecodeToSeconds(timecode);
        return `${videoInfo.url}&t=${seconds}`;
    }

    function convertTimecodeToSeconds(timecode) {
        const [start] = timecode.split(' --> ');
        const [hours, minutes, seconds] = start.split(':').map(Number);
        return hours * 3600 + minutes * 60 + Math.floor(seconds);
    }

    // Remove the extractVideoId function as it's no longer needed
    // function extractVideoId(filename) {
    //     return filename.split('.')[0];
    // }

    function groupResultsByFile(results) {
        return results.reduce((acc, result) => {
            if (!acc[result.file]) {
                acc[result.file] = [];
            }
            acc[result.file].push(result);
            return acc;
        }, {});
    }

    function highlightKeyword(text, keyword) {
        if (!keyword) return text;
        const regex = new RegExp(keyword, 'gi');
        return text.replace(regex, match => `<mark>${match}</mark>`);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function searchVideos() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        // Add the search term to the searchQueries array
        if (searchTerm.trim() !== '') {
            searchQueries.push(searchTerm.trim());
            updateWordCloud();
        }
    }

    function updateWordCloud() {
        const wordCounts = {};
        searchQueries.forEach(query => {
            query.split(' ').forEach(word => {
                if (word.length > 2) {
                    wordCounts[word] = (wordCounts[word] || 0) + 1;
                }
            });
        });

        wordCloudContainer.innerHTML = '';

        Object.entries(wordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .forEach(([word, count]) => {
                const span = document.createElement('span');
                span.textContent = word;
                span.style.fontSize = `${Math.max(12, Math.min(36, count * 5))}px`;
                span.style.margin = '5px';
                wordCloudContainer.appendChild(span);
            });
    }
});