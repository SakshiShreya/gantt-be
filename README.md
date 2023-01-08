# Gantt BackEnd

This repo is backend for Gantt FrontEnd.

## Setup

- Clone the repo
- Run `npm i`
- Run `npm run prepare`

## Development Server

```bash
npm run dev
```

## Project Structure

- controllers: contains controllers related to CRUD operations (except grapghql apis)
- models: contains mongoose models
- resolvers: contains graphql resolvers
- schemas: contains graphql schemas
- utils: contains utility functions

## Environment Variables required to be set

- DB
- PORT
- NODE_ENV
- DB_USERNAME
- DB_PASSWORD
- PAGINATION_LIMIT
