use std::vec;

use crate::{api::models::pull::PullResponse, environment::Target};

use super::{WordsmithClient, WordsmithError};

impl WordsmithClient {
    pub async fn pull(
        &self, 
        project_id: u32, 
        target: &Target,
        locale: &str
    ) -> Result<Vec<u8>, WordsmithError> {
        let url = WordsmithClient::format_url(&format!("projects/{project_id}/translations/pull"))?;
        let mut query: Vec<(String, String)> = vec![];

        query.push(("language".to_string(), locale.to_string()));
        query.push(("file_type".to_string(), target.file_type.to_string()));

        for tag in target.tags.iter() {
            query.push(("tags[]".to_string(), tag.0.clone()));
        }

        for (key, any) in target.extras.iter() {
            query.push((key.clone(), any.to_string()));
        }  

        let request = self.client.get(url).query(&query).build()?;
        let response: PullResponse = self.execute(request).await?;
        self.download(&response.url).await
    }
}