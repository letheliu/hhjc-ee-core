const is = require('is-type-of');
const fs = require('fs');
const path = require('path');
const UtilsCore = require('../../core/lib/utils');
const Ps = require('../utils/ps');
const Log = require('../log');

module.exports = {

  /**
   * 加载单个文件(如果是函数，将被执行)
   *
   * @param {String} filepath - fullpath
   * @param {Array} inject - pass rest arguments into the function when invoke
   * @return {Object} exports
   * @since 1.0.0
   */
  loadOneFile (filepath, ...inject) {
    const isAbsolute = path.isAbsolute(filepath);
    if (!isAbsolute) {
      filepath = path.join(Ps.getBaseDir(), filepath);
    }

    filepath = filepath && this.resolveModule(filepath);
    if (!fs.existsSync(filepath)) {
      let errorMsg = `[ee-core] [module/loader/index] loadOneFile ${filepath} does not exist`;
      Log.coreLogger.error(errorMsg);
      throw new Error(errorMsg);
    }

    const ret = UtilsCore.loadFile(filepath);
    if (is.function(ret) && !is.class(ret) && !UtilsCore.isBytecodeClass(ret)) {
      ret = ret(...inject);
    }
    return ret;
  },

  /**
   * 加载job文件
   *
   * @param {String} filepath - fullpath
   * @param {Array} inject - pass rest arguments into the function when invoke
   * @return {Object} exports
   * @since 1.0.0
   */
  loadJobFile (filepath, ...inject) {
    if (!fs.existsSync(filepath)) {
      let warnMsg = `[ee-core] [module/loader/index] loadJobFile ${filepath} does not exist`;
      Log.coreLogger.error(warnMsg);
    }

    const ret = UtilsCore.loadFile(filepath);
    if (is.function(ret) && !is.class(ret) && !UtilsCore.isBytecodeClass(ret)) {
      ret = ret(...inject);
    }
    return ret;
  },  

  /**
   * 模块的绝对路径
   * @param {String} filepath - fullpath
   */
  resolveModule(filepath) {
    let fullpath;
    try {
      fullpath = require.resolve(filepath);
    } catch (e) {

      // 特殊后缀处理
      if (filepath && (filepath.endsWith('.defalut') || filepath.endsWith('.prod'))) {
        fullpath = filepath + '.jsc';
      } else if (filepath && filepath.endsWith('.js')) {
        fullpath = filepath + 'c';
      }

      if (!fs.existsSync(filepath) && !fs.existsSync(fullpath)) {
        let files = { filepath, fullpath }
        Log.coreLogger.warn(`[ee-core] [module-loader-resolveModule] unknow filepath: ${files}`)
        return undefined;
      }
    }

    return fullpath;
  },

  /**
   * 加载模块(子进程中使用)
   *
   * @param {String} filepath - fullpath
   * @return {Object} exports
   * @since 1.0.0
   */
  requireModule (filepath, type = '') {
    let fullpath;
    const isAbsolute = path.isAbsolute(filepath);
    if (!isAbsolute) {
      filepath = path.join(Ps.getBaseDir(), type, filepath);
    }

    fullpath = this.resolveModule(filepath);
    if (!fs.existsSync(fullpath)) {
      let errorMsg = `[ee-core] [module-loader-index] requireModule filepath: ${filepath} does not exist`;
      Log.coreLogger.error(errorMsg);
    }
    const ret = UtilsCore.loadFile(fullpath);

    return ret;
  },  

  /**
   * 加载jobs模块(子进程中使用)
   *
   * @param {String} filepath - fullpath
   * @return {Object} exports
   * @since 1.0.0
   */
  requireJobsModule (filepath) {
    const ret = this.requireModule(filepath, 'jobs');

    return ret;
  }, 
}








