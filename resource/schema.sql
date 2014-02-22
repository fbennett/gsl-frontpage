-- 1

CREATE TABLE version (
       schema TEXT PRIMARY KEY,
       version INT NOT NULL
);
CREATE INDEX version_idx ON version(schema);

CREATE TABLE admin (
       adminID INTEGER PRIMARY KEY,
       name TEXT,
       adminKey TEXT,
       role INTEGER,
       interval INTEGER,
       email TEXT
);
CREATE UNIQUE INDEX admin_key_idx ON admin(adminKey);
CREATE UNIQUE INDEX admin_name_idx ON admin(name);

CREATE TABLE persons (
       personID INTEGER PRIMARY KEY,
       nameID INTEGER NOT NULL,
       contactDetail TEXT,
       affiliationID INTEGER,
       positionID INTEGER,
       FOREIGN KEY (affiliationID) REFERENCES affiliations(affiliationID),
       FOREIGN KEY (positionID) REFERENCES positions(positionID),
       FOREIGN KEY (nameID) REFERENCES personalNames(nameID)
);

CREATE TABLE events (
       eventID INTEGER PRIMARY KEY,
       convenorID INTEGER NOT NULL,
       presenterID INTEGER NOT NULL,
       titleID INTEGER NOT NULL,
       descriptionID INTEGER NOT NULL,
       noteID INTEGER,
       FOREIGN KEY (convenorID) REFERENCES persons(personID),
       FOREIGN KEY (presenterID) REFERENCES persons(personID),
       FOREIGN KEY (titleID) REFERENCES titles(titleID),
       FOREIGN KEY (descriptionID) REFERENCES descriptions(descriptionID),
       FOREIGN KEY (noteID) REFERENCES notes(noteID)
);

CREATE TABLE sessions (
       sessionID INTEGER PRIMARY KEY,
       eventID INTEGER NOT NULL,
       titleID INTEGER NOT NULL,
       placeID INTEGER NOT NULL,
       dateTime INTEGER NOT NULL,
       FOREIGN KEY (eventID) REFERENCES events(eventID),
       FOREIGN KEY (titleID) REFERENCES titles(titleID),
       FOREIGN KEY (placeID) REFERENCES places(placeID)
);

CREATE TABLE attachments (
       attachmentID INTEGER PRIMARY KEY,
       titleID INTEGER NOT NULL,
       keyStr TEXT,
       FOREIGN KEY (titleID) REFERENCES titles(titleID)
);

CREATE TABLE titles (
       titleID INTEGER PRIMARY KEY,
       str TEXT
);

CREATE TABLE affiliations (
       affiliationID INTEGER PRIMARY KEY,
       str TEXT
);

CREATE TABLE positions (
       positionID INTEGER PRIMARY KEY,
       str TEXT
);

CREATE TABLE personalNames (
       nameID INTEGER PRIMARY KEY,
       name TEXT
);

CREATE TABLE descriptions (
       descriptionID INTEGER PRIMARY KEY,
       str TEXT
);

CREATE TABLE notes (
       noteID INTEGER PRIMARY KEY,
       str TEXT
);

CREATE TABLE places (
       placeID INTEGER PRIMARY KEY,
       str TEXT
);
