"""
This script downloads subtitles for YouTube videos listed in a CSV file.
It uses yt-dlp to fetch VTT subtitles, processes them, and stores the content in a JSON file.
The script also includes functions for resource management, error handling, and progress tracking.

Key features:
1. Loads existing VTT content and avoids re-downloading
2. Extracts video IDs from YouTube URLs
3. Sanitizes filenames and manages file operations
4. Implements resource checking to prevent overload
5. Provides progress tracking with a progress bar
6. Handles errors and interruptions gracefully
"""

import yt_dlp
import os
import csv
import time
import random
import psutil
import json
import re
from tqdm import tqdm
from urllib.parse import urlparse, parse_qs

print("Starting script...")

# Get the directory of the script and project root
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Define paths
vtt_dir = os.path.join(project_root, 'vtt')
data_dir = os.path.join(project_root, 'data')
csv_path = os.path.join(data_dir, 'total_video_list.csv')
vtt_content_path = os.path.join(data_dir, 'vtt_content.json')

print(f"VTT directory: {vtt_dir}")
print(f"Data directory: {data_dir}")
print(f"CSV path: {csv_path}")
print(f"VTT content path: {vtt_content_path}")

# Create the vtt directory if it doesn't exist
if not os.path.exists(vtt_dir):
    os.makedirs(vtt_dir)
    print(f"Created VTT directory: {vtt_dir}")

# Function to load existing vtt_content
def load_vtt_content():
    if os.path.exists(vtt_content_path):
        with open(vtt_content_path, 'r') as f:
            return json.load(f)
    return {}

# Function to save vtt_content
def save_vtt_content(vtt_content):
    with open(vtt_content_path, 'w', encoding='utf-8') as f:
        json.dump(vtt_content, f, ensure_ascii=False, indent=2)

# Function to sanitize filename
def sanitize_filename(filename):
    filename = filename.replace("'s", "s").replace("'", "")
    return "".join([c for c in filename if c.isalpha() or c.isdigit() or c in ' -_.']).rstrip()

# Function to check resource usage
def check_resources():
    cpu_usage = psutil.cpu_percent(interval=1)
    ram_usage = psutil.virtual_memory().percent
    print(f"Current CPU usage: {cpu_usage}%, RAM usage: {ram_usage}%")
    return cpu_usage <= 50 and ram_usage <= 90
    # Improved function to parse VTT content
def parse_vtt_content(content):
    lines = content.split('\n')
    parsed_content = []
    current_entry = {}
    timestamp_pattern = re.compile(r'(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})')

    for line in lines:
        line = line.strip()
        if not line:
            if current_entry:
                parsed_content.append(current_entry)
                current_entry = {}
        elif timestamp_pattern.match(line):
            if current_entry:
                parsed_content.append(current_entry)
            current_entry = {"timestamp": line, "text": ""}
        elif current_entry:
            if current_entry["text"]:
                current_entry["text"] += " " + line
            else:
                current_entry["text"] = line

    if current_entry:
        parsed_content.append(current_entry)

    return parsed_content

# Function to extract video ID from YouTube URL
def extract_video_id(url):
    parsed_url = urlparse(url)
    if parsed_url.hostname == 'youtu.be':
        return parsed_url.path[1:]
    if parsed_url.hostname in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            return parse_qs(parsed_url.query)['v'][0]
    return None

# youtube-dl configuration
ydl_opts = {
    'skip_download': True,
    'writeautomaticsub': True,
    'subtitlesformat': 'vtt',
    'outtmpl': os.path.join(vtt_dir, '%(id)s.%(ext)s'),
    'socket_timeout': 30,
    'retries': 3,
}

