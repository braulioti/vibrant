CREATE TABLE photo (
    id SERIAL NOT NULL PRIMARY KEY,
    photo TEXT,
    vibrant varchar(7),
    muted varchar(7),
    dark_vibrant varchar(7),
    dark_muted varchar(7),
    light_vibrant varchar(7)
);