-- Add migration script here
CREATE TABLE payments (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_date INTEGER NOT NULL,
    observations TEXT DEFAULT NULL,
    FOREIGN KEY(client_id) REFERENCES client(id)
);