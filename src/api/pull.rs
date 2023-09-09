use std::vec;

use crate::{api::models::pull::PullResponse, environment::Tag};

use super::{WordsmithClient, WordsmithError};

impl WordsmithClient {
    pub async fn pull(&self, project_id: u32, file_type: &str, locale: &str, tags: Option<&[Tag]>,) -> Result<Vec<u8>, WordsmithError> {
        let url = WordsmithClient::format_url(&format!("projects/{project_id}/translations/pull"))?;
        let mut query: Vec<(String, String)> = vec![];

        query.push(("language".to_string(), locale.to_string()));
        query.push(("file_type".to_string(), file_type.to_string()));

        if let Some(tags) = tags {
            for tag in tags {
                query.push(("tags[]".to_string(), tag.0.clone()));
            }
        }

        let request = self.client.get(url).query(&query).build()?;
        let response: PullResponse = self.execute(request).await?;
        self.download(&response.url).await
    }
}