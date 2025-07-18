// utils/imageCache.js
const fs = wx.getFileSystemManager();
const baseDir = `${wx.env.USER_DATA_PATH}/images`; // 基础目录
// ${wx.env.USER_DATA_PATH}=http://usr ,开发者工具给的虚拟路径，在其内部映射到文件系统的物理路径'C:\Users\...\微信开发者工具\...\WeappFileSystem\o6zAJs5bqsKhLEKdiv4IiUuH793g\AppId\usr'

/**
 * 确保目录存在
 * @param {string} dirPath 目录路径
 */
function ensureDirExists(dirPath) {
  return new Promise((resolve, reject) => {
    fs.access({
      path: dirPath,
      success: () => resolve(),
      fail: () => {
        fs.mkdir({
          dirPath,
          recursive: true, // 若父目录不存在，自动创建
          success: () => resolve(),
          fail: (err) => reject(err)
        });
      }
    });
  });
}

/**
 * 生成唯一文件名
 * @param {string} url 图片URL
 */
function generateFileName(url) {
  return url.split('/').pop();
}

/**
 * 下载并缓存图片
 * @param {string} url 图片URL
 * @param {string} subDir 子目录（可选）
 * @returns {Promise<string>} 本地文件路径
 */
async function downloadAndCacheImage(url, subDir = '') {
  try {
    const dirPath = subDir ? `${baseDir}/${subDir}` : baseDir;
    await ensureDirExists(dirPath);
    
    const fileName = generateFileName(url);
    const filePath = `${dirPath}/${fileName}`;
    
    // 检查是否已缓存
    const exists = await new Promise((resolve) => {
      fs.access({ path: filePath, success: () => resolve(true), fail: () => resolve(false) });
    });
    if (exists) {
      return filePath;
    }
    
    // 下载图片
    const { tempFilePath, statusCode } = await new Promise((resolve, reject) => {
      wx.downloadFile({
        url,
        success: (res) => {
          // console.log('下载响应:', res);
          if (res.statusCode === 200 && res.tempFilePath) {
            resolve(res);
          } else {
            reject(new Error(`下载失败（状态码: ${res.statusCode}）`));
          }
        },
        fail: (err) => reject(new Error(`下载接口调用失败: ${err.errMsg}`))
      });
    });
    
    // 验证临时文件存在
    await new Promise((resolve, reject) => {
      fs.access({
        path: tempFilePath,
        success: () => resolve(),
        fail: () => reject(new Error(`临时文件不存在: ${tempFilePath}`))
      });
    });
    
    // 再次确认目录存在
    await ensureDirExists(dirPath);
    
    // 保存文件
    await new Promise((resolve, reject) => {
      fs.saveFile({
        tempFilePath,
        filePath,
        success: () => {
          // console.log('图片保存成功:', filePath);
          resolve();
        },
        fail: (err) => reject(new Error(`保存文件失败: ${err.errMsg}`))
      });
    });
    
    return filePath;
  } catch (error) {
    console.error('图片缓存全流程失败:', error);
    throw error; // 抛出错误由调用方处理（如使用原始URL）
  }
}

/**
 * 获取本地缓存图片路径
 * @param {string} url 图片URL
 * @param {string} subDir 子目录（可选）
 * @returns {Promise<string>} 本地文件路径（不存在时返回null）
 */
async function getCachedImagePath(url, subDir = '') {
  try {
    const dirPath = subDir ? `${baseDir}/${subDir}` : baseDir;
    const fileName = generateFileName(url);
    const filePath = `${dirPath}/${fileName}`;
    
    const exists = await new Promise((resolve) => {
      fs.access({
        path: filePath,
        success: () => resolve(true),
        fail: () => resolve(false)
      });
    });
    
    return exists ? filePath : null;
  } catch (error) {
    console.error('检查缓存失败:', error);
    return null;
  }
}

module.exports = {
  downloadAndCacheImage,
  getCachedImagePath
};