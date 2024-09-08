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
                if (vttContent.toLowerCase().includes(keyword)) {
                    results.push(video);
                }
            } catch (error) {
                console.error(`Error reading VTT file ${vttPath}:`, error);
            }
        }
        return results;
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            const resultList = results.map(video => `<li>${video.name}</li>`).join('');
            resultsDiv.innerHTML = `<h3>Search Results:</h3><ul>${resultList}</ul>`;
        }
    }
});
