use reqwest::multipart::{Form, Part};

use crate::environment::Tag;

use super::{WordsmithClient, WordsmithError};

impl WordsmithClient {
    pub async fn push(
        &self, 
        project_id: u32, 
        file_type: &str, 
        locale: &str,
        tags: Option<&[Tag]>,
        data: &[u8],
        overwrite_existing_values: bool,
        verify_translations: bool,
    ) -> Result<(), WordsmithError> {
        let url = WordsmithClient::format_url(&format!("projects/{project_id}/translations/push"))?;
        let part = Part::bytes(data.to_owned()).file_name("testing.xml");
        let mut form = Form::new()
            .part("file", part)
            .text("file_type", file_type.to_string())
            .text("language", locale.to_string())
            .text("overwrite_existing_values", Into::<u8>::into(overwrite_existing_values).to_string())
            .text("verify_translations", Into::<u8>::into(verify_translations).to_string());

        if let Some(tags) = tags {
            for tag in tags {
                form = form.text("tags[]", tag.0.clone());
            }
        }

        let request = self.client.post(url).multipart(form).build()?;
        self.execute_no_content(request).await
    }
}