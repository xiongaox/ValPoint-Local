/**
 * build-all.js - 统一构建脚本
 * 
 * 1. 构建主应用 (Vite)
 * 2. 构建 VitePress 文档
 * 3. 将 VitePress 输出复制到 dist/wiki/
 */
import { execSync } from 'child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

console.log('🚀 开始统一构建...\n');

// Step 1: 构建主应用
console.log('📦 [1/3] 构建主应用...');
execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
console.log('✅ 主应用构建完成\n');

// Step 2: 构建 VitePress 文档
console.log('📚 [2/3] 构建 VitePress 文档...');
execSync('npm run docs:build', { cwd: projectRoot, stdio: 'inherit' });
console.log('✅ VitePress 文档构建完成\n');

// Step 3: 复制 VitePress 输出到 dist/wiki/
console.log('📋 [3/3] 合并文档到 dist/wiki/...');
const vitepressDistDir = resolve(projectRoot, 'docs/.vitepress/dist');
const targetWikiDir = resolve(projectRoot, 'dist/wiki');

if (!existsSync(vitepressDistDir)) {
    console.error('❌ VitePress 构建输出目录不存在:', vitepressDistDir);
    process.exit(1);
}

// 清理旧的 wiki 目录
if (existsSync(targetWikiDir)) {
    rmSync(targetWikiDir, { recursive: true });
}

// 复制文件
mkdirSync(targetWikiDir, { recursive: true });
cpSync(vitepressDistDir, targetWikiDir, { recursive: true });

console.log('✅ 文档已复制到 dist/wiki/\n');
console.log('🎉 统一构建完成！');
console.log('   - 主应用: dist/');
console.log('   - 文档站: dist/wiki/');
