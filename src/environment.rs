use std::{str::FromStr, fs::File, path::Path};

use serde::{Serialize, Deserialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Environment {
    pub project_id: u32,
    pub token: String,
    #[serde(default)]
    pub targets: Vec<Target>
}

fn map_serde_yml_error(input: &str, err: &serde_yaml::Error) -> String {
    if let Some(location) = err.location() {
        format!("{} in {} {}:{}",err.to_string(), input, location.line(), location.column())
    } else {
        format!("{} in {}", err.to_string(), input)
    }
}

impl FromStr for Environment {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let path = Path::new(s);
        let file = File::open(path).map_err(|err| err.to_string())?;
        serde_yaml::from_reader(file).map_err(|err| map_serde_yml_error(s, &err))
    }
}

#[derive(PartialEq, Debug, Clone, Serialize, Deserialize)]
pub enum TargetType {
    #[serde(rename = "push")]
    Push,
    #[serde(rename = "pull")]
    Pull
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Target {
    pub file: String,
    pub default_locale_override: Option<String>,
    pub types: Vec<TargetType>,
    pub args: TargetArgs,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetArgs {
    pub file_type: String,
    pub locales: Option<Vec<String>>,
    pub tags: Option<Vec<String>>
}