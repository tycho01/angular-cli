import * as chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { oneLine } from 'common-tags';
import { NodeHost } from '../../lib/ast-tools';
import { CliConfig } from '../../models/config';
import { dynamicPathParser } from '../../utilities/dynamic-path-parser';
import { getAppFromConfig } from '../../utilities/app-utils';
import { resolveModulePath } from '../../utilities/resolve-module-file';

const Blueprint = require('../../ember-cli/lib/models/blueprint');
const stringUtils = require('ember-cli-string-utils');
const astUtils = require('../../utilities/ast-utils');
const findParentModule = require('../../utilities/find-parent-module').default;
const getFiles = Blueprint.prototype.files;

export default Blueprint.extend({
  description: '',
  // aliases: ['g'],

  availableOptions: [
    // {
    //   name: 'module',
    //   type: String,
    //   aliases: ['m'],
    //   description: 'Specifies where the guard should be provided.'
    // },
  ],

  beforeInstall: function(options: any) {
    const appConfig = getAppFromConfig(this.options.app);
    if (options.module) {
      this.pathToModule =
        resolveModulePath(options.module, this.project, this.project.root, appConfig);
    } else {
      try {
        this.pathToModule = findParentModule(this.project.root, appConfig.root, this.generatePath);
      } catch (e) {
        if (!options.skipImport) {
          throw `Error locating module for declaration\n\t${e}`;
        }
      }
    }
  },

  normalizeEntityName: function (entityName: string) {
    const appConfig = getAppFromConfig(this.options.app);
    const parsedPath = dynamicPathParser(this.project, entityName, appConfig);

    this.dynamicPath = parsedPath;
    return parsedPath.name;
  },

//   locals: function (options: any) {
//     options.flat = options.flat !== undefined ?
//       options.flat : CliConfig.getValue('defaults.guard.flat');

//     options.spec = options.spec !== undefined ?
//       options.spec : CliConfig.getValue('defaults.guard.spec');

//     return {
//       dynamicPath: this.dynamicPath.dir,
//       flat: options.flat
//     };
//   },

  files: function () {
    let fileList = getFiles.call(this) as Array<string>;

    // if (this.options && !this.options.spec) {
    //   fileList = fileList.filter(p => p.indexOf('__name__.guard.spec.ts') < 0);
    // }

    return fileList;
  },

  fileMapTokens: function (options: any) {
    // Return custom template variables here.
    return {
      __path__: () => {
        let dir = this.dynamicPath.dir;
        // if (!options.locals.flat) {
        //   dir += path.sep + options.dasherizedModuleName;
        // }
        this.generatePath = `${dir}/components/${this.dynamicPath.name}`;
        return this.generatePath;
      }
    };
  },

  afterInstall(options: any) {
    const returns: Array<any> = [];
    const fullGeneratePath = path.join(this.project.root, this.generatePath);
    const moduleDir = path.parse(this.pathToModule).dir;
    const relativeDir = path.relative(moduleDir, fullGeneratePath);
    const preChange = fs.readFileSync(this.pathToModule, 'utf8');
    let { name } = options.entity;
    const fileName = stringUtils.dasherize(``); // ${name}.guard

    ;[`${name}Comp`, `${name}sComp`, `${name}SharedComp`].reduce((prom: Promise<any>, cls: string) => {

      const className = stringUtils.classify(cls);
      const importPath = relativeDir ? `./${relativeDir}/${fileName}` : `./${fileName}`;

      let prom_ = prom.then(() =>
        astUtils.addDeclarationToModule(this.pathToModule, className, importPath)
          .then((change: any) => change.apply(NodeHost))
          .then((result: any) => {
            if (options.export) {
              return astUtils.addExportToModule(this.pathToModule, className, importPath)
                .then((change: any) => change.apply(NodeHost));
            }
            return result;
          })
          .then(() => {
            const postChange = fs.readFileSync(this.pathToModule, 'utf8');
            let moduleStatus = 'update';

            if (postChange === preChange) {
              moduleStatus = 'identical';
            }

            this._writeStatusToUI(chalk.yellow,
              moduleStatus,
              path.relative(this.project.root, this.pathToModule));
          })
      );

      returns.push(prom_);
      return prom_;

    }, Promise.resolve(null));

    this._writeStatusToUI(chalk.yellow,
      'update',
      path.relative(this.project.root, this.pathToModule));

    return Promise.all(returns);
  }
});
