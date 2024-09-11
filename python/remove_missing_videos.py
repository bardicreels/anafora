"""
This script generates an HTML file (videos.html) containing a list of videos
based on the contents of empty_vtt.csv. It creates a checkbox and a link
for each video, using the filename as the title and the YouTube URL as the link.

The script does the following:
1. Defines file paths for input and output
2. Checks if the input file (empty_vtt.csv) exists
3. Generates the HTML structure
4. Reads the CSV file and creates list items for each valid entry
5. Writes the generated HTML content to videos.html
"""

import csv
import os

# Define file paths
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
empty_vtt_path = os.path.join(project_root, 'data', 'empty_vtt.csv')
videos_html_path = os.path.join(project_root, 'data', 'videos.html')

# Check if the empty_vtt.csv file exists
if not os.path.exists(empty_vtt_path):
    print(f"Error: The file {empty_vtt_path} does not exist.")
    print(f"Current working directory: {os.getcwd()}")
    print("Please make sure the 'empty_vtt.csv' file exists in the data directory.")
    exit(1)

# Generate HTML content - start with the HTML structure
html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video List</title>
</head>
<body>
    <ul id="videoList">
"""

# Read empty_vtt.csv and generate list items
with open(empty_vtt_path, 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        filename = row['Filename']
        url = row['YouTube URL']
        if url.startswith('http'):  # Ensure we have a valid URL
            # Create a title from the filename by removing the extension and replacing underscores with spaces
            title = filename.split('.')[0].replace('_', ' ')
            # Add a list item with a checkbox and a link to the video
            html_content += f'        <li><input type="checkbox"> <a href="{url}" target="_blank">{title}</a></li>\n'

# Close the HTML structure
html_content += """    </ul>
</body>
</html>
"""

# Write the generated HTML content to the output file
with open(videos_html_path, 'w') as f:
    f.write(html_content)

print(f"videos.html has been generated with entries from empty_vtt.csv")