'use strict';

const path = require('path');
const fs = require('fs');
const fsPro = require('fs-extra');
const chalk = require('chalk');
const Utils = require('../lib/utils');

/**
 * 资源替换
 */

 module.exports = {
  
  /**
   * 执行
   */  
  run(options = {}) {
    console.log('[ee-bin] [rd] Start moving resources');
    const homeDir = process.cwd();
    let { dist, target, config } = options;

    let distDir = './frontend/dist';
    let targetDir = './public/dist';

    // 命令行优先
    if (dist) {
      distDir = dist;
    }
    if (target) {
      targetDir = target;
    }

    // 如果命令行没参数，从bin config 获取
    if (!dist && !target) {
      const hasConfig = Utils.checkConfig(config);
      if (hasConfig) {
        const cfg = Utils.loadConfig(config);
        if (cfg.rd && cfg.rd.dist) {
          distDir = cfg.rd.dist;
        }
        if (cfg.rd && cfg.rd.target) {
          targetDir = cfg.rd.target;
        }
      }   
    }

    const sourceDir = path.join(homeDir, distDir);
    if (!fs.existsSync(sourceDir)) {
      const errorTips = chalk.bgRed('Error') + ' Frontend resource does not exist, please build !';
      console.error(errorTips);
      return
    }
    
    // 清空历史资源 并 复制到ee资源目录
    const eeResourceDir = path.join(homeDir, targetDir);
    if (!fs.existsSync(eeResourceDir)) {
      fs.mkdirSync(eeResourceDir, {recursive: true, mode: 0o777});
    } else {
      this._rmFolder(eeResourceDir);
      console.log('[ee-bin] [rd] Clear history resources:', eeResourceDir);
    }

    fsPro.copySync(sourceDir, eeResourceDir);
    console.log('[ee-bin] [rd] Copy a resource to:', eeResourceDir);
    console.log('[ee-bin] [rd] End');
  },

  /**
   * 删除文件夹
   */
  _rmFolder(folder) {
    const nodeVersion = (process.versions && process.versions.node) || null;
    if (nodeVersion && Utils.compareVersion(nodeVersion, '14.14.0') == 1) {
      fs.rmSync(folder, {recursive: true});
    } else {
      fs.rmdirSync(folder, {recursive: true});
    }
  },
}