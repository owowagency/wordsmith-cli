use std::fmt::Display;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct ApiError {
    pub message: String,
    #[serde(default)]
    pub errors: Vec<ErrorMessage>
}

#[derive(Deserialize, Debug)]
pub struct ErrorMessage {
    pub name: String,
    pub message: String,
}

impl Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_fmt(format_args!("API Error, message: {}", self.message))?;
        for error in self.errors.iter() {
            f.write_fmt(format_args!("\n{}: {}", error.name, error.message))?;
        }

        Ok(())
    }
}