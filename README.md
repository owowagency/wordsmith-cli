# Wordsmith CLI

1. [Usage](#usage)
    1. [NPM](#npm)
    1. [Composer](#composer)
    1. [Github actions](#github-actions)
1. [Commands](#commands)
    1. [Pull](#pull)
    1. [Push](#push)
1. [Configuration](#configuration)
    1. [Top level](#top-level)
    1. [Targets](#targets)
    1. [Supported formats](#supported-formats)
1. [Example configuration](#example-configuration)

## Usage

### NPM

You can use the CLI using `npx` or by installing it with your preferred package manager:

```shell
npx @owowagency/wordsmith-cli --help

# npm
npm install -g @owowagency/wordsmith-cli
# yarn
yarn global add @owowagency/wordsmith-cli
# pnpm
pnpm install -g @owowagency/wordsmith-cli

wordsmith --help
```

You can also install it per project and use it as a script:

```shell
# npm
npm install @owowagency/wordsmith-cli
# yarn
yarn add @owowagency/wordsmith-cli
# pnpm
pnpm install @owowagency/wordsmith-cli
```

Then add the following to your `package.json`:

```json
{
    "scripts": {
        "wordsmith": "wordsmith"
    }
}
```

### Composer

To use the CLI using composer, install it using:

```shell
composer require owowagency/wordsmith-cli
```

Then add the following to your `composer.json`:

```json
{
    "scripts": {
        "wordsmith": "wordsmith"
    }
}
```

```shell
composer wordsmith -- --help
```

### Github actions

To use the CLI in Github actions, use the
[wordsmith-action](https://github.com/owowagency/wordsmith-action)

## Commands

### List Projects

Lists all projects in the scope of the access token, which can be configured in `wordsmith.yml`, see [Configuration](#configuration)

```shell
wordsmith list-projects --env=wordsmith.yml
```

| short | long | type | default | description |
|---|---|---|---|---|
| `-e` | `--env` | `String` | `wordsmith.yml` | Path to the configuration file |
| | `--access-token` | `String` | `wordsmith.yml` | Access token |
| | `--verbose` | `Bool` | `false` | Enables verbose logging |

### Pull

Pulls translation files from the API, translation files can be configured in `wordsmith.yml`, see [Configuration](#configuration)

```shell
wordsmith pull --env=wordsmith.yml
```

| short | long | type | default | description |
|---|---|---|---|---|
| `-e` | `--env` | `String` | `wordsmith.yml` | Path to the configuration file |
| | `--access-token` | `String` | `wordsmith.yml` | Access token |
| | `--verbose` | `Bool` | `false` | Enables verbose logging |

### Push

Pushes translation files to the API, translation files can be configured in `wordsmith.yml`, see [Configuration](#configuration)

```shell
wordsmith push --env=wordsmith.yml --force --verify
```

| short | long | type | default | description |
|---|---|---|---|---|
| `-e` | `--env` | `String` | `wordsmith.yml` | Path to the configuration file |
| | `--access-token` | `String` | `wordsmith.yml` | Access token |
| `-f` | `--force` | `Bool` | `false` | Overwrite existing translations |
| `-v` | `--verify` | `Bool` | `false` | Verify pushed translations |
| | `--verbose` | `Bool` | `false` | Enables verbose logging |


## Configuration

Wordsmith CLI accepts YAML configuration files, the default configuration file is `wordsmith.yml` but can be overwritten using the `--env` flag on push and pull commands

### Top level

| name | type | description |
|---|---|---|
| `project-id` | `Number` | ID of the project |
| `token` | `String` | Access token or environment variable for access token, default: ${{ WORDMSMITH_ACCESS_TOKEN }} |
| `targets` | `Target[]` | See [Targets](#targets) |


### Targets

Any remaining properties will be passed on to the API when pushing or pulling.

| name | type | description |
|---|---|---|
| `file` | `String` | Path to the translation file, `{locale}` will be replaced with the locale e.g. `values-{locale}/strings.xml` will become `values-en/strings.xml` |
| `default-locale-override` | `String?` | Path override for the default locale, this may be useful on Android where the default strings are stored in `values/` instead of `values-{locale}/` |
| `locales` | `String[]` | Locales to pull/push, defaults to existing project locales |
| `types` | `(pull \| push)[]` | Enables push and/or pull for this target |
| `file-type` | `String` | The file format of the translation file, see [Supported formats](#supported-formats) |
| `tags` | `String[]` | Pull only translations with given tags or attach tags to pushed translations, defaults to `[]` |

### Supported formats

- `apple-strings` (iOS)
- `android-strings` (Android xml)
- `json`
- `csv`
- `i18next` (i18next)
- `po` (Gettext)
- `apple-xliff`
- `angular-xliff`
- `symfony-xliff`

## Example Configuration

```yml
project-id: 1
# Use "${{ ENV_VARIABLE_NAME }}" to use environment variables (recommended)
# Access tokens can also be stored in the config file directly (not recommended)
# Defaults: ${{ WORDSMITH_ACCESS_TOKEN }}
token: ${{ WORDSMITH_ACCESS_TOKEN }}
targets:
    # The file to use when pulling/pushing, {locale} will be replaced by the pulled/pushed locale, e.g. locales/values-en/strings-web.xml
  - file: locales/values-{locale}/strings-app.xml
    # [Optional] The file to use when pulling/pushing the default locale
    default-locale-override: locales/values/strings-app.xml
    # Types of this target, possible values: push, pull
    types:
      - push
      - pull
    # Format of the file, possible values:
    # - apple-strings (iOS Localizable string files)
    # - android-strings (XML Android string files)
    # - csv
    # - i18next
    # - json
    file-type: android-strings
    # [Optional] tags to include when pulling/pushing this file
    tags:
      - app
  - file: locales/values-{locale}/strings-library.xml
    default-locale-override: locales/values/strings-library.xml
    types:
      - push
      - pull
    file-type: android-strings
    tags:
      - library
```
