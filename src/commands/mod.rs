use async_trait::async_trait;

use crate::{cli::Command, api::WordsmithError};

mod pull;
mod push;
mod helpers;
#[cfg(feature = "generate-completions")]
pub mod completions;

#[async_trait]
pub trait Execute {
    async fn execute(&self) -> Result<(), WordsmithError>;
}

#[async_trait]
impl Execute for Command {
    async fn execute(&self) -> Result<(), WordsmithError> {
        match self {
            Command::Pull(args) => args.execute().await?,
            Command::Push(args) => args.execute().await?,
            #[cfg(feature = "generate-completions")]
            Command::Generate(args) => args.execute().await?,
        };

        Ok(())
    }
}