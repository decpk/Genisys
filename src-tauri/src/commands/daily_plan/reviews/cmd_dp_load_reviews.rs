use crate::commands::AppState;
use crate::database::load_dp_reviews_db;
use crate::types::DPReview;
use tauri::State;

#[tauri::command]
pub fn cmd_dp_load_reviews(
    state: State<'_, AppState>,
    start_date: String,
    end_date: String,
) -> Vec<DPReview> {
    load_dp_reviews_db(&state.db, &start_date, &end_date)
}
