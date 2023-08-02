use clap::{command, Parser, Subcommand, Args};
use log::LevelFilter;

use crate::environment::Environment;
#[cfg(feature = "generate-completions")]
use crate::commands::completions::GenerateCompletionsArgs;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
pub struct CommandLine {
    #[command(subcommand)]
    pub command: Command,
}

impl CommandLine {
    pub fn setup_logging(&self) {
        let filter = match &self.command {
            Command::Pull(args) if args.global.verbose => LevelFilter::Debug,
            Command::Push(args) if args.global.verbose => LevelFilter::Debug,
            _ => LevelFilter::Info,
        };
        env_logger::Builder::new().filter_level(filter).init();
    }
}

#[derive(Subcommand)] 
pub enum Command {
    Pull(PullArgs),
    Push(PushArgs),
    #[cfg(feature = "generate-completions")]
    Generate(GenerateCompletionsArgs)
}

#[derive(Debug, Args)]
pub struct GlobalArgs {
    #[arg(short, long, default_value = "wordsmith.yml", value_parser = clap::value_parser!(Environment))]
    pub env: Environment,
    /// Enable verbose logging
    #[arg(long, default_value_t = false)]
    pub verbose: bool
}

#[derive(Debug, Args)]
pub struct PushArgs {
    #[clap(flatten)]
    pub global: GlobalArgs,
    /// Overwrites existing strings
    #[arg(short = 'f', long = "force", default_value_t = false)]
    pub overwrite: bool,
    /// Verify translations ???
    #[arg(short, long, default_value_t = false)]
    pub verify: bool,
}

#[derive(Debug, Args)]
pub struct PullArgs {
    #[clap(flatten)]
    pub global: GlobalArgs,
}