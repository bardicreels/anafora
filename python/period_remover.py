import os
import re

def remove_extra_dot(directory):
    for filename in os.listdir(directory):
        if filename.endswith('..vtt'):
            new_filename = re.sub(r'\.\.vtt$', '.vtt', filename)
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_filename)
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} -> {new_filename}")

# Specify the directory containing the files
directory = '.'  # Current directory, change if needed

remove_extra_dot(directory)