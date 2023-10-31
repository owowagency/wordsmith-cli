use async_trait::async_trait;
use log::info;

use comfy_table::{Table, ContentArrangement};
use comfy_table::presets::UTF8_FULL;
use comfy_table::modifiers::UTF8_ROUND_CORNERS;

use crate::{cli::{ListArgs, HasAccessToken}, api::{WordsmithClient, WordsmithError}};

use super::Execute;

#[async_trait]
impl Execute for ListArgs {
    async fn execute(&self) -> Result<(), WordsmithError> {
        let client = WordsmithClient::new(Some(&self.access_token()))?;

        info!("Fetching projects");
        let company = client.list().await?;

        info!("Found {} projects for \"{}\"", company.projects.len(), company.name);

        let mut table = Table::new();
        table
            .load_preset(UTF8_FULL)
            .apply_modifier(UTF8_ROUND_CORNERS)
            .set_content_arrangement(ContentArrangement::Dynamic)
            .set_header(vec!["ID", "Name", "Default lang", "Description"]);

        for project in company.projects {
            table.add_row(vec![
                project.id.to_string(),
                project.name,
                project.default_language,
                project.description.unwrap_or_default(),
            ]);
        }

        println!("{table}");

        Ok(())
    }
}
