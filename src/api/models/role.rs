use serde::Deserialize;

#[derive(Deserialize)]
pub struct RoleResponse {
    pub id: u64,
    pub name: Option<String>
}