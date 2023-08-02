use std::{path::Path, vec};

use log::debug;
use tokio::{fs::File, io::{AsyncWriteExt, AsyncReadExt}};

use crate::{api::{WordsmithError, models::project::ProjectResponse}, environment::Target};

impl From<std::io::Error> for WordsmithError {
    fn from(value: std::io::Error) -> Self {
        WordsmithError::Io(value.to_string())
    }
}

pub struct TargetFile {
    pub r#type: String,
    pub path: String,
    pub path_override: Option<String>,
    pub default_locale: Option<String>,
}

impl TargetFile {
    pub fn from(project: &ProjectResponse, target: &Target) -> Self {
        Self {
            r#type: target.args.file_type.clone(),
            path: target.file.clone(),
            path_override: target.default_locale_override.clone(),
            default_locale: project.default_locale.clone(),
        }
    }

    pub fn target_path(&self, locale: &String) -> String {
        match &self.default_locale {
            Some(default_locale) if locale == default_locale => self.path_override.as_ref().unwrap_or(&self.path),
            _ => &self.path
        }.replace("{locale}", locale)
    }

    pub async fn read(&self, locale: &String) -> Result<Vec<u8>, WordsmithError> {
        let path = self.target_path(&locale);
        let path = Path::new(&path);

        let mut fh = File::open(path).await?;
        let mut buffer = vec![];
        fh.read_to_end(&mut buffer).await?;

        Ok(buffer)
    }

    pub async fn write(&self, locale: &String, data: &Vec<u8>) -> Result<(), WordsmithError> {
        let path = self.target_path(&locale);
        let path = Path::new(&path);

        if let Some(parent) = path.parent() {
            if !parent.exists() {
                debug!("Creating directory {:?}", parent);
                std::fs::create_dir_all(parent)?;
            }
        }
        
        let mut fh = File::create(path).await?;
        fh.write_all(data).await?;

        Ok(())
    }
}

pub fn get_locales(project: &ProjectResponse, target: &Target) -> Vec<String> {
    if let Some(locales) = target.args.locales.clone() {
        locales
    } else if let Some(locales) = project.locales.clone() {
        locales
    } else {
        vec![]
    }
}