use log::{error, log_enabled, debug};
use reqwest::{ClientBuilder, header::{HeaderMap, HeaderValue, InvalidHeaderValue}, Client, StatusCode, Request, Response};
use serde::de::DeserializeOwned;
use thiserror::Error;

use crate::environment::AccessToken;

use self::models::error::ApiError;

pub mod models;
pub mod pull;
pub mod push;
pub mod info;

const BASE_URL: &'static str = env!("BASE_URL");
const USER_AGENT: &'static str = env!("USER_AGENT");

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
    #[error("API Error, status: {0}, message: {1}")]
    Api(StatusCode, ApiError),
    #[error("IO Error, reason: {0}")]
    Io(String),
}

impl From<InvalidHeaderValue> for WordsmithError {
    fn from(value: InvalidHeaderValue) -> Self {
        WordsmithError::Init(value.to_string())
    }
}

impl From<reqwest::Error> for WordsmithError {
    fn from(value: reqwest::Error) -> Self {
        let status = value.status();
        let url = value.url();
        let message = format!("HTTP error [status: {:?}, url: {:?}], message: {}", status, url, value.to_string());
        WordsmithError::Http(message)
    }
}

impl WordsmithClient {
    pub fn new(token: Option<&AccessToken>) -> Result<Self> {
        let user_agent = HeaderValue::from_str(USER_AGENT)?;
        let accept = HeaderValue::from_str("application/json")?;
        let mut headers = HeaderMap::new();
        headers.append("User-Agent", user_agent);
        headers.append("Accept", accept);
        if let Some(token) = token {
            let raw_token = token.get_token().map_err(|op| WordsmithError::Init(op))?;
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
        return Ok(self.client.execute(request).await?);
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

        return Ok(response.bytes().await?.to_vec());
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
                    errors: vec![],
                })
            };
        }

        match response.text().await {
            Ok(text) => WordsmithError::Api(status, ApiError {
                message: text,
                errors: vec![],
            }),
            Err(err) => err.into(),
        } 
    }
}

