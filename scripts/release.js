#!/usr/bin/env node

/**
 * ValPoint 版本发布脚本
 * 用途：自动创建 git tag 并推送，触发 GitHub Actions 构建多平台 Docker 镜像
 * 用法：
 *   node scripts/release.js          → 使用 package.json 中的版本号
 *   node scripts/release.js 1.2.3    → 指定版本号
 *   npm run release                  → 通过 npm script 调用
 */

const { execSync } = require('child_process');
const { version: pkgVersion } = require('../package.json');
const readline = require('readline');

// 颜色工具
const color = {
    green: (s) => `\x1b[32m${s}\x1b[0m`,
    yellow: (s) => `\x1b[33m${s}\x1b[0m`,
    cyan: (s) => `\x1b[36m${s}\x1b[0m`,
    red: (s) => `\x1b[31m${s}\x1b[0m`,
};

/** 执行命令并返回 stdout */
function run(cmd) {
    return execSync(cmd, { encoding: 'utf-8' }).trim();
}

/** 交互式确认 */
function confirm(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'y');
        });
    });
}

async function main() {
    console.log(color.cyan('============================='));
    console.log(color.cyan('   ValPoint Release Script   '));
    console.log(color.cyan('============================='));

    // 1. 确定版本号
    const version = process.argv[2] || pkgVersion;
    if (!version) {
        console.error(color.red('错误: 无法确定版本号'));
        process.exit(1);
    }

    const tag = `v${version}`;

    // 2. 检查 tag 是否已存在
    try {
        run(`git rev-parse ${tag}`);
        console.error(color.red(`错误: tag ${tag} 已存在`));
        console.log(`提示: 可以先删除旧 tag: ${color.yellow(`git tag -d ${tag} && git push origin :refs/tags/${tag}`)}`);
        process.exit(1);
    } catch {
        // tag 不存在，继续
    }

    // 3. 检查工作区状态
    const status = run('git status --porcelain');
    if (status) {
        console.log(color.yellow('\n警告: 工作区有未提交的更改'));
        console.log(status);
        const ok = await confirm('\n是否继续发布？(y/n): ');
        if (!ok) {
            console.log(color.yellow('已取消'));
            process.exit(0);
        }
    }

    // 4. 显示发布信息
    const branch = run('git branch --show-current');
    const lastCommit = run('git log --oneline -1');

    console.log(`\n${color.green(`发布版本: ${tag}`)}`);
    console.log(`当前分支: ${branch}`);
    console.log(`最新提交: ${lastCommit}\n`);

    const ok = await confirm('确认创建 tag 并推送？(y/n): ');
    if (!ok) {
        console.log(color.yellow('已取消'));
        process.exit(0);
    }

    // 5. 创建并推送 tag
    console.log(color.cyan(`\n[1/2] 创建 tag ${tag}...`));
    run(`git tag -a "${tag}" -m "Release ${tag}"`);

    console.log(color.cyan('[2/2] 推送 tag 到远程仓库...'));
    run(`git push origin "${tag}"`);

    console.log(color.green('\n✅ 发布成功！'));
    console.log(`tag: ${tag}`);
    console.log('GitHub Actions 将自动构建多平台 Docker 镜像');
    console.log(color.yellow('查看构建状态: https://github.com/xiongaox/ValPoint/actions'));
}

main().catch((err) => {
    console.error(color.red(`发布失败: ${err.message}`));
    process.exit(1);
});
