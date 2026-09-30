# Comic Universe Plugin: Imperio da Britannia

HTTP API plugin for the Portuguese comic catalog at [imperiodabritannia.net](https://imperiodabritannia.net/).

The project includes an install landing page with the Comic Universe deep link, a list of API routes, a starfield background, and Swagger documentation at `/swagger`.

Supports comic search, catalog listing, details, chapters, and on-demand reader page discovery through Imperio da Britannia's public JSON API. The site API uses encrypted responses by default; the plugin requests the site's documented public plaintext response mode.

## Run locally

```sh
npm install
npm run dev
```

## Install in Comic Universe

```text
comic-universe-tauri://plugin/install?url=<PLUGIN_BASE_URL>/api&metadataUrl=<PLUGIN_BASE_URL>/api/metadata&name=Imperio%20da%20Britannia&tag=imperiodabritannia
```

Endpoints: `POST /api/getList`, `POST /api/search` (`{ "search": "..." }`), `POST /api/getDetails`, `POST /api/getChapters`, `POST /api/getPages`, and `GET /api/metadata`.
