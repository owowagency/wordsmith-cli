use super::{WordsmithClient, WordsmithError, models::project::ProjectResponse};

impl WordsmithClient {
    pub async fn info(&self, project_id: u32) -> Result<ProjectResponse, WordsmithError> {
        let url = WordsmithClient::format_url(&format!("projects/{project_id}"))?;
        let request = self.client.get(url).build()?;
        self.execute(request).await
    }
}