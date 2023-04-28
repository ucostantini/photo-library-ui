-- Create the datatabase :
-- sqlite3 db.sqlite
-- sqlite> .databases
-- sqlite> .quit
CREATE TABLE IF NOT EXISTS cards
(
    cardId   INTEGER PRIMARY KEY,
    --TODO why is there a title again ? remove it or make it optional
    title    VARCHAR(70)                        NOT NULL,
    website  VARCHAR(40)                        NOT NULL,
    username VARCHAR(40)                        NOT NULL,
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
    tag    VARCHAR(30),
    PRIMARY KEY (cardId, tag),
    FOREIGN KEY (cardId) REFERENCES cards (cardId) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS files
(
    cardId      INTEGER,
    fileId      INTEGER,
    fileName    VARCHAR(100),
    fileHash    VARCHAR(20) UNIQUE,
    fileContent TEXT,
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
                json_group_array(DISTINCT tag) AS tags,
                website,
                username,
                created,
                modified
FROM cards
         NATURAL JOIN tags
         NATURAL JOIN files
GROUP BY cardId, title, website, username, created, modified;
