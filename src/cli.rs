use clap::{command, Parser, Subcommand, Args};

use crate::environment::{Environment, AccessToken};

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct CommandLine {
    #[command(subcommand)]
    pub command: Command,
}

#[derive(Subcommand)]
pub enum Command {
    List(ListArgs),
    Pull(PullArgs),
    Push(PushArgs),
}

#[derive(Debug, Args)]
pub struct GlobalArgs {
    #[arg(short, long, default_value = "wordsmith.yml", value_parser = clap::value_parser!(Environment))]
    pub env: Environment,
    #[arg(long)]
    pub access_token: Option<AccessToken>,
    /// Enable verbose logging
    #[arg(long, default_value_t = false)]
    pub verbose: bool
}

#[derive(Debug, Args)]
pub struct ListArgs {
    #[clap(flatten)]
    pub global: GlobalArgs,
}

#[derive(Debug, Args)]
pub struct PushArgs {
    #[clap(flatten)]
    pub global: GlobalArgs,
    /// Overwrites existing strings
    #[arg(short = 'f', long = "force", default_value_t = false)]
    pub overwrite: bool,
    /// Verify translations
    #[arg(short, long, default_value_t = false)]
    pub verify: bool,
    #[arg(short = 'd', long = "dry-run", default_value_t = false)]
    pub dry_run: bool,
}

pub trait HasAccessToken {
    fn access_token(&self) -> AccessToken;
}

impl HasAccessToken for ListArgs {
    fn access_token(&self) -> AccessToken {
        match &self.global.access_token {
            Some(token) => token.clone(),
            None => self.global.env.token.clone(),
        }
    }
}

impl HasAccessToken for PushArgs {
    fn access_token(&self) -> AccessToken {
        match &self.global.access_token {
            Some(token) => token.clone(),
            None => self.global.env.token.clone(),
        }
    }
}

#[derive(Debug, Args)]
pub struct PullArgs {
    #[clap(flatten)]
    pub global: GlobalArgs,
    #[arg(short = 'd', long = "dry-run", default_value_t = false)]
    pub dry_run: bool,
}

impl HasAccessToken for PullArgs {
    fn access_token(&self) -> AccessToken {
        match &self.global.access_token {
            Some(token) => token.clone(),
            None => self.global.env.token.clone(),
        }
    }
}
