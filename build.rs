use std::{process::Command, error::Error};

fn main() {
    // Set environment variables from {profile}.env
    println!("cargo:rerun-if-env-changed=PROFILE");
    let profile = std::env::var("PROFILE").unwrap_or("debug".to_string());
    let path = format!("{profile}.env");
    println!("cargo:rerun-if-changed={path}");

    let path = dotenv::from_filename(path).unwrap();
    dotenv::from_path(path).unwrap();

    for (key, value) in dotenv::vars() {
        println!("cargo:rustc-env={key}={value}");
    }

    // Set CARGO_PKG_VERSION based on git tag
    let version = if profile == "release" {
        println!("cargo:rerun-if-changed=.git/");
        match get_version() {
            Ok(version) => version,
            Err(err) => {
                println!("cargo:warning=Failed to generate version based on git tag and commit hash, falling back to 0.0.0-release (cause: {})", err);
                "0.0.0-release".to_string()
            }
        }
    } else {
         "0.0.0-dev".to_string()
    };
    let user_agent = format!("Wordsmith CLI {}", version);
    println!("cargo:rustc-env=USER_AGENT={}", user_agent);
    println!("cargo:rustc-env=CARGO_PKG_VERSION={}", version);
}

fn get_tag() -> Result<String, Box<dyn Error>> {
    let output = Command::new("git").args(vec!["describe", "--tags"]).output()?;
    let tag = String::from_utf8(output.stdout)?.trim().to_string();
    if tag.is_empty() {
        return Err("Git tag is empty".into())
    }

    Ok(tag)
}

fn get_commit_hash() -> Result<String, Box<dyn Error>> {
    let output = Command::new("git").args(vec!["rev-parse", "--short", "HEAD"]).output()?;
    let commit_hash = String::from_utf8(output.stdout)?.trim().to_string();

    if commit_hash.is_empty() {
        return Err("Git tag is empty".into())
    }

    Ok(commit_hash)
}

fn get_version() -> Result<String, Box<dyn Error>> {
    let tag = get_tag()?;
    let commit_hash = get_commit_hash()?;
    
    Ok(format!("{} [{}]", tag, commit_hash))
}