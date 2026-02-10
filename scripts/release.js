#!/usr/bin/env node

/**
 * ValPoint 版本发布脚本
 * 用途：自动创建 git tag 并推送，触发 GitHub Actions 构建多平台 Docker 镜像
 * 用法：
 *   node scripts/release.js          → 使用 package.json 中的版本号
 *   node scripts/release.js 1.2.3    → 指定版本号
 *   npm run release                  → 通过 npm script 调用
 */

import { execSync } from 'child_process';
import { createRequire } from 'module';
import { createInterface } from 'readline';

const require = createRequire(import.meta.url);
const { version: pkgVersion } = require('../package.json');

// 颜色工具
const c = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
};

/** 执行命令并返回 stdout（静默 stderr） */
function run(cmd) {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

/** 检查命令是否执行成功 */
function tryRun(cmd) {
    try {
        run(cmd);
        return true;
    } catch {
        return false;
    }
}

/** 交互式确认 */
function confirm(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

async function main() {
    console.log(c.cyan('================================'));
    console.log(c.cyan('   ValPoint 版本发布工具        '));
    console.log(c.cyan('================================'));

    // 1. 确定版本号
    const version = process.argv[2] || pkgVersion;
    if (!version) {
        console.error(c.red('❌ 错误：无法确定版本号，请检查 package.json 或手动指定'));
        process.exit(1);
    }

    const tag = `v${version}`;

    // 2. 检查 tag 是否已存在
    if (tryRun(`git rev-parse ${tag}`)) {
        console.error(c.red(`❌ 错误：标签 ${tag} 已存在`));
        console.log(`💡 提示：可以先删除旧标签：${c.yellow(`git tag -d ${tag} && git push origin :refs/tags/${tag}`)}`);
        process.exit(1);
    }

    // 3. 检查工作区状态
    const status = run('git status --porcelain');
    if (status) {
        console.log(c.yellow('\n⚠️  工作区有未提交的更改：'));
        console.log(status);
        const ok = await confirm('\n是否继续发布？(y/n): ');
        if (!ok) {
            console.log(c.yellow('已取消'));
            process.exit(0);
        }
    }

    // 4. 显示发布信息
    const branch = run('git branch --show-current');
    const lastCommit = run('git log --oneline -1');

    console.log(`\n${c.green(`📦 发布版本：${tag}`)}`);
    console.log(`📌 当前分支：${branch}`);
    console.log(`📝 最新提交：${lastCommit}\n`);

    const ok = await confirm('确认创建标签并推送？(y/n): ');
    if (!ok) {
        console.log(c.yellow('已取消'));
        process.exit(0);
    }

    // 5. 创建并推送 tag
    console.log(c.cyan(`\n[1/2] 正在创建标签 ${tag}...`));
    run(`git tag -a "${tag}" -m "Release ${tag}"`);

    console.log(c.cyan('[2/2] 正在推送标签到远程仓库...'));
    run(`git push origin "${tag}"`);

    console.log(c.green('\n✅ 发布成功！'));
    console.log(`🏷️  标签：${tag}`);
    console.log('🔄 GitHub Actions 将自动构建多平台 Docker 镜像');
    console.log(c.yellow('👀 查看构建状态：https://github.com/xiongaox/ValPoint/actions'));
}

main().catch((err) => {
    console.error(c.red(`❌ 发布失败：${err.message}`));
    process.exit(1);
});
