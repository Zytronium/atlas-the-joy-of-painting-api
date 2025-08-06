# ETL: The Joy of Coding

This Atlas School project explores the idea of ETL, creating a database and API
for getting data on episodes of "The Joy of Painting."

ETL stands for Extract, Transform, Load, which is the process of taking data
from multiple unique sources, modifying them, and then storing them in a
centralized database. This data may come in many forms, but usually CSV or JSON.

The hypothetical scenario for this project is that your local public
broadcasting
station has an overwhelming number of requests for info on "The Joy of Painting"
by Bob Ross. Their viewers want a site that allows them to search and filter the
403 episodes based on the following criteria:

* Month of original broadcast
    * This will be useful for viewers who wish to watch episodes on paintings
      that
      were made during that month of the year
* Subject
    * This will be useful for viewers who wish to watch specific items get
      painted
* Color palette
    * This will be useful for viewers who wish to watch episodes with specific
      colors being used in a painting.

Your local broadcasting station has already done some leg work to gather data,
however, it is spread across multiple different files and formats, which makes
the data unusable in its current form. They've also hired another team to build
a front-end to allow their viewers to filter the episodes. Now, they've hired
you to help them with the process of designing and building a database that will
house the collected data in a way that is usable, and build an API to access it.

For this project, I will be using Firebase Firestore as my database. The reason
I choose Firebase is that I am familiar with Firebase Firestore, but so far
have only worked with interfacing with it from the front-end or with Firebase
Admin in Python. This week, I am starting on a collaborative passion project
where I will be creating an API to interface with a Firebase Firestore database.
This is the perfect opportunity to do the same thing for this project to get
some
practice in.

----

## Important Notes:

### Route: /episodes/filter

This gets the episodes that match the given filters using query parameters.
**Valid filters:**

- /episodes/filter?month=MM/YYYY
    - the `month` query parameter must include the month AND year in the MM/YYYY
      format.
- /episodes/filter?subjects=subject1,Subject2,%20subject3
    - the `subjects` query parameter must be a comma-separated string. Spaces (
      `%20`) between values are allowed and will be ignored. Subjects are NOT
      case-sensitive. If `matchValues` is set to "any", you cannot specify more
      than 10 subjects here.
- /episodes/filter?colors=color%201,color2,%20Color3
    - the `colors` query parameter must be a comma-separated string. Spaces (
      `%20`) between values are allowed and will be ignored. Colors ARE
      case-sensitive. If `matchValues` is set to "any", you cannot specify more
      than 10 colors here.
- /episodes/filter?colors=color1,color2&subjects=subject1
    - multiple filters can be used in one request. You can use any number of
      filters as long as there's at least one and there are no duplicates.

You can control how filters and their values are applied using two parameters:

- `matchFilters`:
    - `all` (default): An episode must satisfy all provided filters (i.e.,
      month, subjects, and colors).
    - `any`: An episode can satisfy any one of the provided filters.

- `matchValues`:
    - `all` (default): Within each filter, the episode must include all
      specified values (i.e., tree, trees, grass, etc.).
    - `any`: Within each filter, the episode can include any one of the
      specified values.

Examples:

- `/episodes/filter?matchFilters=all&matchValues=any`  
  Episodes must match all provided filters, and within each filter, at least 1
  value matches.

- `/episodes/filter?matchFilters=any&matchValues=all`  
  Episodes must fully satisfy at least one filter (i.e., all subjects match OR
  all colors match).

- `/episodes/filter?matchFilters=all&matchValues=all`  
  Episodes must fully satisfy all filters.

- `/episodes/filter?matchFilters=any&matchValues=any`  
  Episodes must match at least one value from at least one filter.

Both parameters are optional and case-insensitive. Missing values default to `all`.

### Route: /episodes/filterName

This gets the episode with the exact painting title as given in the query
parameter `name`
**Usage:**
`/episodes/filterName?name=Autumn%20Splendor`
This case sensitive value must match exactly and will return the first (and
hopefully only) matching result if it matches.

### Route: /episodes/:id

This gets the episode of the given ID. IDs are formated as `SxxExx` where `Sxx`
is the season number (i.e., Season 2 would be `S02` and Season 15 would be`S15`)
and `Exx` is the episode number (i.e., Episode 2 would be `E02` and Episode
13 would be `E13`). For example, to get Season 19, Episode 4, you would do
`/episodes/S19E04`. There are 31 seasons each with 13 episodes.

----

## Setup

1. Ensure you have Firebase set up to work with this project and that you have
   `the-joy-of-coding-firebase-adminsdk-fbsvc-b1a99d83d8.json` in the `src/`
   directory.
   You can download this file from Firebase Console. You may have to rename it
   to get
   the file names to match. Ensure it is gitignored, as this is a highly
   sensitive file.
2. If using a .env file for environment variables like `PORT`, put `.env` in the
   `src/` directory. (or depending on how you run `app.js`, put it in the root directory)
3. Open the root directory of this project (`atlas-the-joy-of-painting-api/`)
4. Upload data to Firestore by running `python3 UploadData.py` (preferably with
   Python version 3.13)
5. Run `npm install`

## Running the Server

