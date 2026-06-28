mod detect_api_key;
mod detect_aws_credential;
mod detect_connection_string;
mod detect_credit_card;
mod detect_env_secret;
mod detect_jwt_token;
mod detect_password;
mod detect_private_key;
mod detect_ssn;

pub use detect_api_key::detect_api_key;
pub use detect_aws_credential::detect_aws_credential;
pub use detect_connection_string::detect_connection_string;
pub use detect_credit_card::detect_credit_card;
pub use detect_env_secret::detect_env_secret;
pub use detect_jwt_token::detect_jwt_token;
pub use detect_password::detect_password;
pub use detect_private_key::detect_private_key;
pub use detect_ssn::detect_ssn;
