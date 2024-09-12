"""
This script processes a CSV file of video entries and a JSON file of VTT content.
It performs the following tasks:
1. Removes duplicate entries from the CSV file
2. Checks which videos have corresponding VTT files
3. Updates the CSV file with checkmarks for processed videos
4. Displays a progress bar showing the completion status

Key features:
- Extracts YouTube video IDs from URLs
- Cleans video titles
- Handles file reading and writing operations
- Provides detailed console output for tracking progress and errors
"""

import csv
import json
import re
import os

def extract_youtube_id(text):
    match = re.search(r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})', text)
    return match.group(1) if match else None

def clean_title(title):
    cleaned = re.sub(r'^(-\[x\]|-\[ \]|\[x\]|\[ \])\s*', '', title)
    cleaned = re.sub(r'\[x\]|\[ \]', '', cleaned)
    cleaned = re.sub(r'^-*\s*', '', cleaned)
    return cleaned.strip()

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Go up one level to the project root
project_root = os.path.dirname(script_dir)

# Define paths relative to the project root
vtt_content_path = os.path.join(project_root, 'data', 'vtt_content.json')
total_video_list_path = os.path.join(project_root, 'data', 'total_video_list.csv')

# Check if files exist
if not os.path.exists(vtt_content_path):
    print(f"Error: {vtt_content_path} not found")
    exit(1)
if not os.path.exists(total_video_list_path):
    print(f"Error: {total_video_list_path} not found")
    exit(1)

# Read the CSV file and remove duplicates
unique_entries = {}
duplicate_count = 0
try:
    with open(total_video_list_path, 'r', encoding='utf-8') as csv_file:
        csv_reader = csv.reader(csv_file)
        for row in csv_reader:
            if len(row) >= 2:
                title, url = clean_title(row[0]), row[1]
                youtube_id = extract_youtube_id(url)
                if youtube_id:
                    if youtube_id not in unique_entries:
                        unique_entries[youtube_id] = [title, url]
                    else:
                        duplicate_count += 1
                else:
                    unique_entries[url] = [title, url]
            else:
                unique_entries[row[0]] = [clean_title(row[0])]

    print(f"Removed {duplicate_count} duplicate entries from CSV.")
except Exception as e:
    print(f"Error reading CSV file: {str(e)}")
    exit(1)

# Read the vtt_content.json file
try:
    with open(vtt_content_path, 'r') as json_file:
        vtt_content = json.load(json_file)
    print(f"Successfully loaded vtt_content.json. It contains {len(vtt_content)} entries.")
except json.JSONDecodeError:
    print("Error: vtt_content.json is not a valid JSON file")
    exit(1)

# Get the list of video IDs from vtt_content.json
vtt_video_ids = set()
for key, value in vtt_content.items():
    if isinstance(value, dict) and 'url' in value:
        youtube_id = extract_youtube_id(value['url'])
        if youtube_id:
            vtt_video_ids.add(youtube_id)
print(f"Extracted {len(vtt_video_ids)} video IDs from vtt_content.json")

# Process the unique entries
unchecked_rows = []
checked_rows = []
matches_found = 0
for row in unique_entries.values():
    if len(row) >= 2:
        title, url = row[0], row[1]
        youtube_id = extract_youtube_id(url)
        if youtube_id and youtube_id in vtt_video_ids:
            checked_rows.append([f'-[x] {title}', url])
            matches_found += 1
        else:
            unchecked_rows.append([f'-[ ] {title}', url])
    else:
        unchecked_rows.append([f'-[ ] {row[0]}'])

# Combine unchecked and checked rows
updated_rows = unchecked_rows + checked_rows

total_entries = len(updated_rows)
completion_percentage = (matches_found / total_entries) * 100 if total_entries > 0 else 0

print(f"Processed {total_entries} unique rows from CSV. Found {matches_found} matches.")

# Create a progress bar
bar_length = 50
filled_length = int(bar_length * completion_percentage / 100)
bar = '█' * filled_length + '-' * (bar_length - filled_length)

print(f"Progress: |{bar}| {completion_percentage:.2f}% Complete")

# Write the updated content back to total_video_list.csv
try:
    with open(total_video_list_path, 'w', newline='', encoding='utf-8') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerows(updated_rows)
    print(f"Successfully wrote updated content back to {total_video_list_path}")
except Exception as e:
    print(f"Error writing to CSV file: {str(e)}")
    exit(1)

print("Script completed. Check the console output for any issues.")
