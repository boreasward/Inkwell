# tests/lib.sh — 断言函数库，被 tests/run.sh 与 tests/checks/*.sh source。
# 所有断言作用于 $OUT（默认 tests/.out）下的相对路径；失败打印 "FAIL: …" 并置 FAILED=1。
OUT="${OUT:-tests/.out}"
FAILED="${FAILED:-0}"

fail() {
  echo "FAIL: $*"
  FAILED=1
}

# exists <file>：断言产物文件存在
exists() {
  [ -f "$OUT/$1" ] || fail "exists $1：$OUT/$1 不存在"
}

# has <file> <固定字符串>：断言文件包含该固定字符串
has() {
  local f="$OUT/$1" s="$2"
  [ -f "$f" ] || { fail "has $1：$f 不存在"; return; }
  grep -qF -- "$s" "$f" || fail "has $1：未找到固定字符串 '$s'"
}

# hasnt <file> <固定字符串>：断言文件不包含该固定字符串
hasnt() {
  local f="$OUT/$1" s="$2"
  [ -f "$f" ] || { fail "hasnt $1：$f 不存在"; return; }
  if grep -qF -- "$s" "$f"; then
    fail "hasnt $1：不应出现固定字符串 '$s'"
  fi
}

# before <file> <A> <B>：A 首次出现的行号小于 B 首次出现的行号
before() {
  local f="$OUT/$1" a="$2" b="$3" la lb
  [ -f "$f" ] || { fail "before $1：$f 不存在"; return; }
  la=$(grep -nF -- "$a" "$f" | head -n1 | cut -d: -f1)
  lb=$(grep -nF -- "$b" "$f" | head -n1 | cut -d: -f1)
  if [ -z "$la" ] || [ -z "$lb" ]; then
    fail "before $1：'$a' 或 '$b' 未找到"
  elif [ "$la" -ge "$lb" ]; then
    fail "before $1：'$a'（第 $la 行）应出现在 '$b'（第 $lb 行）之前"
  fi
}
