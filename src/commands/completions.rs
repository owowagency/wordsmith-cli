use std::fs::File;
use std::io::Write;
use std::path::Path;

use async_trait::async_trait;
use clap::{CommandFactory, Args};
use clap_complete::{Generator, generate, shells};
use crate::api::WordsmithError;
use crate::cli::CommandLine;
use super::Execute;


#[async_trait]
impl Execute for GenerateCompletionsArgs {
    async fn execute(&self) -> Result<(), WordsmithError> {
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
pub struct GenerateCompletionsArgs {
    #[arg(short, long)]
    pub shell: Variant,
    #[arg(short, long)]
    pub output: String,
}

#[derive(Clone, Debug, clap::ValueEnum)]
pub enum Variant {
    Bash,
    Fish,
    Zsh,
    Powershell,
}