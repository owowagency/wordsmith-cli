use std::fmt::Display;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct ApiError {
    pub message: String,
}

impl Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.message)
    }
}