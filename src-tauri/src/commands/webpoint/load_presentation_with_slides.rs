use crate::commands::AppState;
use crate::database::load_presentation_with_slides_db;
use crate::types::PresentationWithSlides;
use tauri::State;

#[tauri::command]
pub fn cmd_load_presentation_with_slides(
    state: State<'_, AppState>,
    presentation_id: String,
) -> Option<PresentationWithSlides> {
    load_presentation_with_slides_db(&state.db, &presentation_id)
}
