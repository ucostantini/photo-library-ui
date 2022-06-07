CREATE TABLE photo_library.cards
(
    cardId      INTEGER PRIMARY KEY,
    title       VARCHAR(60) NOT NULL,
    files ARRAY NOT NULL,
    website     VARCHAR(30) NOT NULL,
    username    VARCHAR(30) NOT NULL,
    created_on  TIMESTAMP   NOT NULL,
    modified_on TIMESTAMP   NOT NULL
);
