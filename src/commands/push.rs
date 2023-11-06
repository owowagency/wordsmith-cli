use async_trait::async_trait;
use futures::future::try_join_all;
use log::{info, error, debug, warn};

use crate::{cli::{PushArgs, HasAccessToken}, api::{WordsmithClient, WordsmithError}, environment::{Target, TargetType}, commands::helpers::get_locales};

use super::{Execute, helpers::TargetFile};

impl PushArgs {
    async fn try_push_all<'a>(
        &self,
        client: &WordsmithClient,
        target: &TargetFile<'a>,
        locales: &[String],
        dry_run: bool,
    ) -> Result<(), WordsmithError> {
        let mut pull_tasks = vec![];

        for locale in locales.iter() {
            let task = self.try_push_locale(
                client,
                target,
                locale.clone(),
                dry_run,
            );
            pull_tasks.push(task);
        }

        try_join_all(pull_tasks).await?;

        Ok(())
    }

    async fn try_push_locale<'a>(
        &self,
        client: &WordsmithClient,
        target: &TargetFile<'a>,
        locale: String,
        dry_run: bool,
    ) -> Result<(), WordsmithError> {
        let output_path = target.target_path(&locale);
        info!("Pushing {:?} [{}]", output_path, locale);
        if !dry_run {
            let result = match target.read(&locale).await {
                Err(_) => {
                    warn!("Failed to read locale {:?} from {}", locale, output_path);
                    Ok(())
                }
                Ok(data) => client.push(
                    self.global.env.project_id,
                    &target.target,
                    &locale,
                    &data,
                    self.overwrite,
                    self.verify,
                ).await
            };

            match result {
                Err(e) => return Err(WordsmithError::Push { file: output_path, locale, cause: Box::new(e) }),
                Ok(_) => {},
            };
        }

        Ok(())
    }
}

#[async_trait]
impl Execute for PushArgs {
    async fn execute(&self) -> Result<(), WordsmithError> {
        let targets: Vec<&Target> = self.global.env.targets
            .iter()
            .filter(|target| target.types.contains(&TargetType::Push))
            .collect();

        if targets.is_empty() {
            return Ok(());
        }

        let client = WordsmithClient::new(Some(&self.access_token()))?;

        debug!("Fetching project info for: {}", self.global.env.project_id);
        let project = client.info(self.global.env.project_id).await?;
        let mut pull_tasks = vec![];

        for target in targets {
            let task = async {
                let local_target = target.clone();
                let locales = get_locales(&project, &local_target);
                let file_target = TargetFile::from(&project, &local_target);
                self.try_push_all(&client, &file_target, &locales, self.dry_run).await
            };

            pull_tasks.push(task);
        }

        try_join_all(pull_tasks).await?;

        Ok(())
    }
}
