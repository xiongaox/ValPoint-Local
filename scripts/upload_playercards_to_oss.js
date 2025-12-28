/**
 * upload_playercards_to_oss.js
 * 
 * 职责：
 * - 批量下载 Valorant Player Cards 到阿里云 OSS
 * - 生成 playercards_cn.json 供前端使用
 * 
 * 使用方法：
 *   node scripts/upload_playercards_to_oss.js
 * 
 * 环境变量要求：
 *   OSS_ACCESS_KEY_ID - 阿里云 AccessKey ID
 *   OSS_ACCESS_KEY_SECRET - 阿里云 AccessKey Secret
 *   OSS_BUCKET - 存储桶名称 (默认: valcards)
 *   OSS_REGION - 地域 (默认: oss-cn-guangzhou)
 */

import OSS from 'ali-oss';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

// 获取 __dirname (ESM 模式下需要手动计算)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ 配置 ============
const CONFIG = {
    // Valorant API
    API_URL: 'https://valorant-api.com/v1/playercards?language=zh-CN',

    // OSS 配置
    OSS_BUCKET: process.env.OSS_BUCKET || 'valcards',
    OSS_REGION: process.env.OSS_REGION || 'oss-cn-guangzhou',
    OSS_PATH_PREFIX: 'playercards/',

    // 输出
    OUTPUT_JSON_PATH: path.join(__dirname, '../public/data/playercards_cn.json'),
    TEMP_DIR: path.join(__dirname, '../temp_playercards'),

    // 限制
    CONCURRENCY: 5,  // 并发下载/上传数
    DOWNLOAD_TIMEOUT: 30000, // 30秒超时
};

// ============ OSS 客户端 ============
function createOSSClient() {
    const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;

    if (!accessKeyId || !accessKeySecret) {
        console.error('❌ 缺少 OSS 凭证，请设置环境变量:');
        console.error('   OSS_ACCESS_KEY_ID');
        console.error('   OSS_ACCESS_KEY_SECRET');
        process.exit(1);
    }

    return new OSS({
        region: CONFIG.OSS_REGION,
        accessKeyId,
        accessKeySecret,
        bucket: CONFIG.OSS_BUCKET,
    });
}

// ============ 工具函数 ============

/**
 * 下载文件到本地
 */
function downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(destPath);
        const request = https.get(url, { timeout: CONFIG.DOWNLOAD_TIMEOUT }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        });

        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Download timeout'));
        });
    });
}

/**
 * 并发执行任务
 */
async function runConcurrent(tasks, concurrency) {
    const results = [];
    const executing = new Set();

    for (const task of tasks) {
        const promise = task().then(result => {
            executing.delete(promise);
            return result;
        });
        executing.add(promise);
        results.push(promise);

        if (executing.size >= concurrency) {
            await Promise.race(executing);
        }
    }

    return Promise.allSettled(results);
}

/**
 * 从名称生成 OSS 文件名 (自动处理重名)
 */
const usedNames = new Set();

function getOSSKey(name, uuid) {
    // 移除非法字符 (Windows/OSS 限制)
    let safeName = name.replace(/[<>:"/\\|?*]/g, '').trim();

    // 如果名称为空，使用 UUID
    if (!safeName) safeName = uuid;

    // 检查重名，如果重名则添加 UUID 后缀
    if (usedNames.has(safeName)) {
        safeName = `${safeName}_${uuid.substring(0, 8)}`;
    }

    usedNames.add(safeName);
    return `${CONFIG.OSS_PATH_PREFIX}${safeName}.png`;
}

/**
 * 获取公开访问 URL
 */
function getPublicUrl(key) {
    // 对 OSS Key 进行 URL 编码，避免中文乱码
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');
    return `https://${CONFIG.OSS_BUCKET}.${CONFIG.OSS_REGION}.aliyuncs.com/${encodedKey}`;
}

// ============ 主流程 ============

async function main() {
    console.log('🚀 开始 Player Card OSS 迁移任务 (使用中文文件名)\n');

    // 1. 获取卡面列表
    console.log('📥 正在从 Valorant API 获取卡面列表...');
    const response = await fetch(CONFIG.API_URL);
    const { data: allCards } = await response.json();
    console.log(`   找到 ${allCards.length} 张卡面\n`);

    // 2. 过滤：只保留公开卡面（或全部）
    const cards = allCards.filter(card => !card.isHiddenIfNotOwned);
    console.log(`   过滤后保留 ${cards.length} 张公开卡面\n`);

    // 3. 准备临时目录
    if (!fs.existsSync(CONFIG.TEMP_DIR)) {
        fs.mkdirSync(CONFIG.TEMP_DIR, { recursive: true });
    }

    // 4. 创建 OSS 客户端
    const ossClient = createOSSClient();
    console.log(`🔗 OSS 配置: ${CONFIG.OSS_BUCKET} @ ${CONFIG.OSS_REGION}\n`);

    // 5. 下载并上传
    console.log('📤 开始下载并上传卡面...\n');

    const results = [];
    let processed = 0;

    const tasks = cards.map(card => async () => {
        const uuid = card.uuid;
        const name = card.displayName;
        const localPath = path.join(CONFIG.TEMP_DIR, `${uuid}.png`);
        const ossKey = getOSSKey(name, uuid);

        try {
            // 下载
            await downloadFile(card.displayIcon, localPath);

            // 上传到 OSS
            await ossClient.put(ossKey, localPath);

            // 删除临时文件
            fs.unlinkSync(localPath);

            processed++;
            if (processed % 50 === 0) {
                console.log(`   已处理 ${processed}/${cards.length}...`);
            }

            return {
                uuid,
                name: card.displayName,
                url: getPublicUrl(ossKey),
            };
        } catch (error) {
            console.error(`   ⚠️ 处理 ${name} (${uuid}) 失败: ${error.message}`);
            return null;
        }
    });

    const settledResults = await runConcurrent(tasks, CONFIG.CONCURRENCY);

    const successfulCards = settledResults
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

    console.log(`\n✅ 成功上传 ${successfulCards.length}/${cards.length} 张卡面\n`);

    // 6. 生成 JSON 文件
    console.log('📝 生成 playercards_cn.json...');

    // 确保输出目录存在
    const outputDir = path.dirname(CONFIG.OUTPUT_JSON_PATH);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(
        CONFIG.OUTPUT_JSON_PATH,
        JSON.stringify(successfulCards, null, 2),
        'utf-8'
    );

    console.log(`   已保存到: ${CONFIG.OUTPUT_JSON_PATH}`);
    console.log(`   共 ${successfulCards.length} 条记录\n`);

    // 7. 清理临时目录
    if (fs.existsSync(CONFIG.TEMP_DIR)) {
        fs.rmSync(CONFIG.TEMP_DIR, { recursive: true, force: true });
    }

    console.log('🎉 任务完成！\n');
}

main().catch(err => {
    console.error('❌ 发生错误:', err);
    process.exit(1);
});
