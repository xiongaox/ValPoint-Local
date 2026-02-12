#!/usr/bin/env node

/**
 * ValPoint 发布脚本 (Tag Trigger)
 * 用途：默认仅推送 tag 触发云端 Docker 构建
 * 用法：
 *   npm run release                       → 仅触发云端构建
 *   npm run release -- --local-build      → 先本地构建，再触发云端构建
 *   npm run release -- --dry-run          → 预览模式
 */

import { execSync } from 'child_process';
import { createInterface } from 'readline';

// 配置
const DOCKERHUB_NAMESPACE = 'xiongaox7806';
const DOCKERHUB_IMAGE = 'valpoint_s';
const GITHUB_ACTIONS_URL = 'https://github.com/xiongaox/ValPoint/actions';

// 是否为预览模式
const DRY_RUN = process.argv.includes('--dry-run') || process.argv.includes('--preview');
// 是否执行本地构建（默认 false）
const LOCAL_BUILD = process.argv.includes('--local-build');

// 颜色工具
const c = {
    green: (s) => `\x1b[32m${s} \x1b[0m`,
    yellow: (s) => `\x1b[33m${s} \x1b[0m`,
    cyan: (s) => `\x1b[36m${s} \x1b[0m`,
    red: (s) => `\x1b[31m${s} \x1b[0m`,
    dim: (s) => `\x1b[2m${s} \x1b[0m`,
    magenta: (s) => `\x1b[35m${s} \x1b[0m`,
};

