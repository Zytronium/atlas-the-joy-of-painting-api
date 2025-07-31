#!/bin/env python3
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("the-joy-of-coding-firebase-adminsdk-fbsvc-b1a99d83d8.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

colors_data = pd.read_csv("Colors_Used.csv")
subject_data = pd.read_csv("Subject_Matter.csv")
date_data = pd.read_csv("Episode_Dates.csv", sep="|")

colors_data["episode_id"] = colors_data.apply(
    lambda row: f"S{int(row['season']):02d}E{int(row['episode']):02d}", axis=1
)
colors_data["colors"] = colors_data["colors"].str.strip("[]").str.replace("'", "").str.split(", ")

subjects_dict = {}
subject_cols = subject_data.columns[2:]  # skip EPISODE and TITLE
for _, row in subject_data.iterrows():
    episode_id = row["EPISODE"]
    subjects = [col for col in subject_cols if int(row[col]) == 1]
    subjects_dict[episode_id] = subjects

date_data["title"] = date_data["title"].str.replace('"', "").str.strip()
date_lookup = dict(zip(date_data["title"], date_data["date"].str.strip("()")))

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

for episode_id, episode_data in episode_dict.items():
    db.collection("episodes").document(episode_id).set(episode_data)
    print(f"Uploaded: {episode_id}")

print("All episodes uploaded!")
