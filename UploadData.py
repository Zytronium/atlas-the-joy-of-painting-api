#!/bin/env python3
import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore

cred = credentials.Certificate("the-joy-of-coding-firebase-adminsdk-fbsvc-b1a99d83d8.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

colors_data = pd.read_csv("Colors_Used.csv")
subject_data = pd.read_csv("Subject_Matter.csv")
episode_data = pd.read_csv("Episode_Dates.csv", sep="|")

colors_data["episode_id"] = colors_data.apply(
    lambda row: f"S{int(row['season']):02d}E{int(row['episode']):02d}", axis=1
)

colors_grouped = colors_data.groupby("episode_id")["colors"].apply(list).to_dict()

print(colors_grouped)

subjects_dict = subject_data.set_index("EPISODE")["TITLE"].to_dict()

print(subjects_dict)