/** 执行命令并返回 stdout（静默 stderr） */
function run(cmd, options = {}) {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'], ...options });
    return typeof output === 'string' ? output.trim() : '';
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

/** 交互式输入 */
function prompt(question) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * 从 Docker Hub API 获取镜像的最新语义化版本号
 * 这是版本号的唯一可靠来源，避免 git tag 跨分支污染
 */
async function getLatestDockerHubVersion() {
    const url = `https://hub.docker.com/v2/repositories/${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}/tags/?page_size=100`;
    try {
        const res = await fetch(url);
        if (!res.ok) return null;

        const data = await res.json();
        const versions = (data.results || [])
            .map((t) => t.name)
            .filter((name) => /^\d+\.\d+\.\d+$/.test(name))
            .sort((a, b) => {
                const pa = a.split('.').map(Number);
                const pb = b.split('.').map(Number);
                return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
            });

        return versions[0] || null;
    } catch {
        return null;
    }
}

/** 递增补丁版本号：1.0.0 → 1.0.1 */
function incrementPatch(version) {
    const parts = version.split('.').map(Number);
    parts[2] += 1;
    return parts.join('.');
}

/** 生成触发云端构建的 Git 命令 */
function getCloudTriggerCommands(tag) {
    return {
        createTag: `git tag -a ${tag} -m "release: ${tag}"`,
        pushTag: `git push origin ${tag}`,
    };
}

async function main() {
    const modeLabel = DRY_RUN ? c.magenta(' [预览模式]') : '';
    console.log(c.cyan('================================'));
    console.log(c.cyan('   ValPoint 发布工具') + modeLabel);
    console.log(c.cyan('================================'));

    if (DRY_RUN) {
        console.log(c.magenta('🔍 预览模式：不会实际执行构建\n'));
    }

    // 1. 显示当前分支信息
    const branch = run('git branch --show-current');
    const lastCommit = run('git log --oneline -1');
    console.log(`📌 当前分支：${c.green(branch)}`);
    console.log(`📝 最新提交：${lastCommit}`);

    // 2. 检查当前分支是否为 main
    if (branch === 'main') {
        console.log(c.green('\n✅ 当前为 main 分支，将使用 tag 触发云端构建。'));
    } else {
        console.log(c.yellow(`\n⚠️  当前是 '${branch}' 分支，推送 tag 后仍会触发云端构建。`));
    }

    // 3. 确定版本号
    let version;
    const argVersion = process.argv.find((a) => /^v?\d+\.\d+\.\d+$/.test(a));

    if (argVersion) {
        version = argVersion.replace(/^v/, '');
    } else {
        // 从 Docker Hub 获取最新版本号
        console.log(c.dim(`\n🔄 正在查询 Docker Hub (${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE})...`));
        const latestVersion = await getLatestDockerHubVersion();

        if (latestVersion) {
            const nextVersion = incrementPatch(latestVersion);
            console.log(`🐳 Docker Hub 最新版本：${c.yellow(latestVersion)}`);
            console.log(`📦 建议下一版本：${c.green(nextVersion)}`);
            const input = await prompt(`\n请输入版本号 ${c.dim(`(回车默认 ${nextVersion})`)}: `);
            version = input || nextVersion;
        } else {
            console.log(c.yellow('⚠️  无法获取 Docker Hub 版本信息'));
            const input = await prompt('请输入版本号 (例如 1.0.0): ');
            if (!input) {
                console.error(c.red('❌ 错误：必须指定版本号'));
                process.exit(1);
            }
            version = input;
        }
    }

    // 去掉可能手动输入的 'v' 前缀
    version = version.replace(/^v/, '');
    const tag = `v${version}`;
    const cloudCommands = getCloudTriggerCommands(tag);

    // 3. 校验版本号格式
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        console.error(c.red(`❌ 错误：版本号格式不正确 "${version}"，应为 x.y.z`));
        process.exit(1);
    }

    // 4. 检查 tag 是否已存在
    if (tryRun(`git rev-parse ${tag}`)) {
        console.error(c.red(`\n❌ 错误：标签 ${tag} 已存在`));
        console.log(`💡 提示：可以先删除旧标签：${c.yellow(`git tag -d ${tag} && git push origin :refs/tags/${tag}`)}`);
        process.exit(1);
    }

    // 5. 检查工作区状态（预览模式跳过）
    if (!DRY_RUN) {
        const status = run('git status --porcelain');
        if (status) {
            console.log(c.yellow('\n⚠️  工作区有未提交的更改：'));
            console.log(status);
            const input = await prompt('\n是否继续发布？(y/n): ');
            if (input.toLowerCase() !== 'y') {
                console.log(c.yellow('已取消'));
                process.exit(0);
            }
        }
    }

    const localBuildCommand = `docker build -t ${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:${version} .`;
    console.log(`\n${c.cyan(`🚀 准备发布版本: ${tag}`)}`);
    if (LOCAL_BUILD) {
        console.log(c.dim(`本次将先执行本地构建，再触发云端构建。`));
    } else {
        console.log(c.dim(`默认仅触发云端构建（不执行本地 docker build）。`));
    }

    if (DRY_RUN) {
        console.log(c.magenta('\n🔗 预览：将执行以下命令'));
        if (LOCAL_BUILD) {
            console.log(c.dim(localBuildCommand));
        }
        console.log(c.dim(cloudCommands.createTag));
        console.log(c.dim(cloudCommands.pushTag));
        console.log(c.magenta('\n✅ [预览模式] 模拟构建完成 (未实际执行)'));
        process.exit(0);
    }

    const confirm = await prompt('确认开始发布？(y/n): ');
    if (confirm.toLowerCase() !== 'y') {
        console.log(c.yellow('已取消'));
        process.exit(0);
    }

    try {
        if (LOCAL_BUILD) {
            console.log(c.cyan(`\n[1/2] 正在执行 ${localBuildCommand}`));
            run(localBuildCommand, { stdio: 'inherit' });
            run(`docker tag ${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:${version} ${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:latest`);
            console.log(c.green('✅ 本地 Docker 构建成功'));
        }

        console.log(c.cyan(`\n[${LOCAL_BUILD ? '2/2' : '1/1'}] 正在创建并推送标签 ${tag}（触发 GitHub Actions）`));
        run(cloudCommands.createTag, { stdio: 'inherit' });
        run(cloudCommands.pushTag, { stdio: 'inherit' });

        console.log(c.green('\n✅ 发布命令执行完成！'));
        if (LOCAL_BUILD) {
            console.log(`镜像: ${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:${version}`);
            console.log(`镜像: ${DOCKERHUB_NAMESPACE}/${DOCKERHUB_IMAGE}:latest`);
        }
        console.log(c.green(`✅ 云端构建触发标签: ${tag}`));
        console.log(`查看 Actions: ${GITHUB_ACTIONS_URL}/workflows/docker-build.yml`);
    } catch (e) {
        console.error(c.red(`\n❌ 发布失败: ${e.message}`));
        process.exit(1);
    }
}

main().catch((err) => {
    console.error(c.red(`❌ 脚本执行失败：${err.message}`));
    process.exit(1);
});
