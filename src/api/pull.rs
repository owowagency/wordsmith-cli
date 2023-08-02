use std::vec;

use crate::api::models::pull::PullResponse;

use super::{WordsmithClient, BASE_URL, WordsmithError};

impl WordsmithClient {
    pub async fn pull(&self, project_id: u32, file_type: &str, locale: &str, tags: Option<&[String]>,) -> Result<Vec<u8>, WordsmithError> {
        let url = format!("{BASE_URL}/projects/{project_id}/translations/pull");
        let mut query: Vec<(String, String)> = vec![];

        query.push(("language".to_string(), locale.to_string()));
        query.push(("file_type".to_string(), file_type.to_string()));

        let default_tags = vec![];
        let tags = tags.unwrap_or(&default_tags);

        for tag in tags {
            query.push(("tags[]".to_string(), tag.to_string()));
        }

        let request = self.client.get(url).query(&query).build()?;
        let response: PullResponse = self.execute(request).await?;
        self.download(&response.url).await
    }
}