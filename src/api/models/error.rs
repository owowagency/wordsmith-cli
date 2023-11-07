use std::{fmt::Display, collections::HashMap};

use serde::Deserialize;

#[derive(Deserialize, Debug)]
pub struct ApiError {
    pub message: String,
    #[serde(default)]
    pub errors: HashMap<String, Vec<String>>
}

impl Display for ApiError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_fmt(format_args!("{:?}", self.message))?;

        for (key, values) in self.errors.iter() {
            f.write_fmt(format_args!("\n- \x1b[1m{}\x1b[0m:", key))?;

            if values.len() == 1 {
                f.write_fmt(format_args!(" {}", values[0]))?;
            } else {
                for message in values.iter() {
                    f.write_fmt(format_args!("\n  - {}", message))?;
                }
            }
        }

        Ok(())
    }
}