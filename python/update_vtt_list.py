import json
import os
import re

# This script processes VTT subtitle files and creates a JSON file with their contents.
# It does the following:
# 1. Reads VTT files from the '../vtt' directory.
# 2. Parses the content of each VTT file.
# 3. Creates a name field based on the filename, removing certain parts.
# 4. Organizes the content properly for searching.
# 5. Writes the processed data to a JSON file in the '../data' directory for easy access and searching.

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

def read_vtt_file(vtt_filename):
    vtt_path = os.path.join(project_root, 'vtt', vtt_filename)
    try:
        with open(vtt_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        return f"VTT file {vtt_filename} not found"

def create_name_from_filename(filename):
    # Remove the file extension
    name = os.path.splitext(filename)[0]
    
    # Remove the YouTube video ID, handling both -! and regular cases
    name = re.sub(r'-!.*$', '', name)  # Remove everything after -! if it exists
    name = re.sub(r'-[^-]+$', '', name)  # Remove the last part after a hyphen if no -!
    
    # Replace underscores with spaces
    name = name.replace('_', ' ')
    
    return name.strip()  # Remove any trailing whitespace

def parse_vtt_content(content):
    # Remove WebVTT header
    content = re.sub(r'^WEBVTT\n\n', '', content, flags=re.MULTILINE)
    
    # Split content into blocks
    blocks = re.split(r'\n\n', content)
    
    parsed_content = []
    for block in blocks:
        lines = block.split('\n')
        if len(lines) >= 2:
            timestamp = lines[0]
            text = ' '.join(lines[1:])
            parsed_content.append({
                "timestamp": timestamp,
                "text": text
            })
    
    return parsed_content

def extract_video_id_from_filename(filename):
    # Remove the .vtt extension
    name_without_extension = os.path.splitext(filename)[0]
    
    # Check for the -! pattern
    if '-!' in name_without_extension:
        # Split by -! and return everything after it
        return name_without_extension.split('-!')[-1]
    
    # Use regex to find the video ID at the end of the filename
    match = re.search(r'-([^-]+)$', name_without_extension)
    if match:
        return match.group(1)  # Return the entire match after the last hyphen
    else:
        # Fallback: if there's no match, return the whole filename without extension
        return name_without_extension

# Get list of VTT files
vtt_dir = os.path.join(project_root, 'vtt')
vtt_files = [f for f in os.listdir(vtt_dir) if f.endswith('.vtt')]

# Process each VTT file
vtt_data = {}
for vtt_filename in vtt_files:
    content = read_vtt_file(vtt_filename)
    parsed_content = parse_vtt_content(content)
    
    video_id = extract_video_id_from_filename(vtt_filename)
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    vtt_data[vtt_filename] = {
        "name": create_name_from_filename(vtt_filename),
        "url": url,
        "content": parsed_content
    }

# Write the data to a JSON file
output_path = os.path.join(project_root, 'data', 'vtt_content.json')
with open(output_path, 'w', encoding='utf-8') as file:
    json.dump(vtt_data, file, indent=2, ensure_ascii=False)

print(f"Created {output_path} with VTT contents")
