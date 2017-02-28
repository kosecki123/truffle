var command = {
  command: 'watchtest',
  description: 'Watch filesystem for changes and run tests automatically',
  builder: {},
  run: function (options, done) {
    var TestCmd = require("./test");
    var Config = require("truffle-config");
    var chokidar = require("chokidar");
    var path = require("path");
    var colors = require("colors");

    var config = Config.detect(options);

    var working = false;
    var needs_retest = true;

    var watchPaths = [
      path.join(config.test_directory, "/**/*"),
      path.join(config.contracts_build_directory, "/**/*"),
      path.join(config.contracts_directory, "/**/*"),
    ];

    chokidar.watch(watchPaths, {
      ignored: /[\/\\]\./, // Ignore files prefixed with "."
      cwd: config.working_directory,
      ignoreInitial: true
    }).on('all', function(event, filePath) {
      // On changed/added/deleted
      var display_path = path.join("./", filePath.replace(config.working_directory, ""));
      config.logger.log(colors.cyan(">> File " + display_path + " changed."));

      needs_retest = true;
    });

    var check_retest = function() {
      if (working) {
        setTimeout(check_retest, 200);
        return;
      }

      if (needs_retest == true) {
        working = true;
        TestCmd.run(options, () => {});
        working = false;
        needs_retest = false;
      }

      setTimeout(check_retest, 200);
    };

    check_retest();
  }
}

module.exports = command;
