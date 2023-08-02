use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PullResponse {
    pub url: String,
    pub file_name: String,
}

