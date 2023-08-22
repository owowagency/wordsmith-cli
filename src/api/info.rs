use super::{BASE_URL, WordsmithClient, WordsmithError, models::project::ProjectResponse};

impl WordsmithClient {
    pub async fn info(&self, project_id: u32) -> Result<ProjectResponse, WordsmithError> {
        let url = format!("{BASE_URL}/projects/{project_id}");
        let request = self.client.get(url).build()?;
        self.execute(request).await
    }
}