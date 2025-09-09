

```dataview
TABLE

Author,
publish-date AS "Publish date",
("![coverImg|100](" + Cover + ")") as Cover,
rating AS "Rating",
Recommender,
Tags,
URL

FROM "02 - Areas/BOOKS"
WHERE Status="potential" OR Status="Potential"
SORT Recommender desc
```
