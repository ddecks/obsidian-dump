```dataview
TABLE
Author,
publish-date AS "Publish date",
("![coverImg|100](" + Cover + ")") as Cover,
rating AS "Rating",
Recommender,
tags,
URL

FROM "02 - Areas/BOOKS"
WHERE Status="ongoing" Or Status="Ongoing"
```

