use super::sensitive::{
    detect_api_key, detect_aws_credential, detect_connection_string, detect_credit_card,
    detect_env_secret, detect_jwt_token, detect_password, detect_private_key, detect_ssn,
};
use crate::types::SensitivityMatch;

fn level_priority(level: &str) -> u8 {
    match level {
        "none" => 0,
        "low" => 1,
        "medium" => 2,
        "high" => 3,
        "critical" => 4,
        _ => 0,
    }
}

/// Runs every sensitive-data detector and returns the highest-severity level
/// found plus all matches. Faithful port of the frontend `analyzeSensitivity`
/// orchestrator (detector order and level-prioritization are preserved).
pub fn analyze_sensitivity(text: &str) -> (String, Vec<SensitivityMatch>) {
    if text.trim().is_empty() {
        return ("none".to_string(), Vec::new());
    }

    let mut all = Vec::new();
    all.extend(detect_api_key(text));
    all.extend(detect_private_key(text));
    all.extend(detect_jwt_token(text));
    all.extend(detect_password(text));
    all.extend(detect_credit_card(text));
    all.extend(detect_ssn(text));
    all.extend(detect_connection_string(text));
    all.extend(detect_aws_credential(text));
    all.extend(detect_env_secret(text));

    if all.is_empty() {
        return ("none".to_string(), Vec::new());
    }

    let mut highest = "low".to_string();
    for m in &all {
        if level_priority(&m.level) > level_priority(&highest) {
            highest = m.level.clone();
        }
    }

    (highest, all)
}
