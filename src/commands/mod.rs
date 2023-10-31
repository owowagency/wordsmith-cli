use async_trait::async_trait;

use crate::{cli::Command, api::WordsmithError};

mod list_projects;
mod pull;
mod push;
mod helpers;

#[async_trait]
pub trait Execute {
    async fn execute(&self) -> Result<(), WordsmithError>;
}

#[async_trait]
impl Execute for Command {
    async fn execute(&self) -> Result<(), WordsmithError> {
        match self {
            Command::ListProjects(args) => args.execute().await?,
            Command::Pull(args) => args.execute().await?,
            Command::Push(args) => args.execute().await?,
        };

        Ok(())
    }
}
