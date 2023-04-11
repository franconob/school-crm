// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use anyhow::Result;
use csv::ReaderBuilder;
use dotenv::dotenv;
use serde::{Deserialize, Deserializer, Serialize};
use sqlx::{sqlite::SqliteArguments, SqlitePool};
use std::{env, fs, sync::Arc};
use tokio::sync::Mutex;

struct State {
    conn: Arc<Mutex<SqlitePool>>,
}

#[derive(Serialize, Deserialize, sqlx::FromRow, Debug)]
struct Grade {
    #[serde(default)]
    id: u8,
    name: String,
    color: String,
}

#[derive(Serialize, sqlx::FromRow, Deserialize, Debug)]
struct Client {
    id: u8,
    name: String,
    last_name: String,
    dni: String,
    place_of_birth: String,
    date_of_birth: String,
    address: String,
    phones: String,
    #[serde(deserialize_with = "parse_repetitive")]
    repetitive: bool,
    coming_from: String,
    payments: String,
    #[serde(deserialize_with = "parse_filed")]
    filed: bool,
    grade_id: u8,
}
#[derive(Deserialize, Debug)]
struct Payment {
    #[serde(default)]
    id: u64,
    client_id: u8,
    amount: f64,
    payment_date: i64,
    observations: String,
}

fn parse_filed<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;

    if s == "ENTREGADO" {
        Ok(true)
    } else {
        Ok(false)
    }
}

fn parse_repetitive<'de, D>(deserializer: D) -> Result<bool, D::Error>
where
    D: Deserializer<'de>,
{
    let s: String = Deserialize::deserialize(deserializer)?;

    if s == "NO" {
        Ok(false)
    } else {
        Ok(true)
    }
}

#[tauri::command]
async fn add_payment(state: tauri::State<'_, State>, payment: Payment) -> Result<u64, String> {
    let state = state.clone();
    let pool = state.conn.lock().await;
    let mut conn = pool.acquire().await.unwrap();

    let r = sqlx::query(
        "INSERT INTO payments (client_id, amount, payment_date, observations) VALUES (?, ?, ?, ?)",
    )
    .bind(payment.client_id)
    .bind(payment.amount)
    .bind(payment.payment_date)
    .bind(payment.observations);

    let a = r.execute(&mut conn).await.unwrap();

    Ok(a.last_insert_rowid().try_into().unwrap())
}

fn create_student_query<'a>(
    record: Client,
    grade_id: u8,
) -> sqlx::query::Query<'a, sqlx::Sqlite, sqlx::sqlite::SqliteArguments<'a>> {
    sqlx::query("INSERT INTO client (name, last_name, dni, date_of_birth, place_of_birth, address, phones, repetitive, coming_from, payments, filed, grade_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)")
            .bind(record.name)
            .bind(record.last_name)
            .bind(record.dni)
            .bind(record.date_of_birth)
            .bind(record.place_of_birth)
            .bind(record.address)
            .bind(record.phones)
            .bind(record.repetitive)
            .bind(record.coming_from)
            .bind(record.payments)
            .bind(record.filed)
            .bind(grade_id)
}

#[tauri::command]
async fn create_student(state: tauri::State<'_, State>, student: Client) -> Result<i64, String> {
    let state = state.clone();
    let pool = state.conn.lock().await;
    let mut conn = pool.acquire().await.unwrap();

    let grade_id = student.grade_id;

    let query = create_student_query(student, grade_id);
    let a = query.execute(&mut conn).await.unwrap();

    Ok(a.last_insert_rowid())
}

#[tauri::command]
async fn add_grade(state: tauri::State<'_, State>, grade: Grade) -> Result<i64, String> {
    let state = state.clone();
    let pool = state.conn.lock().await;
    let mut conn = pool.acquire().await.unwrap();

    let r = sqlx::query("INSERT INTO grade (name, color) VALUES (?, ?)")
        .bind(grade.name)
        .bind(grade.color);

    let a = r.execute(&mut conn).await.unwrap();

    Ok(a.last_insert_rowid())
}

#[tauri::command]
async fn get_grades(state: tauri::State<'_, State>) -> Result<Vec<Grade>, String> {
    let state = state.clone();
    let pool = state.conn.lock().await;
    let mut conn = pool.acquire().await.unwrap();

    sqlx::query_as::<_, Grade>("SELECT * from grade")
        .fetch_all(&mut conn)
        .await
        .map_err(|_| "Error".into())
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn get_clients(state: tauri::State<'_, State>) -> Result<Vec<Client>, String> {
    let state = state.clone();
    let pool = state.conn.lock().await;
    let mut conn = pool.acquire().await.unwrap();

    let result = sqlx::query_as::<_, Client>("SELECT * from client")
        .fetch_all(&mut conn)
        .await;

    match result {
        Ok(rows) => Ok(rows),
        Err(err) => Err(err.to_string()),
    }
}

/**
 * 1. ID
 * 2. Name
 * 3. Last name
 * 4. Document
 * 5. Date of birth
 * 6. Place of birth
 * 7. Addresns
 * 8. Phones
 * 9. Coming from
 * 10. Repitent
 * 11. Payments (exclude for now)
 * 12. Observations
 */
#[tauri::command]
async fn import_clients(
    state: tauri::State<'_, State>,
    path: String,
    grade_id: String,
) -> Result<(), String> {
    let pool = state.conn.lock().await;

    let tx = pool.begin().await;

    if tx.is_err() {
        return Err("Error initialisating transaction".to_string());
    }

    let mut tx = tx.unwrap();

    let csv_content = fs::read_to_string(path);

    if csv_content.is_err() {
        return Err("Error reading file".to_owned());
    }

    let csv_content = csv_content.unwrap();

    let mut reader = ReaderBuilder::new()
        .delimiter(b';')
        .from_reader(csv_content.as_bytes());

    for result in reader.deserialize() {
        let record: Client = result.expect("Fatal error");

        sqlx::query("INSERT INTO client (name, last_name, dni, date_of_birth, place_of_birth, address, phones, repetitive, coming_from, payments, filed, grade_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)")
            .bind(record.name)
            .bind(record.last_name)
            .bind(record.dni)
            .bind(record.date_of_birth)
            .bind(record.place_of_birth)
            .bind(record.address)
            .bind(record.phones)
            .bind(record.repetitive)
            .bind(record.coming_from)
            .bind(record.payments)
            .bind(record.filed)
            .bind(grade_id.parse::<u8>().unwrap())
            .execute(&mut tx)
            .await
            .unwrap();
    }

    let commit_result = tx.commit().await;

    match commit_result {
        Ok(_) => Ok(()),
        Err(_) => Err("Transaction failed".to_owned()),
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    dotenv().ok();
    let db_uri = env::var("DATABASE_URL").unwrap();
    let conn = SqlitePool::connect(&db_uri).await?;
    let conn = Arc::new(Mutex::new(conn));

    tauri::Builder::default()
        .manage(State { conn })
        .invoke_handler(tauri::generate_handler![
            get_clients,
            import_clients,
            create_student,
            add_grade,
            get_grades,
            add_payment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");

    Ok(())
}
