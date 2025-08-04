# ETL: The Joy of Coding

This Atlas School project explores the idea of ETL, creating a database and API
for getting data on episodes of "The Joy of Painting."

ETL stands for Extract, Transform, Load, which is the process of taking data
from multiple unique sources, modifying them, and then storing them in a
centralized database. This data may come in many forms, but usually CSV or JSON.

The hypothetical scenario for this project is that your local public broadcasting
station has an overwhelming number of requests for info on "The Joy of Painting"
by Bob Ross. Their viewers want a site that allows them to search and filter the
403 episodes based on the following criteria:

* Month of original broadcast
  * This will be useful for viewers who wish to watch episodes on paintings that
were made during that month of the year
* Subject
  * This will be useful for viewers who wish to watch specific items get painted
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
This is the perfect opportunity to do the same thing for this project to get some
practice in.

----

## Important Notes:

### Route: /episodes/filter
This gets the episodes that match the given filters using query parameters.
**Valid filters:**
- /episodes/filter?month=MM/YYYY
  - the `month` query parameter must include the month AND year in the MM/YYYY format.
- /episodes/filter?subjects=subject1,Subject2,%20subject3
  - the `subjects` query parameter must be a comma-separated string. Spaces (`%20`) between values are allowed and will be ignored. Subjects are NOT case-sensitive.
- /episodes/filter?colors=color%201,color2,%20Color3
  - the `colors` query parameter must be a comma-separated string. Spaces (`%20`) between values are allowed and will be ignored. Colors ARE case-sensitive.
- /episodes/filter?colors=color1,color2&subjects=subject1
  - multiple filters can be used in one request. You can use any number of filters as long as there's at least one and there are no duplicates.

You can control how filters and their values are applied using two parameters:

- `matchFilters`:
  - `all` (default): An episode must satisfy all provided filters (i.e., month, subjects, and colors).
  - `any`: An episode can satisfy any one of the provided filters.

- `matchValues`:
  - `all` (default): Within each filter, the episode must include all specified values (i.e., tree, trees, grass, etc.).
  - `any`: Within each filter, the episode can include any one of the specified values.

\* `matchFilters` is not implemented yet.

Examples:
- `/episodes/filter?matchFilters=all&matchValues=any`  
  Episodes must match all provided filters, but within each filter, at least 1 value matches.

- `/episodes/filter?matchFilters=any&matchValues=all`  
  Episodes must fully satisfy at least one filter (i.e., all subjects match OR all colors match).

Both parameters are optional and case-insensitive. Invalid or missing values default to `all`.

### Route: /episodes/filterName
This gets the episode with the exact painting title as given in the query
parameter `name`
**Usage:**
`/episodes/filterName?name=Autumn%20Splendor`
This case sensitive value must match exactly and will return the first (and
hopefully only) matching result if it matches.

### Route: /episodes/:id
This gets the episode of the given ID. IDs are formated as `SxxExx` where `Sxx`
is the season number (i.e., Season 2 would be `S02` and Season 15 would be `S15`)
and `Exx` is the episode number (i.e., Episode 2 would be `E02` and Episode
13 would be `E13`). For example, to get Season 19, Episode 4, you would do
`/episodes/S19E04`. There are 31 seasons each with 13 episodes.

----

### ✅ Tasks checklist:
- [X] ​0. Design a Database (5/5 pts)
- [X] ​1. Extract, Transform, Load (4/4 pts)
- [ ] ​2. API (3/4 pts)


- [X] Readme
- [ ] **Everything Done ✓** (12/13 pts) - ~92%

---
