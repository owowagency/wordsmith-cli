use async_trait::async_trait;
use futures::future::try_join_all;
use log::{info, error};

use crate::{cli::PullArgs, api::{WordsmithClient, WordsmithError}, environment::{Target, TargetType}, commands::helpers::get_locales};

use super::{Execute, helpers::TargetFile};

impl PullArgs {
    async fn try_pull_all(
        &self, client: &WordsmithClient, 
        target: &TargetFile,
        tags: Option<&[String]>,
        locales: &Vec<String>,
    ) -> Result<(), WordsmithError> {
        let mut pull_tasks = vec![];

        for locale in locales.iter() {
            let task = self.try_pull_locale(
                &client, 
                &target,
                tags,
                locale.clone(), 
            );
            pull_tasks.push(task);            
        }

        try_join_all(pull_tasks).await?;

        Ok(())
    }

    async fn try_pull_locale(
        &self, 
        client: &WordsmithClient, 
        target: &TargetFile,
        tags: Option<&[String]>,
        locale: String,
    ) -> Result<(), WordsmithError> {
        let output_path = target.target_path(&locale);
        info!("Pulling {:?} [{}]", output_path, locale);
        let result = {
            let data = client.pull(self.global.env.project_id, &target.r#type, &locale, tags).await?;
            target.write(&locale, &data).await
        };

        if let Err(_) = result {
            error!("Failed to pull locale {:?} into {}", locale, output_path)
        }

        result
    }
}



#[async_trait]
impl Execute for PullArgs {
    async fn execute(&self) -> Result<(), WordsmithError> {
        let targets: Vec<&Target> = self.global.env.targets
            .iter()
            .filter(|target| target.types.contains(&TargetType::Pull))
            .collect();

        if targets.is_empty() {
            return Ok(());
        }
        
        let client = WordsmithClient::new(Some(&self.global.env.token))?;
        
        info!("Fetching project info for: {}", self.global.env.project_id);
        let project = client.info(self.global.env.project_id).await?;
        let mut pull_tasks = vec![];

        for target in targets {
            let task = async {
                let local_target = target.clone();
                let locales = get_locales(&project, &local_target);
                let file_target = TargetFile::from(&project, &local_target);
                self.try_pull_all(&client, &file_target, target.args.tags.as_deref(), &locales).await
            };
            
            pull_tasks.push(task);
        }

        try_join_all(pull_tasks).await?;

        Ok(())
    }
}