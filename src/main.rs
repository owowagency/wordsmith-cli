#![cfg_attr(feature = "strict", deny(warnings))]

use clap::Parser;
use cli::CommandLine;
use commands::Execute;
use log::error;

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