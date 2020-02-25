# XSplit: bill-splitting using the XRP-ledger

## Used packages
TypeORM manages all database interactions. Entities can be added in the models folder but need to be added in the typeORMLoader as well.
The database table structure is automatically updated to the models in the code.

DotEnv is used to import configuration into the system. Mainly used for the database settings.
When building project, input correct parameters in .env.example and rename it to .env

Typedi is a way to create Singleton-like classes. These are called services and are contained in a container.
Works well with TypeORM since you can call Container.get(RepositoryClass) to get the singleton instance of that repository.

EJS is a templating engine that works well with express. The .ejs view files are in the views folder.

Winston is used for logging.

Class-transformer can be used to create class instantiations from plain JSON objects.

Routing-controller is used to create the REST routes in express. It uses a more intuitive way of defining routes and keeps the code clearer.
The routes are defined as Controllers and are in the controllers folder. New controllers need to be added in the index.ts file.

Jest is a javascript testing framework that also works with typescript. Tests are contained in the test folder and have to be named *.test.ts

## To run
1. Clone repo
2. Install and run PostgreSQL
3. Install nodejs and npm
4. Rename .env.example to .env and change the typeORM values to your installation of postgres
5. Run "npm install"
6. Run "npm run dev" to build and launch the app with hot-reloading
7. Run tests with "npm run test"