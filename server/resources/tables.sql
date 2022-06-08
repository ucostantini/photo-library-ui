CREATE TABLE IF NOT EXISTS cards
(
    cardId
    INTEGER
    AUTOINCREMENT
    PRIMARY
    KEY,
    title
    VARCHAR
(
    60
) NOT NULL,
    website VARCHAR
(
    30
) NOT NULL,
    username VARCHAR
(
    30
) NOT NULL,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified_on DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
    );

CREATE TABLE IF NOT EXISTS tags
(
    cardId
    INTEGER,
    tag
    VARCHAR
(
    20
),
    PRIMARY KEY
(
    cardId,
    fileId
),
    FOREIGN KEY
(
    cardId
) REFERENCES cards
(
    cardId
)
    );

CREATE TABLE IF NOT EXISTS files
(
    cardId
    INTEGER,
    fileId
    INTEGER,
    PRIMARY
    KEY
(
    cardId,
    fileId
),
    FOREIGN KEY
(
    cardId
) REFERENCES cards
(
    cardId
) ON DELETE CASCADE
    );

CREATE
VIRTUAL TABLE IF NOT EXISTS fts USING FTS5 (
    cardId      INTEGER NOT NULL,
    title       VARCHAR(60) NOT NULL,
    website     VARCHAR(30) NOT NULL,
    username    VARCHAR(30) NOT NULL
);
