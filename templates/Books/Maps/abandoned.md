
# the left behinds mostly unfinished series
```dataview
TABLE
Author,
publish-date AS "Publish date",
("![coverImg|100](" + Cover + ")") as Cover,
rating AS "Rating",
Recommender,
tags,
Keyterms As "Shall I return?",
Date,
URL

FROM "02 - Areas/BOOKS"
WHERE Status="abandoned" OR Status="Abandoned"
SORT Keyterms desc

```

