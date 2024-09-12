"""
This script sorts the vtt_content.json list
That list is used to determine the vtt-list display order on askthelady.info
Filenames with "Featured:" are listed first.
"""
import json
import os
import re

def custom_sort_key(item):
    name = item['name']
    if name.startswith('Featured:'):
        return (0, name.lower())
    return (1, name.lower())

def create_name_from_filename(filename):
    name = os.path.splitext(filename)[0]
    name = re.sub(r'-!.*$', '', name)
    name = re.sub(r'-[^-]+$', '', name)
    return name.replace('_', ' ').strip()

def extract_video_id_from_filename(filename):
    name_without_extension = os.path.splitext(filename)[0]
    if '-!' in name_without_extension:
        return name_without_extension.split('-!')[-1]
    match = re.search(r'-([^-]+)$', name_without_extension)
    return match.group(1) if match else name_without_extension

def parse_vtt_content(content):
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

# Get the directory of the script
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
vtt_dir = os.path.join(project_root, 'vtt')

# Change to the script's directory
os.chdir(script_dir)

# List all .vtt files in the current directory
vtt_files = [f for f in os.listdir(vtt_dir) if f.endswith('.vtt')]

if not vtt_files:
    print("No .vtt files found in the current directory.")
    exit()

vtt_data = {}
for vtt_filename in vtt_files:
    with open(os.path.join(vtt_dir, vtt_filename), 'r', encoding='utf-8') as f:
        content = f.read()
    
    video_id = extract_video_id_from_filename(vtt_filename)
    url = f"https://www.youtube.com/watch?v={video_id}"
    
    vtt_data[vtt_filename] = {
        "name": create_name_from_filename(vtt_filename),
        "url": url,
        "content": parse_vtt_content(content)
    }

# Sort the vtt_data dictionary by the custom sort key
sorted_vtt_data = dict(sorted(vtt_data.items(), key=lambda x: custom_sort_key(x[1])))

# Ensure the data directory exists
data_dir = os.path.join(project_root, 'data')
os.makedirs(data_dir, exist_ok=True)

# Write the sorted data to a JSON file
output_path = os.path.join(project_root, 'data', 'vtt_content.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(sorted_vtt_data, f, ensure_ascii=False, indent=2)

print(f"VTT list updated with {len(sorted_vtt_data)} files.")
print(f"Output written to: {output_path}")
