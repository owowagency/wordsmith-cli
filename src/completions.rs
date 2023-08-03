use std::fs::File;
use std::io::Write;
use std::path::Path;

mod cli;
mod environment;
mod commands;
mod api;

use api::WordsmithError;
use clap::{CommandFactory, Args, Parser};
use clap_complete::{Generator, generate, shells};
use cli::CommandLine;
use log::error;

#[derive(Parser)]
#[command(author, version, about, long_about = None)]
struct GenerateCli {
    #[arg(short, long)]
    shell: Variant,
    #[arg(short, long)]
    output: String,
}


impl GenerateCli {
    fn execute(&self) -> Result<(), WordsmithError> {
        let path = Path::new(&self.output);
        let mut output = File::create(path)?;

        match self.shell {
            Variant::Bash => generate_completion(shells::Bash, &mut output),
            Variant::Fish => generate_completion(shells::Fish, &mut output),
            Variant::Zsh => generate_completion(shells::Zsh, &mut output),
            Variant::Powershell => generate_completion(shells::PowerShell, &mut output),
        };

        Ok(())
    }
}

pub fn generate_completion<G: Generator>(shell: G, buf: &mut dyn Write) {
    let mut command = CommandLine::command();
    generate(
        shell,
        &mut command,
        env!("CARGO_BIN_NAME"),
        buf,
    );
}

#[derive(Debug, Args)]
struct GenerateCompletionsArgs {
    #[arg(short, long)]
    pub shell: Variant,
    #[arg(short, long)]
    pub output: String,
}

#[derive(Clone, Debug, clap::ValueEnum)]
enum Variant {
    Bash,
    Fish,
    Zsh,
    Powershell,
}

fn main() {
    let app = GenerateCli::parse();
    match app.execute() {
        Ok(_) => {},
        Err(err) => error!("Failed to generate completions, cause: {}", err),
    };
}