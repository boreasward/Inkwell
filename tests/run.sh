#!/usr/bin/env bash
# tests/run.sh — Inkwell 主题构建与产物断言。从仓库根运行：bash tests/run.sh
set -u
cd "$(dirname "$0")/.."

source tests/lib.sh

# build <名称> <strict|no> [hugo 参数…]
# 退出码非 0 即失败；strict 时输出含 WARN/ERROR 也算失败。
build() {
  local name="$1" strict="$2"
  shift 2
  local out code
  echo "== 构建 $name =="
  out=$(hugo "$@" 2>&1)
  code=$?
  if [ "$code" -ne 0 ]; then
    printf '%s\n' "$out"
    fail "$name 构建退出码 $code"
    exit 1
  fi
  if [ "$strict" = "strict" ] && printf '%s\n' "$out" | grep -qE '(WARN|ERROR)'; then
    printf '%s\n' "$out"
    fail "$name 构建输出含 WARN/ERROR"
    exit 1
  fi
}

# 1. 默认构建
build "默认" strict --source exampleSite --destination "$PWD/tests/.out" --cleanDestinationDir
# 2. 最小配置构建（只要求退出码 0）
build "最小配置" no --source exampleSite --config "$PWD/tests/fixtures/minimal.toml" --destination "$PWD/tests/.out-min" --cleanDestinationDir
# 3. 子路径构建
build "子路径" strict --source exampleSite --baseURL https://example.org/blog/ --destination "$PWD/tests/.out-sub" --cleanDestinationDir

# 4. 摘要样式构建（首页列表样式取自环境变量 HUGO_PARAMS_HOME_LISTSTYLE）
HUGO_PARAMS_HOME_LISTSTYLE=summary build "摘要样式" strict --source exampleSite --destination "$PWD/tests/.out-summary" --cleanDestinationDir

# 5. 依次 source 检查脚本（按文件名字典序）
echo "== 产物断言 =="
for f in tests/checks/*.sh; do
  # shellcheck disable=SC1090
  source "$f"
done

# 6. node --test（有 node 且 tests/js/ 存在时）
if command -v node >/dev/null 2>&1; then
  if [ -d tests/js ]; then
    # 新版 Node 把参数当 glob，传目录会报 "Could not find"；这里显式列出测试文件
    echo "== node --test tests/js/*.test.js =="
    node --test tests/js/*.test.js || fail "node --test 失败"
  else
    echo "提示：tests/js/ 不存在，跳过 node 测试"
  fi
else
  echo "提示：未找到 node，跳过 node 测试"
fi

# 7. 汇总
if [ "$FAILED" = 1 ]; then
  exit 1
fi
echo "== 全部通过 =="
