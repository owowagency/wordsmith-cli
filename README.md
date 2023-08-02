# Wordsmith CLI

## Github action

[wordsmith-action](https://github.com/owowagency/wordsmith-action)

## Commands

### Pull

Pulls translation files from the API, translation files can be configured in `wordsmith.yml`, see [Configuration](#configuration)

```shell
wordsmith pull --env=wordsmith.yml
```

| short | long | type | default | description |
|---|---|---|---|---|
| `-e` | `--env` | `String` | `wordsmith.yml` | Path to the configuration file |
| | `--verbose` | `Bool` | `false` | Enables verbose logging |

### Push

Pushes translation files to the API, translation files can be configured in `wordsmith.yml`, see [Configuration](#configuration)

```shell
wordsmith push --env=wordsmith.yml --force --verify
```

| short | long | type | default | description |
|---|---|---|---|---|
| `-e` | `--env` | `String` | `wordsmith.yml` | Path to the configuration file |
| `-f` | `--force` | `Bool` | `false` | Overwrite existing translations |
| `-v` | `--verify` | `Bool` | `false` | Verify pushed translations |
| | `--verbose` | `Bool` | `false` | Enables verbose logging |


## Configuration

Wordsmith CLI accepts YAML configuration files, the default configuration file is `wordsmith.yml` but can be overwritten using the `--env` flag on push and pull commands

### Top level

| name | type | description |
|---|---|---|
| `project_id` | `Number` | ID of the project |
| `token` | `String` | Access token |
| `targets` | `Target[]` | See [Targets](#targets) |


### Targets

| name | type | description |
|---|---|---|
| `file` | `String` | Path to the translation file, `{locale}` will be replaced with the locale e.g. `values-{locale}/strings.xml` will become `values-en/strings.xml` |
| `default_locale_override` | `String?` | Path override for the default locale, this may be useful on Android where the default strings are stored in `values/` instead of `values-{locale}/` |
| `types` | `(pull \| push)[]` | Enables push and/or pull for this target |
| `args` | `Arguments` | See [Arguments](#arguments) |

### Arguments

| name | type | description |
|---|---|---|
| `file_type` | `String` | The file format of the translation file, see [Supported formats](#supported-formats) |
| `tags` | `String[]?` | Pull only translations with given tags or attach tags to pushed translations |

### Supported formats

- `apple-strings` (iOS)
- `android-strings` (Android xml)
- `json`
- `csv`
- `i18n` (i18next)

## Example Configuration

```yml
project_id: 1
token: replace-with-access-token
targets:
    # The file to use when pulling/pushing, {locale} will be replaced by the pulled/pushed locale, e.g. locales/values-en/strings-web.xml
  - file: locales/values-{locale}/strings-app.xml
    # [Optional] The file to use when pulling/pushing the default locale
    default_locale_override: locales/values/strings-app.xml
    # Types of this target, possible values: push, pull
    types: 
      - push
      - pull
    # Arguments for this target
    args:
      # Format of the file, possible values: 
      # - apple-strings (iOS Localizable string files)
      # - android-strings (XML Android string files)
      # - csv
      # - i18n
      # - json
      file_type: android-strings
      # [Optional] tags to include when pulling/pushing this file
      tags: 
        - app
  - file: locales/values-{locale}/strings-library.xml
    default_locale_override: locales/values/strings-library.xml
    types: 
      - push
      - pull
    args:
      file_type: android-strings
      tags: 
        - library
```