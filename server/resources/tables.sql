CREATE TABLE IF NOT EXISTS cards
(
    cardId   INTEGER PRIMARY KEY,
    title    VARCHAR(70) NOT NULL,
    website  VARCHAR(40) NOT NULL,
    username VARCHAR(40) NOT NULL,
    created  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER IF NOT EXISTS [UpdateLastTime]
    AFTER UPDATE
    ON cards
    FOR EACH ROW
    WHEN NEW.modified < OLD.modified
BEGIN
    UPDATE cards SET modified = CURRENT_TIMESTAMP WHERE cardId = OLD.cardId;
END;

CREATE TABLE IF NOT EXISTS tags
(
    cardId INTEGER,
    tag    VARCHAR(20),
    PRIMARY KEY (cardId, tag),
    FOREIGN KEY (cardId) REFERENCES cards (cardId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files
(
    cardId   INTEGER,
    fileId   INTEGER,
    fileName VARCHAR(20),
    fileHash VARCHAR(20) UNIQUE,
    PRIMARY KEY (cardId, fileId),
    FOREIGN KEY (cardId) REFERENCES cards (cardId) ON DELETE CASCADE
);

/*
Example for files column : "[12,45]"
Example for tags column : ["car","antique","v8","70s"]"
*/

CREATE VIEW IF NOT EXISTS cards_view AS
SELECT DISTINCT cardId,
                title,
                json_group_array(DISTINCT fileId) AS files,
                json_group_array(DISTINCT tag)    AS tags,
                website,
                username,
                created,
                modified
FROM cards
         NATURAL JOIN tags
         NATURAL JOIN files
GROUP BY cardId, title, website, username, created, modified;

CREATE VIRTUAL TABLE cards_fts USING FTS5
(
    cardId,
    title,
    website,
    username,
    tags
);
