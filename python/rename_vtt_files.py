"""
This script renames .vtt files in the specified directory by adding underscores between words.
It uses a dictionary-based approach to identify common words, handles camelCase and PascalCase,
and preserves "@" symbols and any text after the first hyphen or exclamation mark in the filename.

Usage: Place this script in the same directory as your vtt/ folder and run it.
"""

import os
import re

# List of common words to look for
COMMON_WORDS = set(['what', 'is', 'a', 'the', 'with', 'and', 'or', 'for', 'of', 'in', 'to', 'at', 'by'])

def split_words(text):
    words = []
    current_word = text[0].lower()
    for char in text[1:]:
        if char.isupper() or (current_word.lower() in COMMON_WORDS and len(current_word) > 1):
            words.append(current_word)
            current_word = char.lower()
        else:
            current_word += char.lower()
    words.append(current_word)
    
    # Additional pass to split remaining long words
    final_words = []
    for word in words:
        if len(word) > 3:  # Only process words longer than 3 characters
            subwords = []
            for i in range(len(word)):
                for j in range(i+1, min(i+6, len(word)+1)):  # Look for words up to 5 characters long
                    if word[i:j] in COMMON_WORDS:
                        subwords.append(word[i:j])
                        i = j-1
                        break
            if subwords:
                final_words.extend(subwords)
            else:
                final_words.append(word)
        else:
            final_words.append(word)
    
    return '_'.join(final_words)

def clean_filename(name):
    # Split at underscores and process each part
    parts = name.split('_')
    cleaned_parts = [split_words(part) for part in parts]
    
    # Join parts, replace multiple underscores, and strip leading/trailing underscores
    return re.sub(r'_+', '_', '_'.join(cleaned_parts)).strip('_')

def rename_files(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.vtt'):
            # Split the filename at the first hyphen or exclamation mark
            parts = re.split(r'(-|!)', filename, 1)
            
            if len(parts) > 1:
                # Process the part before the separator
                new_name = clean_filename(parts[0])
                
                # Reassemble the filename
                new_filename = new_name + parts[1] + ''.join(parts[2:])
            else:
                # If there's no separator, process the whole filename
                new_filename = clean_filename(filename)
            
            # Rename the file if it's different
            if new_filename != filename:
                os.rename(os.path.join(directory, filename), os.path.join(directory, new_filename))
                print(f"Renamed: {filename} -> {new_filename}")
            else:
                print(f"No change: {filename}")

# Run the function
rename_files('vtt/')