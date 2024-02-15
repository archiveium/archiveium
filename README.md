# Getting Started

> [!WARNING]
> - The project is under **very active** development.
> - Expect bugs and breaking changes.
> - Do **not** use the app as the **only way** to backup your emails.
> - Always follow [3-2-1](https://www.backblaze.com/blog/the-3-2-1-backup-strategy/) backup plan.

In order to self-host Archiveium, you'll need [Docker Engine](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/). Deployment of Archiveium involves following services,

- Frontend app - for interaction with user.
- Cron scheduler - for running background jobs eg. downloading emails from IMAP server.
- Postgres database
- Minio (local S3)
- Redis

In order to deploy the above mentioned components, follow the steps mentioned below,

1. In a terminal window, clone the repository and enter the directory.

   ```sh
   git clone git@github.com:archiveium/archiveium.git
   cd archiveium/docker
   ```

1. Create a `config.json` file within `archiveium/docker` directory based on values from [default.json](https://github.com/archiveium/archiveium/blob/main/config/default.json). Adjust `config.json` as required.
1. Update following placeholders in `docker-compose.yml` with values matching those provided in `config.json`
   - `$DB_PASSWORD`
   - `$DB_DATABASE`
   - `$DB_USERNAME`
   - `$MINIO_USER`
   - `$MINIO_PASSWORD`
1. Create admin user by updating `docker-compose.yml` and setting following environment variables,

   - `APP_ADMIN_EMAIL`
   - `APP_ADMIN_PASSWORD` (password is hashed before storing in database)

   Note that creation of only 1 admin user is allowed. If after creating an admin user, the above mentioned variable are changed then those values are ignored. Also, changing password isn't allowed by changing `APP_ADMIN_PASSWORD` only.

1. For other available environment variables, please refer to [docker-compose.yml](https://github.com/archiveium/archiveium/blob/main/docker/docker-compose.yml) file.
1. Bring up the stack by running `docker-compose up -d`

## Notes

- `docker/docker-compose.yml` in this repository is constantly updated with latest available version.
- Please refrain from mixing and matching versions of app & cron services. While in an ideal world, things should work correctly regardless of versions used, however, since I **do not** test combination of different versions, the same cannot be guaranteed as of now.

# Contributing

## Preparing

1. Clone this repository
1. Create `development.json` under config directory and add values based on `default.json`. For further reference on how configs are loaded refer to [config package](https://github.com/node-config/node-config#readme).
1. Update pull style to be rebase by running `git config pull.rebase true` in project directory.
1. Create admin user by updating `development.json` created previously and fill in values for `adminEmail` and `adminPassword`. 

Following this open the project in VS Code. VS Code should then prompt you to open project in dev container. This will result in VS Code building required containers to get started. Once VS Code is done,

Start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

Starting the development server will take care of running migrations as well as seeding the database.

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
