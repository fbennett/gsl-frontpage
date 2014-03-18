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
       contactID INTEGER NOT NULL,
       affiliationID INTEGER NOT NULL,
       positionID INTEGER NOT NULL,
       touchDate INTEGER NOT NULL,
       UNIQUE(nameID),
       FOREIGN KEY (contactID) REFERENCES contacts(contactID),
       FOREIGN KEY (affiliationID) REFERENCES affiliations(affiliationID),
       FOREIGN KEY (positionID) REFERENCES positions(positionID),
       FOREIGN KEY (nameID) REFERENCES names(nameID)
);

CREATE TABLE events (
       eventID INTEGER PRIMARY KEY,
       convenorID INTEGER NOT NULL,
       titleID INTEGER NOT NULL,
       descriptionID INTEGER NOT NULL,
       pageDate INTEGER NOT NULL,
       presenterID INTEGER,
       noteID INTEGER,
       published BOOLEAN,
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
       startDateTime INTEGER NOT NULL,
       endDateTime INTEGER NOT NULL,
       FOREIGN KEY (eventID) REFERENCES events(eventID),
       FOREIGN KEY (titleID) REFERENCES titles(titleID),
       FOREIGN KEY (placeID) REFERENCES places(placeID)
);

CREATE TABLE attachments (
       attachmentID INTEGER PRIMARY KEY,
       eventID INTEGER NOT NULL,
       documentID INTEGER NOT NULL,
       UNIQUE (eventID,documentID),
       FOREIGN KEY (eventID) REFERENCES events(eventID),
       FOREIGN KEY (documentID) REFERENCES documents(documentID)
);

CREATE TABLE documents (
       documentID INTEGER PRIMARY KEY,
       titleID INTEGER NOT NULL,
       mimeType TEXT NOT NULL,
       filenameExtension TEXT NOT NULL,
       touchDate INTEGER NOT NULL,
       uploadDate INTEGER,
       UNIQUE(titleID,filenameExtension,uploadDate),
       FOREIGN KEY (titleID) REFERENCES titles(titleID)
);

CREATE TABLE titles (
       titleID INTEGER PRIMARY KEY,
       title TEXT NOT NULL,
       UNIQUE(title)
);

CREATE TABLE contacts (
       contactID INTEGER PRIMARY KEY,
       contact TEXT NOT NULL,
       UNIQUE(contact)
);

CREATE TABLE affiliations (
       affiliationID INTEGER PRIMARY KEY,
       affiliation TEXT NOT NULL,
       UNIQUE(affiliation)
);

CREATE TABLE positions (
       positionID INTEGER PRIMARY KEY,
       position TEXT NOT NULL,
       UNIQUE(position)
);

CREATE TABLE names (
       nameID INTEGER PRIMARY KEY,
       name TEXT NOT NULL,
       UNIQUE(name)
);

CREATE TABLE descriptions (
       descriptionID INTEGER PRIMARY KEY,
       description TEXT NOT NULL,
       UNIQUE(description)
);

CREATE TABLE notes (
       noteID INTEGER PRIMARY KEY,
       note TEXT NOT NULL,
       UNIQUE(note)
);

CREATE TABLE places (
       placeID INTEGER PRIMARY KEY,
       place TEXT NOT NULL,
       touchDate INTEGER NOT NULL,
       UNIQUE(place)
);
