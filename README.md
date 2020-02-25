billsplitting

TypeScript Express application in node.js

Used packages:
DotEnv is used to import configuration into the system. Mainly used for the database settings.
When building project, input correct parameters in .env.example and rename it to .env

Typedi is a way to create Singleton-like classes. These are called services and are contained in a container.
Works well with TypeORM since you can call Container.get(RepositoryClass) to get the singleton instance of that repository.

EJS is a templating engine that works well with express.