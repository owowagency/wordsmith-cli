use reqwest::multipart::{Form, Part};

use crate::environment::Target;

use super::{WordsmithClient, WordsmithError};

impl WordsmithClient {
    pub async fn push(
        &self, 
        project_id: u32, 
        target: &Target,
        locale: &str,
        data: &[u8],
        overwrite_existing_values: bool,
        verify_translations: bool,
    ) -> Result<(), WordsmithError> {
        let url = WordsmithClient::format_url(&format!("projects/{project_id}/translations/push"))?;
        let part = Part::bytes(data.to_owned()).file_name("testing.xml");
        let mut form = Form::new()
            .part("file", part)
            .text("file_type", target.file_type.to_string())
            .text("language", locale.to_string())
            .text("overwrite_existing_values", Into::<u8>::into(overwrite_existing_values).to_string())
            .text("verify_translations", Into::<u8>::into(verify_translations).to_string()); 

        for tag in target.tags.iter() {
            form = form.text("tags[]", tag.0.clone());
        }

        for (key, any) in target.extras.iter() {
            form = form.text(key.clone(), any.to_string());
        }  

        let request = self.client.post(url).multipart(form).build()?;
        self.execute_no_content(request).await
    }
}