# Translate CLI

## Installation
`yarn install`

## Build
1. `cp .env.example .env`
2. `yarn build`

## Config
Edit `config.json` to configure the CLI.

Alternatively, CLI can be configured through the CLI.

## Tests
Run tests:
```
yarn test
```
Run any test:
```
jest my-test --notify --config=config.json
```

Make Jest globally available by:
```
yarn global add jest
```




## Usage
`yarn translate -h`