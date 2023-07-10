# Archiveium Frontend

This repository contains code for the frontend of Archiveium, portion responsible for interaction with user via a website.

## Self Hosting

Please refer to [instructions given in deployer](https://github.com/archiveium/deployer#getting-started) for self-hosting.

## Contributing

### Preparing

1. Clone this repository
1. Create `development.json` under config directory and add values based on `default.json`. For further reference on how configs are loaded refer to [config package](https://github.com/node-config/node-config#readme).
1. Update pull style to be rebase by running `git config pull.rebase true` in project directory.

Following this open the project in VS Code. VS Code should then prompt you to open project in dev container. This will result in VS Code building required containers to get started. Once VS Code is done,

1. Run migrations - `npm run migrate:database up`
1. Seed database - `npm run seed:database`

Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.