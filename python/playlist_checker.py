"""
This script checks for duplicate rows in 'data/playlist.csv' based on YouTube IDs,
compares with VTT files in 'vtt/' directory, reports the findings,
and offers to delete duplicates.
"""

import csv
import os
import re
from collections import defaultdict

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)
playlist_path = os.path.join(project_root, 'data', 'playlist.csv')
vtt_dir = os.path.join(project_root, 'vtt')

def extract_youtube_id(url):
    match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', url)
    return match.group(1) if match else None

def check_and_remove_duplicates(file_path):
    id_duplicates = defaultdict(list)
    rows = []
    youtube_ids = {}
    
    with open(file_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        for row_num, row in enumerate(reader, 1):
            if row and len(row) > 1:  # Skip empty rows and ensure there's a URL
                rows.append(row)
                youtube_id = extract_youtube_id(row[1])
                if youtube_id:
                    youtube_ids[youtube_id] = row[0]  # Store name with ID
                    id_duplicates[youtube_id].append(row_num)

    total_rows = len(rows)
    id_duplicate_count = sum(len(lines) - 1 for lines in id_duplicates.values() if len(lines) > 1)

    print(f"Total entries in the CSV: {total_rows}")
    print(f"Number of YouTube ID duplicate entries: {id_duplicate_count}")

    if id_duplicate_count > 0:
        print("\nYouTube ID duplicate rows found:")
        for youtube_id, line_nums in id_duplicates.items():
            if len(line_nums) > 1:
                print(f"YouTube ID: {youtube_id}")
                print(f"Name: {youtube_ids[youtube_id]}")
                print(f"Found at lines: {', '.join(map(str, line_nums))}")
                print()
        
        user_input = input(f"Do you want to delete the duplicate rows? (ID: {id_duplicate_count}) / Total: {total_rows} (y/n): ").lower()
        if user_input == 'y':
            seen_ids = set()
            final_rows = []
            for row in rows:
                youtube_id = extract_youtube_id(row[1])
                if youtube_id not in seen_ids:
                    final_rows.append(row)
                    seen_ids.add(youtube_id)
            
            with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.writer(csvfile)
                writer.writerows(final_rows)
            
            print(f"Deleted {id_duplicate_count} ID duplicates. The file has been updated.")
            print(f"New total entries: {len(final_rows)}")
        else:
            print("No changes were made to the file.")
    else:
        print("No duplicate rows found.")

    return youtube_ids

# Mismatch checking section
def mismatch_get_vtt_files():
    return {f.split('-')[0]: f for f in os.listdir(vtt_dir) if f.endswith('.vtt')}

def mismatch_verify_file_existence(youtube_id):
    for file in os.listdir(vtt_dir):
        if file.startswith(youtube_id) and file.endswith('.vtt'):
            return True
    return False

def mismatch_check(youtube_ids):
    mismatch_vtt_files = mismatch_get_vtt_files()
    mismatch_missing_vtt = set(youtube_ids.keys()) - set(mismatch_vtt_files.keys())
    mismatch_extra_vtt = set(mismatch_vtt_files.keys()) - set(youtube_ids.keys())

    # Verify missing VTT files
    verified_missing_vtt = {
        youtube_id for youtube_id in mismatch_missing_vtt
        if not mismatch_verify_file_existence(youtube_id)
    }

    # Verify extra VTT files
    verified_extra_vtt = {
        youtube_id for youtube_id in mismatch_extra_vtt
        if mismatch_verify_file_existence(youtube_id)
    }

    print(f"\nVerified entries without VTT files: {len(verified_missing_vtt)}")
    print(f"Verified VTT files without entries: {len(verified_extra_vtt)}")

    if verified_missing_vtt or verified_extra_vtt:
        print("\nVerified mismatches between playlist and VTT files:")
        if verified_missing_vtt:
            print("Entries without VTT files:")
            for mismatch_youtube_id in verified_missing_vtt:
                print(f"ID: {mismatch_youtube_id}, Name: {youtube_ids[mismatch_youtube_id]}")
        if verified_extra_vtt:
            print("\nVTT files without entries:")
            for mismatch_youtube_id in verified_extra_vtt:
                print(f"ID: {mismatch_youtube_id}, Filename: {mismatch_vtt_files[mismatch_youtube_id]}")
    else:
        print("\nAll playlist entries have corresponding VTT files and vice versa.")

if __name__ == "__main__":
    if os.path.exists(playlist_path):
        youtube_ids = check_and_remove_duplicates(playlist_path)
        mismatch_check(youtube_ids)
    else:
        print(f"Error: The file {playlist_path} does not exist.")
