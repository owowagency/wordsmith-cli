use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectResponse {
    #[serde(rename="defaultLanguage")]
    pub default_locale: String,
    #[serde(rename="languages", default)]
    pub locales: Vec<String>
}