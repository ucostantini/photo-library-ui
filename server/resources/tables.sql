-- Create the datatabase :
-- bash [username@pc server]$ sqlite3 -batch ./db.sqlite < ./resources/tables.sql

CREATE TABLE IF NOT EXISTS cards
(
    --TODO use UUIDs, generate them at server level
    id   INTEGER PRIMARY KEY,
    --TODO why is there a title again ? remove it or make it optional
    title    VARCHAR(70)                        NOT NULL,
    website  VARCHAR(40)                        NOT NULL,
    author VARCHAR(40)                        NOT NULL,
    created  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER IF NOT EXISTS [UpdateLastTime]
    AFTER UPDATE
    ON cards
    FOR EACH ROW
    WHEN NEW.modified < OLD.modified
BEGIN
    UPDATE cards SET modified = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TABLE IF NOT EXISTS tags
(
    cardId INTEGER,
    tag    VARCHAR(30),
    PRIMARY KEY (cardId, tag),
    FOREIGN KEY (cardId) REFERENCES cards (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files
(
    cardId      INTEGER,
    fileId      INTEGER,
    -- TODO remove file hash
    fileName    VARCHAR(100),
    fileHash    VARCHAR(20) UNIQUE,
    fileContent TEXT,
    PRIMARY KEY (cardId, fileId),
    FOREIGN KEY (cardId) REFERENCES cards (id) ON DELETE CASCADE
);

/*
Example for files column : "[12,45]"
Example for tags column : ["car","antique","v8","70s"]"
*/

CREATE VIEW IF NOT EXISTS cards_view AS
SELECT DISTINCT id,
                title,
                json_group_array(DISTINCT tag) AS tags,
                website,
                author,
                created,
                modified
FROM cards
         INNER JOIN tags ON cards.id = tags.cardId
         INNER JOIN files ON cards.id = files.cardId
GROUP BY id, title, website, author, created, modified;
