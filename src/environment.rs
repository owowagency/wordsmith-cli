use std::{str::FromStr, fs::File, path::Path, env, fmt::{Debug, Display}, collections::HashMap};

use serde::{Serialize, Deserialize, Serializer, Deserializer};


#[derive(Clone)]
pub enum AccessToken {
    Env(String),
    Plain(String),
}

impl FromStr for AccessToken {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        if s.starts_with("${{") && s.ends_with("}}") {
            let inner = &s[3..s.len() - 2].trim();
            return Ok(AccessToken::Env(inner.to_string()));
        }

        Ok(AccessToken::Plain(s.to_string()))
    }
}

impl Default for AccessToken {
    fn default() -> Self {
        AccessToken::Env("WORDSMITH_ACCESS_TOKEN".to_string())
    }
}

impl Debug for AccessToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Env(variable) => f.debug_tuple("Env").field(variable).finish(),
            Self::Plain(_) => f.debug_tuple("Plain").field(&"********").finish(),
        }
    }
}

impl Display for AccessToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AccessToken::Env(variable) => f.write_fmt(format_args!("${{{{ {} }}}}", variable)),
            AccessToken::Plain(_) => f.write_str("********"),
        }
    }
}

fn get_env_var(name: &str) -> Result<String, String> {
    match env::var(name) {
        Ok(var) => Ok(var),
        Err(err) => Err(format!("{err} [{name}]")),
    }
}

impl AccessToken {
    pub fn get_token(&self) -> Result<String, String> {
        match self {
            AccessToken::Env(variable) => get_env_var(&variable),
            AccessToken::Plain(token) => Ok(token.to_string()),
        }
    }
}

impl Serialize for AccessToken {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        match self {
            AccessToken::Env(variable) => serializer.serialize_str(&format!("${{ {variable} }}")),
            AccessToken::Plain(token) => serializer.serialize_str(token),
        }
    }
}

impl<'de> Deserialize<'de> for AccessToken {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error> where D: Deserializer<'de> {
        let raw_token = String::deserialize(deserializer)?;
        AccessToken::from_str(&raw_token)
            .map_err(serde::de::Error::custom)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct Environment {
    pub project_id: u32,
    #[serde(default)]
    pub token: AccessToken,
    #[serde(default)]
    pub targets: Vec<Target>
}

fn map_serde_yml_error(input: &str, err: &serde_yaml::Error) -> String {
    if let Some(location) = err.location() {
        format!("{} in {} {}:{}",err, input, location.line(), location.column())
    } else {
        format!("{} in {}", err, input)
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
    pub file_type: String,
    pub locales: Option<Vec<String>>,
    #[serde(default)]
    pub tags: Vec<Tag>,
    #[serde(flatten, default)]
    pub extras: HashMap<String, Any>
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Any {
    Integer(i64),
    Float(f64),
    Bool(bool),
    String(String)
}

impl ToString for Any {
    fn to_string(&self) -> String {
        match self {
            Any::Integer(i) => i.to_string(),
            Any::Float(f) => f.to_string(),
            Any::Bool(b) => b.to_string(),
            Any::String(s) => s.to_string(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct Tag(pub String);

impl From<Tag> for String {
    fn from(val: Tag) -> Self {
        val.0
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