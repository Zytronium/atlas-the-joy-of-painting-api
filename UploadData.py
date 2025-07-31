#!/bin/env python3
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime

# Initialize Firebase
cred = credentials.Certificate("the-joy-of-coding-firebase-adminsdk-fbsvc-b1a99d83d8.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Load CSV data
colors_data = pd.read_csv("Colors_Used.csv")
subject_data = pd.read_csv("Subject_Matter.csv")
date_data = pd.read_csv("Episode_Dates.csv", sep="|")

# Format episode ID
colors_data["episode_id"] = colors_data.apply(
    lambda row: f"S{int(row['season']):02d}E{int(row['episode']):02d}", axis=1
)
colors_data["colors"] = colors_data["colors"].str.strip("[]").str.replace("'", "").str.split(", ")

# Parse subject matter
subjects_dict = {}
subject_cols = subject_data.columns[2:]  # skip EPISODE and TITLE
for _, row in subject_data.iterrows():
    episode_id = row["EPISODE"]
    subjects = [col for col in subject_cols if int(row[col]) == 1]
    subjects_dict[episode_id] = subjects

# Clean date data and parse as datetime
date_data["title"] = date_data["title"].str.replace('"', "").str.strip()
date_data["date"] = date_data["date"].str.strip("()").str.strip()

errors = 0

# Build title -> datetime lookup
date_lookup = {}
for _, row in date_data.iterrows():
    title = row["title"]
    try:
        date_obj = datetime.strptime(row["date"], "%B %d, %Y")
        date_lookup[title] = date_obj  # Firestore will interpret this as a timestamp
    except ValueError:
        print(f"Could not parse date: {row['date']} for title: {title}")
        errors += 1

# Build episode dictionary
episode_dict = {}
for _, row in colors_data.iterrows():
    episode_id = row["episode_id"]
    title = row["painting_title"]
    episode_dict[episode_id] = {
        "title": title,
        "img_src": row["img_src"],
        "youtube_src": row["youtube_src"],
        "colors": row["colors"],
        "subjects": subjects_dict.get(episode_id, []),
        "air_date": date_lookup.get(title, None),
        "season": row["season"],
        "episode": row["episode"]
    }

# Upload to Firestore
for episode_id, episode_data in episode_dict.items():
    db.collection("episodes").document(episode_id).set(episode_data)
    print(f"Uploaded: {episode_id}")

if errors > 0:
    print(f"{len(episode_dict) - errors} out of {len(episode_dict)} episodes uploaded.")
else:
    print(f"All {len(episode_dict)} episodes uploaded!")
