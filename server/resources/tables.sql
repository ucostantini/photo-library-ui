CREATE TABLE IF NOT EXISTS cards
(
    cardId   INTEGER PRIMARY KEY,
    title    VARCHAR(70) NOT NULL,
    website  VARCHAR(40) NOT NULL,
    username VARCHAR(40) NOT NULL,
    created  DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TRIGGER [UpdateLastTime]
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
    cardId INTEGER,
    fileId INTEGER,
    FOREIGN KEY (cardId) REFERENCES cards (cardId) ON DELETE CASCADE
);

CREATE VIRTUAL TABLE cards_fts USING FTS5
(
    cardId,
    title,
    website,
    username
);
