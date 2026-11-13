# tests/checks/02-theme.sh — Task 2 设计令牌、基础样式、明暗切换（由 tests/run.sh source）

has index.html 'localStorage.getItem("inkwell-theme")'
has index.html 'data-theme-toggle'
has index.html 'rel="stylesheet"'
has index.html 'integrity="sha'
before index.html 'localStorage.getItem("inkwell-theme")' 'rel="stylesheet"'
css=$(ls tests/.out/css/inkwell.*.css 2>/dev/null | head -1)
[ -n "$css" ] || fail "缺少 css/inkwell.<hash>.css"
grep -qF -- '--c-bg' "$css" || fail "CSS 缺少颜色变量"
grep -qE -- '\[data-theme="?dark"?\]' "$css" || fail "CSS 缺少深色规则"
ls tests/.out/js/main.*.js >/dev/null 2>&1 || fail "缺少 js/main.<hash>.js"
