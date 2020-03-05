import * as shell from "shelljs";

// Copy all the view templates
shell.exec("browserify dist/events/LoginScript.js > dist/events/LoginScriptBundled.js");
shell.exec("browserify dist/events/RegisterScript.js > dist/events/RegisterScriptBundled.js");
