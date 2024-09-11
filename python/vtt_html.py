"""
This script reads a CSV file containing video information and generates an HTML file
with a list of videos. Each video entry includes a checkbox and a link to the video.

Key features:
1. Cleans video titles by removing checkboxes and extra whitespace
2. Generates an HTML unordered list with video entries
3. Counts the number of entries generated
4. Writes the generated HTML to an output file
"""

import csv
import os
import re

def clean_title(title):
    # Remove "- [x]" and any leading/trailing whitespace
    return re.sub(r'^-\s*\[x\]\s*', '', title).strip()

def read_csv_and_generate_html(csv_file, output_file):
    html_content = "<ul id=\"videoList\">\n"
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) == 2:
                title, url = row
                title = clean_title(title)
                html_content += f"  <li><input type=\"checkbox\"> <a href=\"{url}\" target=\"_blank\">{title}</a></li>\n"
    
    html_content += "</ul>"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    return html_content.count('<li>')  # Count the number of entries

def main():
    project_root = "/home/user/Desktop/projects/askthelady"
    csv_file = os.path.join(project_root, "data", "total_video_list.csv")
    output_file = os.path.join(project_root, "data", "videos.html")
    
    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found: {csv_file}")
        return

    entry_count = read_csv_and_generate_html(csv_file, output_file)
    print(f"Generated {entry_count} video entries in {output_file}")

if __name__ == "__main__":
    main()