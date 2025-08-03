// 语言图标映射 - 使用 emoji
export const languageIcons: Record<string, string> = {
  javascript: "🟨",
  typescript: "🔷",
  vue: "💚",
  rust: "🦀",
  python: "🐍",
  css: "🎨",
  html: "🌐",
  go: "🐹",
  java: "☕",
  cpp: "⚡",
  c: "🔵",
  php: "🐘",
  sql: "🗄️",
  shell: "🐚",
  json: "📋",
  markdown: "📝",
  yaml: "⚙️",
  xml: "📄",
  text: "📄",
};

export const languages = [
  "c",
  "cpp",
  "css",
  "go",
  "html",
  "java",
  "javascript",
  "json",
  "markdown",
  "php",
  "python",
  "rust",
  "shell",
  "sql",
  "typescript",
  "vue",
  "xml",
  "yaml",
  "text",
];

export function getLanguageIcon(language: string): string {
  return languageIcons[language] || "📄";
}

/**
 * 统一的语言检测函数
 * 根据内容自动检测编程语言类型
 * @param content 代码内容
 * @returns 检测到的语言类型
 */
export function detectLanguage(content: string): string {
  if (!content.trim()) return "text";

  const lowerContent = content.toLowerCase();

  // 检测 JSON
  try {
    JSON.parse(content);
    return "json";
  } catch {}

  // 检测 HTML
  if (
    content.includes("<html") ||
    content.includes("<!DOCTYPE") ||
    (content.includes("<") &&
      content.includes(">") &&
      (content.includes("div") ||
        content.includes("span") ||
        content.includes("body")))
  ) {
    return "html";
  }

  // 检测 Vue
  if (
    content.includes("<template>") ||
    content.includes("<script setup") ||
    content.includes("defineProps") ||
    content.includes("defineEmits")
  ) {
    return "vue";
  }

  // 检测 CSS
  if (
    content.includes("{") &&
    content.includes("}") &&
    (lowerContent.includes("color:") ||
      lowerContent.includes("margin:") ||
      lowerContent.includes("padding:") ||
      lowerContent.includes("display:") ||
      lowerContent.includes("font-") ||
      lowerContent.includes("background"))
  ) {
    return "css";
  }

  // 检测 SQL
  if (
    lowerContent.includes("select") ||
    lowerContent.includes("from") ||
    lowerContent.includes("where") ||
    lowerContent.includes("insert") ||
    lowerContent.includes("update") ||
    lowerContent.includes("delete")
  ) {
    return "sql";
  }

  // 检测 Shell
  if (
    lowerContent.includes("git ") ||
    lowerContent.includes("npm ") ||
    lowerContent.includes("cd ") ||
    lowerContent.includes("ls ") ||
    lowerContent.includes("mkdir ") ||
    content.startsWith("#!/bin/")
  ) {
    return "shell";
  }

  // 检测 Rust
  if (
    content.includes("fn ") ||
    content.includes("use ") ||
    content.includes("struct ") ||
    content.includes("impl ") ||
    content.includes("let mut") ||
    content.includes("use std::")
  ) {
    return "rust";
  }

  // 检测 Python
  if (
    content.includes("def ") ||
    content.includes("import ") ||
    content.includes("from ") ||
    content.includes("class ") ||
    content.includes("if __name__") ||
    content.includes("print(")
  ) {
    return "python";
  }

  // 检测 Go
  if (
    content.includes("package ") ||
    content.includes("func ") ||
    content.includes("import (") ||
    content.includes("go ")
  ) {
    return "go";
  }

  // 检测 Java
  if (
    content.includes("public class") ||
    content.includes("private ") ||
    content.includes("System.out.println") ||
    content.includes("@Override")
  ) {
    return "java";
  }

  // 检测 C++
  if (
    content.includes("#include") ||
    content.includes("std::") ||
    content.includes("namespace ") ||
    content.includes("class ") ||
    content.includes("template<") ||
    content.includes("cout <<") ||
    content.includes("cin >>") ||
    content.includes("vector<") ||
    content.includes("string ") ||
    content.includes("int main(") ||
    content.includes("void ") ||
    content.includes("const ") ||
    content.includes("&") ||
    content.includes("->")
  ) {
    return "cpp";
  }

  // 检测 C
  if (
    content.includes("#include") ||
    content.includes("stdio.h") ||
    content.includes("stdlib.h") ||
    content.includes("printf(") ||
    content.includes("scanf(") ||
    content.includes("malloc(") ||
    content.includes("free(") ||
    content.includes("struct ") ||
    content.includes("typedef ") ||
    content.includes("int main(") ||
    content.includes("void ") ||
    content.includes("char ") ||
    content.includes("int ") ||
    content.includes("float ") ||
    content.includes("double ") ||
    content.includes("return 0;")
  ) {
    return "c";
  }

  // 检测 PHP
  if (
    content.includes("<?php") ||
    content.includes("$") ||
    content.includes("echo ") ||
    content.includes("function ")
  ) {
    return "php";
  }

  // 检测 JavaScript/TypeScript
  if (
    content.includes("function") ||
    content.includes("const ") ||
    content.includes("let ") ||
    content.includes("var ") ||
    content.includes("=>") ||
    content.includes("import ") ||
    content.includes("export ") ||
    content.includes("console.log")
  ) {
    return content.includes("interface ") ||
      content.includes(": string") ||
      content.includes(": number")
      ? "typescript"
      : "javascript";
  }

  // 检测 YAML
  if (
    content.includes("---") ||
    (content.includes(":") && !content.includes("{") && !content.includes("("))
  ) {
    return "yaml";
  }

  // 检测 XML
  if (
    content.includes("<?xml") ||
    (content.includes("<") && content.includes(">") && content.includes("</"))
  ) {
    return "xml";
  }

  // 检测 Markdown
  if (
    content.includes("# ") ||
    content.includes("## ") ||
    content.includes("```") ||
    content.includes("![") ||
    content.includes("[](")
  ) {
    return "markdown";
  }

  // 默认为文本
  return "text";
}