# New function to correct existing JSON content
def correct_vtt_content():
    print("Starting VTT content correction...")
    vtt_content = load_vtt_content()
    corrected_count = 0

    for filename, entry in tqdm(vtt_content.items(), desc="Correcting entries"):
        vtt_file_path = os.path.join(vtt_dir, filename)
        if os.path.exists(vtt_file_path):
            with open(vtt_file_path, 'r', encoding='utf-8') as vtt_file:
                vtt_content_raw = vtt_file.read()
            
            corrected_content = parse_vtt_content(vtt_content_raw)
            
            if corrected_content != entry['content']:
                entry['content'] = corrected_content
                corrected_count += 1

    print(f"Corrected {corrected_count} entries.")
    if corrected_count > 0:
        save_vtt_content(vtt_content)
        print("Saved corrected VTT content.")
    else:
        print("No corrections were necessary.")

# Main execution
if __name__ == "__main__":
    print("Starting script...")

    # Add this line to run the correction function before processing new videos
    correct_vtt_content()

    print("Loading existing VTT content...")
    vtt_content = load_vtt_content()
    print(f"Loaded {len(vtt_content)} entries from vtt_content")

    print("Extracting existing YouTube IDs...")
    existing_ids = set(entry['url'].split('v=')[-1] for entry in vtt_content.values())
    print(f"Found {len(existing_ids)} existing YouTube IDs")

    print(f"Reading video information from CSV: {csv_path}")
    video_info = {}
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)  # Skip header row if it exists
        for row in reader:
            video_name = row[0].strip().lstrip('-[ ] ')
            video_url = row[1].strip()
            video_id = extract_video_id(video_url)
            if video_id:
                video_info[video_id] = video_name
            else:
                print(f"Warning: Could not extract video ID from {video_url}")
    print(f"Read {len(video_info)} entries from CSV")

    print("Filtering out already processed videos...")
    new_videos = {id: name for id, name in video_info.items() if id not in existing_ids}
    total_new_videos = len(new_videos)
    print(f"Found {total_new_videos} new videos to process")

    progress_bar = tqdm(total=total_new_videos, desc="Total progress", position=0)
    progress_bar.update(0)  # Initialize the bar

    for video_id, video_name in new_videos.items():
        print(f"\nProcessing video: {video_name} ({video_id})")
        while not check_resources():
            print("Resource usage high, waiting...")
            time.sleep(5)
        
        url = f'https://www.youtube.com/watch?v={video_id}'
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                print(f"Downloading subtitles for {video_name}...")
                info = ydl.extract_info(url, download=True)
                if info is None:
                    raise Exception("Failed to extract video information")
            
            temp_filename = os.path.join(vtt_dir, f'{video_id}.en.vtt')
            new_filename = f'{sanitize_filename(video_name)}-{video_id}.vtt'
            new_filepath = os.path.join(vtt_dir, new_filename)
            if os.path.exists(temp_filename):
                print(f"Renaming {temp_filename} to {new_filepath}")
                os.rename(temp_filename, new_filepath)
                
                print("Reading and parsing VTT content...")
                with open(new_filepath, 'r', encoding='utf-8') as vtt_file:
                    vtt_content[new_filename] = {
                        "name": sanitize_filename(video_name),
                        "url": url,
                        "content": parse_vtt_content(vtt_file.read())
                    }
                
                print("Saving updated VTT content...")
                save_vtt_content(vtt_content)
                
                # Update progress bar after successful download
                progress_bar.update(1)
                progress_bar.set_postfix_str(f"Last: {video_name}")
            else:
                print(f"Warning: Expected file {temp_filename} not found.")
                
            pbar.update(1)
            pbar.set_postfix_str(f"Downloaded: {video_name}")
        except KeyboardInterrupt:
            print("\nScript interrupted by user. Saving progress...")
            save_vtt_content(vtt_content)
            break
        except Exception as e:
            print(f"Error processing video {video_name} ({video_id})")
            
        delay = random.uniform(1, 10)  # Increased delay range to 1-10 seconds
        print(f"Waiting for {delay:.2f} seconds before next video...")
        time.sleep(delay)

    progress_bar.close()
    print("\nSubtitle download process completed.")
    print(f"VTT content saved to {vtt_content_path}")