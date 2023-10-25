use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PushRequest {
    pub file_type: String,
    pub file: String,
}
