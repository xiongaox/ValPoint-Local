#!/bin/bash

# auto-tag.sh - 为未打 tag 的 commit 自动递增版本号
# 
# 使用方法 (Usage):
# 
# Linux / macOS:
#   ./scripts/auto_tag.sh        # 预览模式，显示将要创建的 tag
#   ./scripts/auto_tag.sh --run  # 执行模式，实际创建并推送 tag
# 
# Windows (PowerShell / CMD):
#   bash scripts/auto_tag.sh        # 预览模式 (需要 WSL 或 Git Bash)
#   bash scripts/auto_tag.sh --run  # 执行模式

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取当前最新 tag
get_latest_tag() {
    git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"
}

# 解析版本号
parse_version() {
    local version=$1
    version=${version#v}  # 移除 v 前缀
    IFS='.' read -r major minor patch <<< "$version"
    echo "$major $minor $patch"
}

# 递增补丁版本号
increment_patch() {
    local major=$1 minor=$2 patch=$3
    patch=$((patch + 1))
    echo "v${major}.${minor}.${patch}"
}

# 获取未打 tag 的 commit 列表
get_untagged_commits() {
    local latest_tag=$(get_latest_tag)
    if [ "$latest_tag" = "v0.0.0" ]; then
        # 没有任何 tag，获取所有 commit
        git log --oneline --reverse
    else
        # 获取从最新 tag 到 HEAD 的所有 commit
        git log --oneline --reverse "${latest_tag}..HEAD"
    fi
}

# 主函数
main() {
    local run_mode=false
    if [ "$1" = "--run" ]; then
        run_mode=true
    fi

    echo -e "${BLUE}======================================${NC}"
    echo -e "${BLUE}        Auto Tag Script${NC}"
    echo -e "${BLUE}======================================${NC}"
    echo

    # 获取最新 tag
    local latest_tag=$(get_latest_tag)
    echo -e "Current latest tag: ${GREEN}${latest_tag}${NC}"
    echo

    # 获取未打 tag 的 commits
    local commits=$(get_untagged_commits)

    if [ -z "$commits" ]; then
        echo -e "${YELLOW}No commits need tagging${NC}"
        exit 0
    fi

    # 解析当前版本
    read major minor patch <<< $(parse_version "$latest_tag")

    echo -e "Commits to tag:"
    echo "--------------------------------------"
    
    local count=0
    local tags_to_push=()

    while IFS= read -r line; do
        if [ -z "$line" ]; then
            continue
        fi

        count=$((count + 1))
        local commit_hash=$(echo "$line" | cut -d' ' -f1)
        local commit_msg=$(echo "$line" | cut -d' ' -f2-)
        local new_tag=$(increment_patch $major $minor $patch)

        echo -e "${YELLOW}${new_tag}${NC} <- ${commit_hash} ${commit_msg}"

        if $run_mode; then
            # 为该 commit 打 tag
            git tag "$new_tag" "$commit_hash"
            tags_to_push+=("$new_tag")
        fi
        
        # 更新 patch 版本号
        patch=$((patch + 1))
    done <<< "$commits"
    
    echo "--------------------------------------"
    echo -e "Total: ${GREEN}${count}${NC} commit(s)"
    echo

    if $run_mode; then
        if [ ${#tags_to_push[@]} -gt 0 ]; then
            echo -e "${BLUE}Pushing tags...${NC}"
            git push origin "${tags_to_push[@]}"
            echo -e "${GREEN}All tags pushed!${NC}"
        fi
    else
        echo -e "${YELLOW}Preview mode - no tags created${NC}"
        echo -e "Run ${GREEN}./scripts/auto_tag.sh --run${NC} to create and push tags"
    fi
}

main "$@"