1. Run `node src/app.js`
2. Connect at either `http://localhost:3000` or `http://0.0.0.0:3000`. (Replace
   `3000` with `PORT`'s value if using environment variables)
3. Test either in browser or with Postman

Note: to get more debug information, both in server console and in the response
JSON, when an unexpected error occurs, set environment variable `ENV` to
`development`.

Note2: Due to Firebase query limitations, this API has to perform a lot of logic
itself and make extra queries. This slows down large requests significantly. I
reccomend similar projects in the future don't use Firebase.

----

## Example usage

**`GET` http://0.0.0.0:3000/episodes/S02E06**  
Response:

```json
{
  "id": "S02E06",
  "img_src": "https://www.twoinchbrush.com/images/painting274.png",
  "title": "Black River",
  "season": 2,
  "air_date": {
    "_seconds": 434160000,
    "_nanoseconds": 0
  },
  "youtube_src": "https://www.youtube.com/embed/6O4sfJd8G_M",
  "subjects": [
    "BUSHES",
    "CLOUDS",
    "CUMULUS",
    "DECIDUOUS",
    "GRASS",
    "RIVER",
    "TREE",
    "TREES"
  ],
  "episode": 6,
  "colors": [
    "Alizarin Crimson",
    "Bright Red",
    "Burnt Umber",
    "Cadmium Yellow",
    "Phthalo Blue",
    "Phthalo Green",
    "Prussian Blue",
    "Sap Green",
    "Titanium White",
    "Van Dyke Brown",
    "Yellow Ochre"
  ]
}
```

Server output:

```
GET /episodes/S02E06 200 189.719 ms - 499
```

**`GET` http://0.0.0.0:3000/episodes/filter?matchValues=any&subjects=steve_ross,circle_frame,double_oval_frame**  
Response:
```json
[
  {
    "id": "S03E13",
    "img_src": "https://www.twoinchbrush.com/images/painting268.png",
    "title": "Peaceful Waters",
    "season": 3,
    "air_date": {
      "_seconds": 449366400,
      "_nanoseconds": 0
    },
    "youtube_src": "https://www.youtube.com/embed/Z0vtjRLqXcQ",
    "subjects": [
      "CLOUDS",
      "CONIFER",
      "CUMULUS",
      "DECIDUOUS",
      "GUEST",
      "LAKE",
      "MOUNTAIN",
      "SNOWY_MOUNTAIN",
      "STEVE_ROSS",
      "TREE",
      "TREES"
    ],
    "episode": 13,
    "colors": [
      "Alizarin Crimson",
      "Cadmium Yellow",
      "Phthalo Blue",
      "Phthalo Green",
      "Prussian Blue",
      "Sap Green",
      "Titanium White",
      "Van Dyke Brown",
      "Yellow Ochre"
    ]
  },
  {
    "id": "S04E04",
    "img_src": "https://www.twoinchbrush.com/images/painting246.png",
    "title": "Winter Sawscape",
    "season": 4,
    "air_date": {
      "_seconds": 465004800,
      "_nanoseconds": 0
    },
    "youtube_src": "https://www.youtube.com/embed/lmKAwKrONmE",
    "subjects": [
      "CABIN",
      "CIRCLE_FRAME",
      "CLOUDS",
      "CONIFER",
      "CUMULUS",
      "DECIDUOUS",
      "FRAMED",
      "GUEST",
      "LAKE",
      "SNOW",
      "STRUCTURE",
      "TREE",
      "TREES",
      "WINTER"
    ],
    "episode": 4,
    "colors": [
      "Black Gesso",
      "Bright Red",
      "Burnt Umber",
      "Cadmium Yellow",
      "Midnight Black",
      "Prussian Blue",
      "Titanium White"
    ]
  },
  // ... (12 more episodes)
]
```

Server output:
```
GET /episodes/filter?matchValues=any&subjects=steve_ross,circle_frame,double_oval_frame 200 4100.473 ms - 7673
```

Server output example during testing:
```
Server running on port 3001
GET /episodes/filter?matchValues=ANY&colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest&matchFilters=ALL&month=04/1988 200 8606.906 ms - 512
GET /episodes/filter?matchValues=ANY&colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest&matchFilters=any%20&month=04/1988 400 0.816 ms - 82
GET /episodes/filter?matchValues=ANY&colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest&matchFilters=obamna&month=04/1988 400 0.575 ms - 82
GET /episodes/filter?matchValues=ANY&colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest&matchFilters=&month=04/1988 200 5089.309 ms - 512
GET /episodes/filter?matchValues=any&colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest&matchFilters=any&month=04/1988 200 2150.926 ms - 202902
GET /episodes/filter?colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest 200 11571.682 ms - 1134
GET /episodes/filter?matchValues=any&colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest 200 6327.477 ms - 182709
GET /episodes/filter?colors=Phthalo%20Green,Phthalo%20Blue,Prussian%20Blue,Bright%20Red&subjects=tree,guest&matchFilters=any 200 16492.863 ms - 202902
GET /episodes/filter?matchValues=all&colors=Phthalo%20Green,Prussian%20Blue,Bright%20Red&subjects=tree,guest,steve_ross 200 17887.285 ms - 1134
GET /episodes/filter?colors=Phthalo%20Green,Prussian%20Blue,Bright%20Red&subjects=tree,guest,steve_ross&month=04/1988 404 15159.119 ms - 56
GET /episodes/filter?subjects=tree,guest,steve_ross&month=04/1988 404 1744.120 ms - 56
GET /episodes/filter?subjects=guest,steve_ross&month=04/1988 404 306.895 ms - 56
GET /episodes/filter?subjects=guest,steve_ross 200 344.577 ms - 6020
```
**Log content:**  
`METHOD url StatusCode ResponseTime ms - BytesReturned`  
(Maybe the `-` between ms and bytes returned means something and is just N/A in this case. I'm not sure.)

----

### ✅ Tasks checklist:

- [X] ​0. Design a Database (5/5 pts)
- [X] ​1. Extract, Transform, Load (4/4 pts)
- [X] ​2. API (4/4 pts)


- [X] Readme
- [X] **Everything Done ✓** (13/13 pts) - 100%

---
