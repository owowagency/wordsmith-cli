use serde::{Serialize, Deserialize};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PullRequest {
    pub file_type: String,
    // pub tags: Vec<String>,
    #[serde(rename = "language")]
    pub locale: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PullResponse {
    pub url: String,
    pub file_name: String,
}

