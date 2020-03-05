import * as shell from "shelljs";

// Copy all the view templates
shell.exec("browserify dist/events/LoginScript.js > dist/events/LoginScriptBundled.js");
