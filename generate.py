import os
import json

SONGS_DIR = "songs"

albums = []

for folder in os.listdir(SONGS_DIR):
    folder_path = os.path.join(SONGS_DIR, folder)

    if os.path.isdir(folder_path):

        # collect mp3 files
        songs = [
            f for f in os.listdir(folder_path)
            if f.endswith(".mp3")
        ]

        # write songs.json inside folder
        with open(os.path.join(folder_path, "songs.json"), "w") as f:
            json.dump(songs, f, indent=2)

        # read metadata if exists
        info_path = os.path.join(folder_path, "info.json")

        title = folder
        description = "No description"

        if os.path.exists(info_path):
            with open(info_path, "r", encoding="utf-8") as f:
                info = json.load(f)
                title = info.get("title", folder)
                description = info.get("description", "No description")

        albums.append({
            "folder": folder,
            "title": title,
            "description": description
        })

# write albums.json
with open(os.path.join(SONGS_DIR, "albums.json"), "w", encoding="utf-8") as f:
    json.dump(albums, f, indent=2)

print("✅ albums.json and songs.json generated successfully!")