use std::{env, collections::HashMap};

use log::{error, log_enabled, debug, warn, info};
use reqwest::{ClientBuilder, header::{HeaderMap, HeaderValue, InvalidHeaderValue}, Client, StatusCode, Request, Response, Url};
use serde::de::DeserializeOwned;
use thiserror::Error;
use url::ParseError;

use crate::environment::AccessToken;

use self::models::error::ApiError;

pub mod models;
pub mod list_projects;
pub mod pull;
pub mod push;
pub mod info;

const WORDSMITH_VERSION: &'static str = env!("WORDSMITH_VERSION");

fn create_user_agent() -> String {
    let platform = match (env::consts::OS, env::consts::ARCH) {
        ("macos", arch) => format!("Mac OS X; {arch}"),
        ("linux", arch) => format!("Linux; {arch}"),
        ("windows", arch) => format!("Windows NT; {arch}"),
        (os, arch) => format!("{os}; {arch}")
    };

    format!("Wordsmith-cli/{WORDSMITH_VERSION} ({platform})")
}

pub struct WordsmithClient {
    headers: HeaderMap,
    client: Client,
}

type Result<T> = std::result::Result<T, WordsmithError>;

#[derive(Debug, Error)]
pub enum WordsmithError {
    #[error("Unable to create API Client, reason: {0}")]
    Init(String),
    #[error("HTTP Client error, reason: {0}")]
    Http(String),
    #[error("API Error [{0}] {1}")]
    Api(StatusCode, ApiError),
    #[error("IO Error, reason: {0}")]
    Io(String),
    #[error("Failed to push {file:?} [{locale}], cause: {cause}")]
    Push { file: String, locale: String, cause: Box<WordsmithError> }
}

pub trait HasExitCode {
    fn exit_code(&self) -> i32;
}

impl HasExitCode for WordsmithError {
    fn exit_code(&self) -> i32 {
        1
    }
}

impl From<InvalidHeaderValue> for WordsmithError {
    fn from(value: InvalidHeaderValue) -> Self {
        WordsmithError::Init(value.to_string())
    }
}

impl From<ParseError> for WordsmithError {
    fn from(value: ParseError) -> Self {
        WordsmithError::Init(value.to_string())
    }
}

impl From<reqwest::Error> for WordsmithError {
    fn from(value: reqwest::Error) -> Self {
        let status = value.status();
        let url = value.url();
        let message = format!("HTTP error [status: {:?}, url: {:?}], message: {}", status, url, value);
        WordsmithError::Http(message)
    }
}

impl WordsmithClient {
    pub fn new(token: Option<&AccessToken>) -> Result<Self> {
        let user_agent = HeaderValue::from_str(&create_user_agent())?;
        let accept = HeaderValue::from_str("application/json")?;
        let mut headers = HeaderMap::new();
        headers.append("User-Agent", user_agent);
        headers.append("Accept", accept);
        if let Some(token) = token {
            let raw_token = token.get_token().map_err(WordsmithError::Init)?;
            let token_header = HeaderValue::from_str(&format!("Bearer {}", raw_token))?;
            headers.append("Authorization", token_header);
        }
        let client = ClientBuilder::new()
            .default_headers(headers.clone())
            .build()
            .map_err(|op| WordsmithError::Init(op.to_string()))?;

        Ok(Self {
            client,
            headers,
        })
    }

    async fn send(&self, request: Request) -> Result<Response> {
        if log_enabled!(log::Level::Debug) {
            let url = request.url();
            let query = url.query_pairs();
            let headers = request.headers();
            let mut buffer = String::new();
            buffer.push_str(&format!("{} {}", request.method(), request.url()));
            for (name, value) in self.headers.iter() {
                buffer.push_str(&format!("\n{}: {}", name.as_str(), value.to_str().ok().unwrap_or("")))
            }
            for (name, value) in headers.iter() {
                buffer.push_str(&format!("\n{}: {}", name.as_str(), value.to_str().ok().unwrap_or("")))
            }
            for (key, value) in query.into_iter() {
                buffer.push_str(&format!("\n{}={}", key, value))
            }
            debug!("{}", buffer);
        }
        Ok(self.client.execute(request).await?)
    }

    pub fn format_url(url: &str) -> Result<Url> {
        let base_url = if cfg!(feature = "configurable-base-url") {
            match env::var("WORDSMITH_BASE_URL") {
                Ok(base_url) => {
                    info!("Using {base_url} from WORDSMITH_BASE_URL environment variable");
                    base_url
                },
                Err(_) => {
                    let base_url = env!("WORDSMITH_BASE_URL");
                    warn!("WORDSMITH_BASE_URL environment variable not set, using {base_url} instead");
                    base_url.to_owned()
                },
            }
        } else {
            env!("WORDSMITH_BASE_URL").to_owned()
        };

        Ok(Url::parse(&base_url)?.join(&url)?)
    }

    pub async fn execute<Res : DeserializeOwned>(&self, request: Request) -> Result<Res> {
        let response = self.send(request).await?;

        let status = response.status();

        match status.as_u16() {
            200..=299 => {
                let response: Res = response.json().await?;
                Ok(response)
            },
            _ => Err(WordsmithClient::decode_error_response(response).await),
        }
    }

    pub async fn execute_no_content(&self, request: Request) -> Result<()> {
        let response = self.send(request).await?;
        let status = response.status();

        if status != StatusCode::NO_CONTENT {
            return Err(WordsmithClient::decode_error_response(response).await);
        }

        Ok(())
    }

    pub async fn download(&self, url: &str) -> Result<Vec<u8>> {
        let request = self.client.get(url).build()?;
        let response = self.send(request).await?;
        let status = response.status();

        if status != StatusCode::OK {
            return Err(WordsmithClient::decode_error_response(response).await);
        }

        Ok(response.bytes().await?.to_vec())
    }

    async fn decode_error_response(response: Response) -> WordsmithError {
        let status = response.status();
        let content_type = match response.headers().get("Content-Type") {
            Some(header) => header.to_str().unwrap_or(""),
            None => "",
        };

        if content_type.contains("application/json") {
            return match response.json().await {
                Ok(error) => WordsmithError::Api(status, error),
                Err(err) => WordsmithError::Api(status, ApiError {
                    message: err.to_string(),
                    errors: HashMap::default(),
                })
            };
        }

        match response.text().await {
            Ok(text) => WordsmithError::Api(status, ApiError {
                message: text,
                errors: HashMap::default(),
            }),
            Err(err) => err.into(),
        }
    }
}

