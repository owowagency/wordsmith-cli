use crate::api::models::list::ListResponse;

use super::{WordsmithClient, WordsmithError};

impl WordsmithClient {
    pub async fn list(&self) -> Result<ListResponse, WordsmithError> {
        let url = WordsmithClient::format_url(&format!("projects"))?;
        let request = self.client.get(url).build()?;
        self.execute(request).await
    }
}
