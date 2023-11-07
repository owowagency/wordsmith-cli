use serde::Deserialize;

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProjectData {
    pub id: u32,
    pub name: String,
    pub description: Option<String>,
    pub default_language: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ListProjectsResponse {
    pub id: u32,
    pub name: String,
    pub projects: Vec<ProjectData>,
}

