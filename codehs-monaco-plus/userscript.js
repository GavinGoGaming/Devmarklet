// ==UserScript==
// @name         CodeHS Monaco
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  codeHS custom monaco theme, auto import, and autocomplete for java
// @author       GavinGoGaming, Claude
// @match        https://codehs.com/student/*/section/*/assignment/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codehs.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      raw.githubusercontent.com
// ==/UserScript==

// Claude used to add logging & insertion for auto-importing
(function () {
  'use strict';

  const LOG_PREFIX = '[codehs-monaco]';
  const log = (...args) => console.log(LOG_PREFIX, ...args);
  const warn = (...args) => console.warn(LOG_PREFIX, ...args);
  const error = (...args) => console.error(LOG_PREFIX, ...args);

  log('Script loaded. URL:', location.href);

    // has to be in monaco format
    // you can put any vscode theme from 7zip opening a .vsix extension
    // into this program's vscode/[color] folder: https://github.com/dongchengjie/monaco-editor-themes
    // then npm run build
    // and themes/[...]/theme.json is your result

  const THEME_URL =
    'https://raw.githubusercontent.com/GavinGoGaming/Devmarklet/refs/heads/main/codehs-monaco-plus/theme-bearded-vivid-dark.json';
  const IMPORT_MAP_URL =
    'https://raw.githubusercontent.com/GavinGoGaming/Devmarklet/refs/heads/main/codehs-monaco-plus/java-imports-full.json';

    // Runs in a userscript.html context and not the window context!
  const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
  log('unsafeWindow available:', typeof unsafeWindow !== 'undefined');

  function waitForMonaco(callback, timeout = 15000) {
    log('Waiting for window.monaco...');
    const start = Date.now();
    const interval = setInterval(() => {
      if (pageWindow.monaco && pageWindow.monaco.editor) {
        clearInterval(interval);
        log('Monaco found after', Date.now() - start, 'ms');
        callback(pageWindow.monaco);
      } else if (Date.now() - start > timeout) {
        clearInterval(interval);
        warn('Monaco NOT found within', timeout, 'ms. pageWindow.monaco =', pageWindow.monaco);
        warn('If this still fails with unsafeWindow, Monaco may be scoped inside an iframe rather than the top-level page window.');
      }
    }, 200);
  }
  function gmFetchJson(url, label) {
    log(`Fetching ${label} from`, url);
    return new Promise((resolve, reject) => {
      if (typeof GM_xmlhttpRequest === 'undefined') {
        reject(new Error('GM_xmlhttpRequest is not available — check @grant is set correctly and the script was reinstalled after editing it.'));
        return;
      }
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: function (response) {
          log(`${label} fetch responded with status`, response.status);
          if (response.status >= 200 && response.status < 300) {
            try {
              const parsed = JSON.parse(response.responseText);
              log(`${label} parsed OK.`, Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length, 'top-level entries');
              resolve(parsed);
            } catch (e) {
              error(`${label} JSON parse failed:`, e.message);
              error(`${label} raw response (first 300 chars):`, response.responseText.slice(0, 300));
              reject(e);
            }
          } else {
            error(`${label} fetch failed with status ${response.status}`);
            error(`${label} response body (first 300 chars):`, (response.responseText || '').slice(0, 300));
            reject(new Error(`${label} fetch failed with status ${response.status}`));
          }
        },
        onerror: function (err) {
          error(`${label} GM_xmlhttpRequest onerror:`, err);
          reject(new Error(`${label} GM_xmlhttpRequest error`));
        },
        ontimeout: function () {
          error(`${label} fetch timed out`);
          reject(new Error(`${label} fetch timed out`));
        },
      });
    });
  }

  function getImportEdit(model, importMap, className) {
    const fqcn = importMap[className];
    if (!fqcn || fqcn.includes('no import needed')) return [];

    const text = model.getValue();
    const importLine = `import ${fqcn};`;
    if (text.includes(importLine)) return [];

    const lines = text.split('\n');
    let insertLine = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('package ') || trimmed.startsWith('import ')) {
        insertLine = i + 1;
      }
    }

    return [
      {
        range: {
          startLineNumber: insertLine + 1,
          startColumn: 1,
          endLineNumber: insertLine + 1,
          endColumn: 1,
        },
        text: importLine + '\n',
      },
    ];
  }

  function registerKeywordCompletions(monaco) {
    log('Registering keyword/snippet completion provider for java...');
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: function (model, position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const keywords = [
          'abstract', 'assert', 'break', 'case', 'catch', 'class', 'const',
          'continue', 'default', 'do', 'else', 'enum', 'extends', 'final',
          'finally', 'for', 'goto', 'if', 'implements', 'import', 'instanceof',
          'interface', 'native', 'new', 'package', 'private', 'protected',
          'public', 'return', 'static', 'strictfp', 'super', 'switch',
          'synchronized', 'this', 'throw', 'throws', 'transient', 'try',
          'void', 'volatile', 'while',
        ];

        const primitives = ['boolean', 'byte', 'char', 'double', 'float', 'int', 'long', 'short'];

        const snippets = [
          { label: 'main', insertText: 'public static void main(String[] args) {\n\t$0\n}', documentation: 'main method' },
          { label: 'sout', insertText: 'System.out.println($0);', documentation: 'print line' },
          { label: 'fori', insertText: 'for (int ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n\t$0\n}', documentation: 'indexed for loop' },
          { label: 'foreach', insertText: 'for (${1:Type} ${2:item} : ${3:collection}) {\n\t$0\n}', documentation: 'enhanced for loop' },
          { label: 'psf', insertText: 'public static final ${1:TYPE} ${2:NAME} = ${3:value};', documentation: 'public static final field' },
          { label: 'try', insertText: 'try {\n\t$0\n} catch (${1:Exception} e) {\n\t\n}', documentation: 'try/catch' },
        ];

        const suggestions = [
          ...keywords.map((k) => ({ label: k, kind: monaco.languages.CompletionItemKind.Keyword, insertText: k, range })),
          ...primitives.map((k) => ({ label: k, kind: monaco.languages.CompletionItemKind.TypeParameter, insertText: k, range })),
          ...snippets.map((s) => ({
            label: s.label,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: s.insertText,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: s.documentation,
            range,
          })),
        ];

        return { suggestions };
      },
    });
    log('Keyword/snippet completion provider registered.');
  }

  function registerImportCompletions(monaco, importMap) {
    log('Registering class/auto-import completion provider with', Object.keys(importMap).length, 'classes...');
    monaco.languages.registerCompletionItemProvider('java', {
      provideCompletionItems: function (model, position) {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = Object.keys(importMap).map((className) => ({
          label: className,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: className,
          range,
          detail: importMap[className],
          additionalTextEdits: getImportEdit(model, importMap, className),
        }));

        return { suggestions };
      },
    });
    log('Class/auto-import completion provider registered.');
  }

  waitForMonaco((monaco) => {
    log('monaco.editor.defineTheme / setTheme starting...');

    gmFetchJson(THEME_URL, 'theme')
      .then((theme) => {
        monaco.editor.defineTheme('bearded-vivid-black', theme);
        monaco.editor.setTheme('bearded-vivid-black');
        log('Theme applied.');
      })
      .catch((err) => {
        error('Theme failed to load, falling back to vs-dark. Reason:', err.message);
        monaco.editor.setTheme('vs-dark');
      });

    registerKeywordCompletions(monaco);

    gmFetchJson(IMPORT_MAP_URL, 'import map')
      .then((importMap) => {
        registerImportCompletions(monaco, importMap);
      })
      .catch((err) => {
        warn('Import map unavailable, class auto-import disabled. Reason:', err.message);
      });
  });

  log('Script finished initial synchronous execution — waiting on async callbacks above.');
})();
