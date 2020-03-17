import * as shell from "shelljs";

// Copy all the view templates
shell.exec("browserify dist/events/LoginScript.js > dist/events/LoginScriptBundled.js");
shell.exec("browserify dist/events/RegisterScript.js > dist/events/RegisterScriptBundled.js");
shell.exec("browserify dist/events/AccountScript.js > dist/events/AccountScriptBundled.js");
shell.exec("browserify dist/events/RequestScript.js > dist/events/RequestScriptBundled.js");
shell.exec("browserify dist/events/ListsScript.js > dist/events/ListsScriptBundled.js");
