#![cfg_attr(feature = "strict", deny(warnings))]

use clap::Parser;
use cli::{CommandLine, Command};
use commands::Execute;
use log::{error, LevelFilter};

mod cli;
mod environment;
mod commands;
mod api;

#[tokio::main]
async fn main() {
    let app = CommandLine::parse();
    app.setup_logging();
    match app.command.execute().await {
        Ok(_) => {},
        Err(err) => error!("{err}"),
    }
}

impl CommandLine {
    pub fn setup_logging(&self) {
        let filter = match &self.command {
            Command::List(args) if args.global.verbose => LevelFilter::Debug,
            Command::Pull(args) if args.global.verbose => LevelFilter::Debug,
            Command::Push(args) if args.global.verbose => LevelFilter::Debug,
            _ => LevelFilter::Info,
        };
        env_logger::Builder::new().filter_level(filter).init();
    }
}
