import * as rimraf from 'rimraf';
import * as path from 'path';
const Task = require('ember-cli/lib/models/task');
import * as webpack from 'webpack';
import { BuildOptions } from '../commands/build';
import { NgCliWebpackConfig } from '../models/webpack-config';
import { webpackOutputOptions } from '../models/';
import { CliConfig } from '../models/config';

// Configure build and output;
let lastHash: any = null;

export default <any>Task.extend({
  run: function (runTaskOptions: BuildOptions) {

    const project = this.cliProject;

    const outputDir = runTaskOptions.outputPath || CliConfig.fromProject().config.apps[0].outDir;
    rimraf.sync(path.resolve(project.root, outputDir));
    const config = new NgCliWebpackConfig(
      project,
      runTaskOptions.target,
      runTaskOptions.environment,
      outputDir,
      runTaskOptions.baseHref,
      runTaskOptions.aot
    ).config;

    // allow build despite TS errors, cuz one cannot 100% [resolve these](https://esdiscuss.org/topic/es8-proposal-optional-static-typing#content-8)
    config.bail = true;

    const webpackCompiler: any = webpack(config);

    const ProgressPlugin  = require('webpack/lib/ProgressPlugin');

    webpackCompiler.apply(new ProgressPlugin({
      profile: true
    }));

    return new Promise((resolve, reject) => {
      webpackCompiler.run((err: any, stats: any) => {
        // Don't keep cache
        // TODO: Make conditional if using --watch
        webpackCompiler.purgeInputFileSystem();

        if (err) {
          lastHash = null;
          console.error(err.details || err);
          reject(err.details || err);
        }

        if (stats.hash !== lastHash) {
          lastHash = stats.hash;
          process.stdout.write(stats.toString(webpackOutputOptions) + '\n');
        }
        resolve();
      });
    });
  }
});
