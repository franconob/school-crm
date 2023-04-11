-- Add migration script here
CREATE TABLE client (
    id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    name varchar(255) NOT NULL,
    last_name varchar(255) NOT NULL,
    dni varchar(255) NOT NULL,
    place_of_birth varchar(255) NOT NULL,
    date_of_birth varchar(255) NOT NULL,
    address varchar(255) NOT NULL,
    phones varchar(255) NOT NULL,
    repetitive tinyint NOT NULL,
    coming_from varchar(255) NOT NULL,
    filed tinyint NOT NULL,
    payments varchar(255),
    grade_id tinyint NOT NULL,
    FOREIGN KEY(grade_id) REFERENCES grade(id)
);

CREATE TABLE grade (
    id integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    name varchar(255) NOT NULL,
    color varchar(255)
)