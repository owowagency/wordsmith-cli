use std::vec;

use log::warn;

use super::{WordsmithClient, WordsmithError, models::project::ProjectResponse};

impl WordsmithClient {
    pub async fn info(&self, project_id: u32) -> Result<ProjectResponse, WordsmithError> {
        let mocked = ProjectResponse {
            default_locale: Some("en".to_string()),
            locales: Some(vec!["en".to_string(), "nl".to_string(), "fr".to_string()])
        };

        warn!("Mocking response for GET /projects/{} -> {:?}", project_id, mocked);

        Ok(mocked)
    }
}