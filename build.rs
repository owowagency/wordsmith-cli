use std::{process::Command, error::Error};

fn main() {
    // Set environment variables from {profile}.env
    println!("cargo:rerun-if-env-changed=PROFILE");
    println!("cargo:rerun-if-env-changed=WORDSMITH_BASE_URL");
    let profile = std::env::var("PROFILE").unwrap_or("debug".to_string());

    if profile == "release" {    
        let base_url = std::env::var("WORDSMITH_BASE_URL").expect("Missing WORDSMITH_BASE_URL env variable!");
        let version = std::env::var("WORDSMITH_CLI_VERSION").expect("Missing WORDSMITH_CLI_VERSION env variable!");
        let commit_hash = get_commit_hash().expect("Failed to get commit hash");
        let version = format!("{} [{}]", version, commit_hash);
        let user_agent = format!("Wordsmith CLI {}", version);
        println!("cargo:rustc-env=WORDSMITH_BASE_URL={}", base_url);
        println!("cargo:rustc-env=USER_AGENT={}", user_agent);
        println!("cargo:rustc-env=CARGO_PKG_VERSION={}", version);
    } else {
        let base_url =  std::env::var("WORDSMITH_BASE_URL").unwrap_or("http://localhost:8000".to_string());
        let version = "0.0.0";
        let user_agent = format!("Wordsmith CLI {}", version);
        println!("cargo:rustc-env=WORDSMITH_BASE_URL={}", base_url);
        println!("cargo:rustc-env=USER_AGENT={}", user_agent);
        println!("cargo:rustc-env=CARGO_PKG_VERSION={}", version);
    }
}

fn get_commit_hash() -> Result<String, Box<dyn Error>> {
    let output = Command::new("git").args(vec!["rev-parse", "--short", "HEAD"]).output()?;
    let commit_hash = String::from_utf8(output.stdout)?.trim().to_string();

    if commit_hash.is_empty() {
        return Err("Git tag is empty".into())
    }

    Ok(commit_hash)
}
