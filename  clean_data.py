import pandas as pd
import json
import numpy as np


df = pd.read_csv("billboard_24years_lyrics_spotify.csv")


df = df.drop_duplicates()
df.columns = df.columns.str.strip().str.lower()

keep_cols = [
    "year", "ranking", "song", "band_singer",
    "tempo", "energy", "danceability", "valence",
    "loudness", "duration_ms", "acousticness",
    "instrumentalness"
]

df = df[keep_cols]
df = df.dropna(subset=["year", "tempo", "energy", "danceability"])


df.to_json("data/full-data.json", orient="records", indent=2)


year_summary = df.groupby("year").mean(numeric_only=True).reset_index()
year_summary.to_json("data/year.json", orient="records", indent=2)


def get_decade(year):
    if 2000 <= year <= 2009:
        return "2000s"
    elif 2010 <= year <= 2019:
        return "2010s"
    else:
        return "2020s"

df["decade"] = df["year"].apply(get_decade)
decade_summary = df.groupby("decade").mean(numeric_only=True).reset_index()
decade_summary.to_json("data/decade.json", orient="records", indent=2)

hits = df[df["ranking"] == 1]
hits.to_json("data/hits.json", orient="records", indent=2)


def guess_genre(artist):
    artist = str(artist).lower()
    if any(x in artist for x in ["drake", "eminem", "kanye", "jay", "nicki", "kendrick"]):
        return "Hip-Hop"
    if any(x in artist for x in ["coldplay", "linkin", "green day", "u2", "paramore"]):
        return "Rock"
    return "Pop"

df["genre"] = df["band_singer"].apply(guess_genre)
genre_summary = df.groupby("genre").mean(numeric_only=True).reset_index()
genre_summary.to_json("data/genre.json", orient="records", indent=2)

print("All JSON files exported into /data/")
