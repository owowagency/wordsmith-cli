use async_trait::async_trait;
use log::info;

use crate::{cli::{ListArgs, HasAccessToken}, api::{WordsmithClient, WordsmithError}};

use super::Execute;

#[async_trait]
impl Execute for ListArgs {
    async fn execute(&self) -> Result<(), WordsmithError> {
        let client = WordsmithClient::new(Some(&self.access_token()))?;

        info!("Fetching projects");
        let company = client.list().await?;

        info!("Found {} projects for \"{}\"", company.projects.len(), company.name);

        let id_width = company.projects.iter().map(|p| p.id.to_string().len()).max().unwrap_or(2).max(2);
        let name_width = company.projects.iter().map(|p| p.name.len()).max().unwrap_or(4);

        let term_width = term_size::dimensions().map(|(w, _)| w).unwrap_or(80);

        println!(
            "{:id_width$}   {:name_width$}  {:default_lang_width$}  {}",
            "ID", "Name", "Default lang", "Description",
            id_width = id_width, name_width = name_width, default_lang_width = 12
        );
        for project in company.projects {
            let description = project.description.unwrap_or("-".to_string());
            let truncated_description = if description.len() > term_width - id_width - name_width - 12 - 6 {
                let mut truncated_description = description[..term_width - id_width - name_width - 12 - 6 - 4].to_string();
                truncated_description.push_str("...");
                truncated_description
            } else {
                description.to_string()
            };
            println!(
                "{:id_width$}.  {:name_width$}  {:default_lang_width$}  {}",
                project.id, project.name, project.default_language, truncated_description,
                id_width = id_width, name_width = name_width, default_lang_width = 12
            );
        }

        Ok(())
    }
}
