use std::{str::FromStr, fs::File, path::Path};

use serde::{Serialize, Deserialize, Serializer, Deserializer};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
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
#[serde(rename_all = "kebab-case")]
pub struct Target {
    pub file: String,
    pub default_locale_override: Option<String>,
    pub types: Vec<TargetType>,
    pub args: TargetArgs,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct TargetArgs {
    pub file_type: String,
    pub locales: Option<Vec<String>>,
    pub tags: Option<Vec<Tag>>
}

#[derive(Debug, Clone)]
pub struct Tag(pub String);

impl Into<String> for Tag {
    fn into(self) -> String {
        self.0
    }
}

impl Serialize for Tag {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_newtype_struct("Tag", &self.0)
    }
}

impl<'de> Deserialize<'de> for Tag {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
        D: Deserializer<'de> {
        #[derive(Deserialize)]
        struct UncheckedTag(String);

        let tag = UncheckedTag::deserialize(deserializer)?;

        if tag.0.is_empty() {
            return Err(serde::de::Error::custom("Tag may not be empty"));
        }

        if tag.0.chars().any(|c| !c.is_alphanumeric()) {
            return Err(serde::de::Error::custom(format!("Tag {} is not alphanumeric", tag.0)));
        }

        Ok(Tag(tag.0))
    }
}

#[test]
fn test_tag_deserialization() {
    assert!(serde_yaml::from_str::<Tag>("").is_err());
    assert!(serde_yaml::from_str::<Tag>("non-alphanumeric").is_err());
    assert!(serde_yaml::from_str::<Tag>("valid").is_ok());
    assert_eq!(serde_yaml::from_str::<Tag>("valid").expect("Should be ok").0, "valid".to_string());
}