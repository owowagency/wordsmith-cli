### Steps for global usage

1. cp .env.example .env
2. `yarn install`
3. `yarn build` or `yarn build:watch`
4. `npm i -g .` (install globally)
    To make sure installed correctly you can run `npm list -g` and you should be able to see `wordsmith-cli` in the list
5. go to any other project and run `wordsmith-cli`

### local usage

You can run directly `yarn dev [command_name]` for local development and testing.
