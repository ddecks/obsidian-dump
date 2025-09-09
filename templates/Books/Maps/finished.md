
```dataview
TABLE
Author,
publish-date AS "Publish date",
("![coverImg|100](" + Cover + ")") as Cover,
rating AS "Rating",
Recommender,
Keyterms As "Shall I return?",
Tags,
URL

FROM "02 - Areas/BOOKS"
WHERE Status="finished" Or Status="Finished"
SORT rating desc
```
