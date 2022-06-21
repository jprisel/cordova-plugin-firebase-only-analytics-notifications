"use strict";

var path = require("path");
var AdmZip = require("adm-zip");

var utils = require("./utilities");

var constants = {
  pushSound: "push_sound"
};

module.exports = function(context) {
  var cordovaAbove8 = utils.isCordovaAbove(context, 8);
  var defer;
  if (cordovaAbove8) {
    defer = require('q').defer();
  } else {
    defer = context.requireCordovaModule("q").defer();
  }
  
  var platform = context.opts.plugin.platform;
  var platformConfig = utils.getPlatformConfigs(platform);
  if (!platformConfig) {
    utils.handleError("Invalid platform", defer);
  }
  
  var wwwPath = utils.getResourcesFolderPath(context, platform, platformConfig);
  console.log("wwwPath is: ");
  console.log(wwwPath);
  var soundZipFile = utils.getZipFile(wwwPath, constants.pushSound);
  if (!soundZipFile) {
    console.log("No zip file found containing sound files");
    return;
  }

  var zip = new AdmZip(soundZipFile);

  var targetPath = path.join(wwwPath, constants.pushSound);
  zip.extractAllTo(targetPath, true);

  console.log("TargetPath is: "+ targetPath);
  var files = utils.getFilesFromPath(targetPath);
  
  console.log("the Files are:");
  for (var i = 0; i < files.length; i++) {
    console.log(files[i]);
  }

  var soundFile = files.filter(x => path.basename(x) === platformConfig.soundFileName)[0];

  if (!soundFile) {
    console.log("No sound file found");
    return defer.promise;
  }
  console.log("soundFile is: " + soundFile);
  var destFolder = platformConfig.getSoundDestinationFolder(context);
  console.log("destFolder is: " + destFolder);
  utils.createOrCheckIfFolderExists(destFolder);
  
  var sourceFilePath = path.join(targetPath, path.basename(soundFile))
  console.log("sourceFilePath is: " + sourceFilePath);
  var destFilePath = path.join(destFolder, path.basename(soundFile));
  console.log("destFilePath is: " + destFilePath);
  
  utils.copyFromSourceToDestPath(defer, sourceFilePath, destFilePath);
  
  return defer.promise;
}