use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
pub struct ProjectResponse {
    pub default_locale: Option<String>,
    pub locales: Option<Vec<String>>
}