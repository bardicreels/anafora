document.addEventListener('DOMContentLoaded', function() {
    console.log('The page has loaded successfully!');

    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');

    const files = ['file1.csv', 'file2.csv', 'file1.vtt', 'file2.vtt']; // Add your file names here

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
        for (const file of files) {
            const content = await fetchFile(file);
            const matches = searchContent(content, keyword, file);
            results.push(...matches);
        }
        return results;
    }

    async function fetchFile(file) {
        const response = await fetch(file);
        return await response.text();
    }

    function searchContent(content, keyword, file) {
        const lines = content.split('\n');
        return lines
            .map((line, index) => ({ line, index }))
            .filter(({ line }) => line.toLowerCase().includes(keyword))
            .map(({ line, index }) => ({
                file,
                content: line.trim(),
                lineNumber: index + 1
            }));
    }

    function displayResults(results) {
        if (results.length === 0) {
            resultsDiv.innerHTML = 'No results found.';
        } else {
            resultsDiv.innerHTML = results.map(result => `
                <div>
                    <strong>${result.file}:</strong> Line ${result.lineNumber}: ${escapeHtml(result.content)}
                </div>
            `).join('');
        }
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});