// ==UserScript==
// @name         CodeHS GradAce
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  codeHS custom ace theme, auto import, and autocomplete for java
// @author       GavinGoGaming, Claude
// @match        https://codehs.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=codehs.com
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        GM_addElement
// @connect      cdn.jsdelivr.net
// @connect      raw.githubusercontent.com
// @license      GPL-2.0
// ==/UserScript==

(function() {
    'use strict';
    const themes = {
        'onedark': `.ace-gradace {
    background-color: #282c34;
    color: #abb2bf;
}
.ace-gradace .ace_gutter {
    background: #21252b;
    color: #4b5263;
}
.ace-gradace .ace_print-margin {
    width: 1px;
    background: #3e4451;
}
.ace-gradace .ace_cursor {
    color: #528bff;
}
.ace-gradace .ace_marker-layer .ace_selection {
    background: #3e4451;
}
.ace-gradace .ace_marker-layer .ace_active-line {
    background: #2c313c;
}
.ace-gradace .ace_gutter-active-line {
    background-color: #2c313c;
}

/* --- Token Highlights (Vivid Saturated Variance) --- */
.ace-gradace .ace_keyword,
.ace-gradace .ace_meta.ace_tag,
.ace-gradace .ace_storage.ace_type {
    color: #ef596f; /* Vivid Crimson Red */
}
.ace-gradace .ace_string {
    color: #89ca78; /* Vivid Emerald Green */
}
.ace-gradace .ace_constant.ace_numeric {
    color: #d19a66; /* Vivid Orange */
}
.ace-gradace .ace_constant.ace_language,
.ace-gradace .ace_constant.ace_character,
.ace-gradace .ace_constant.ace_other {
    color: #da7dae;
}
.ace-gradace .ace_support.ace_function,
.ace-gradace .ace_entity.ace_name.ace_function {
    color: #61afef; /* Vivid Sky Blue */
}
.ace-gradace .ace_variable,
.ace-gradace .ace_variable.ace_parameter {
    color: #e5c07b; /* Vivid Amber Yellow */
}
.ace-gradace .ace_comment {
    color: #5c6370;
    font-style: italic;
}
.ace-gradace .ace_entity.ace_other.ace_attribute-name {
    color: #d19a66;
}`,
        'beardedDarkVivid': `
.ace-gradace .ace_gutter {
  background: #000000;
  color: #4a4f5e;
}
.ace-gradace .ace_print-margin {
  width: 1px;
  background: #1a1a1f;
}
.ace-gradace {
  background-color: #000000;
  color: #d4d7de;
}
.ace-gradace .ace_cursor {
  color: #ff2e7e;
  border-left: 2px solid #ff2e7e;
}
.ace-gradace .ace_marker-layer .ace_selection {
  background: rgba(255, 46, 126, 0.22);
}
.ace-gradace.ace_multiselect .ace_selection.ace_start {
  box-shadow: 0 0 3px 0px #000000;
}
.ace-gradace .ace_marker-layer .ace_step {
  background: rgba(255, 213, 79, 0.25);
}
.ace-gradace .ace_marker-layer .ace_bracket {
  margin: -1px 0 0 -1px;
  border: 1px solid #5c6178;
}
.ace-gradace .ace_marker-layer .ace_active-line {
  background: #0c0c10;
}
.ace-gradace .ace_gutter-active-line {
  background-color: #0c0c10;
  color: #ff2e7e;
}
.ace-gradace .ace_marker-layer .ace_selected-word {
  border: 1px solid rgba(255, 46, 126, 0.45);
  background: rgba(255, 46, 126, 0.10);
}
.ace-gradace .ace_invisible {
  color: #2a2d38;
}
.ace-gradace .ace_indent-guide {
  border-right: 1px solid #1a1b22;
}
.ace-gradace .ace_indent-guide-active {
  border-right: 1px solid #3a3d4c;
}
.ace-gradace .ace_fold-widget {
  filter: invert(0.6);
}
.ace-gradace .ace_fold {
  background-color: #1fb2ff;
  border-color: #d4d7de;
}
.ace-gradace .ace_text-layer .ace_hidden-cursors .ace_cursor {
  opacity: 0.5;
}

/* ---------- Tokens ---------- */
.ace-gradace .ace_keyword,
.ace-gradace .ace_keyword.ace_operator.ace_new {
  color: #ff2e7e;
  font-style: italic;
}
.ace-gradace .ace_keyword.ace_operator {
  color: #7ad7ff;
  font-style: normal;
}
.ace-gradace .ace_storage,
.ace-gradace .ace_storage.ace_type {
  color: #c47cff;
  font-style: italic;
}
.ace-gradace .ace_constant {
  color: #ff9d3b;
}
.ace-gradace .ace_constant.ace_language {
  color: #ff9d3b;
  font-style: italic;
}
.ace-gradace .ace_constant.ace_numeric {
  color: #ffc857;
  font-style: normal;
}
.ace-gradace .ace_constant.ace_character,
.ace-gradace .ace_constant.ace_character.ace_escape {
  color: #ffc857;
  font-style: italic;
}
.ace-gradace .ace_constant.ace_other {
  color: #ff9d3b;
  font-style: italic;
}
.ace-gradace .ace_string {
  color: #3ee6a0;
  font-style: italic;
}
.ace-gradace .ace_string.ace_regexp {
  color: #5cf2d6;
  font-style: italic;
}
.ace-gradace .ace_comment {
  color: #5d6378;
  font-style: italic;
}
.ace-gradace .ace_comment.ace_doc {
  color: #6e7590;
  font-style: italic;
}
.ace-gradace .ace_comment.ace_doc.ace_tag {
  color: #8a93b3;
  font-style: italic;
}
.ace-gradace .ace_variable {
  color: #d4d7de;
}
.ace-gradace .ace_variable.ace_language {
  color: #ff5f6d;
  font-style: italic;
}
.ace-gradace .ace_variable.ace_parameter {
  color: #ffb27a;
  font-style: italic;
}
.ace-gradace .ace_identifier {
  color: #d4d7de;
}
.ace-gradace .ace_entity.ace_name.ace_function,
.ace-gradace .ace_support.ace_function {
  color: #1fb2ff;
  font-style: italic;
}
.ace-gradace .ace_support.ace_function.ace_dom {
  color: #1fb2ff;
  font-style: italic;
}
.ace-gradace .ace_support.ace_constant {
  color: #ff9d3b;
  font-style: italic;
}
.ace-gradace .ace_support.ace_class,
.ace-gradace .ace_support.ace_type,
.ace-gradace .ace_entity.ace_name.ace_type {
  color: #ffd54f;
  font-style: italic;
}
.ace-gradace .ace_support.ace_other {
  color: #7ad7ff;
  font-style: italic;
}
.ace-gradace .ace_entity.ace_other.ace_attribute-name {
  color: #ffc857;
  font-style: italic;
}
.ace-gradace .ace_entity.ace_name.ace_tag,
.ace-gradace .ace_meta.ace_tag {
  color: #ff2e7e;
  font-style: normal;
}
.ace-gradace .ace_meta.ace_tag.ace_tag-name {
  color: #ff2e7e;
}
.ace-gradace .ace_punctuation,
.ace-gradace .ace_paren,
.ace-gradace .ace_punctuation.ace_operator {
  color: #8f95ad;
  font-style: normal;
}
.ace-gradace .ace_meta {
  color: #7ad7ff;
  font-style: italic;
}
.ace-gradace .ace_markup.ace_heading {
  color: #ff2e7e;
  font-weight: bold;
  font-style: italic;
}
.ace-gradace .ace_markup.ace_list {
  color: #ffc857;
}
.ace-gradace .ace_markup.ace_underline {
  text-decoration: underline;
}
.ace-gradace .ace_markup.ace_quote {
  color: #6e7590;
  font-style: italic;
}
.ace-gradace .ace_markup.ace_bold {
  font-weight: bold;
}
.ace-gradace .ace_markup.ace_italic {
  font-style: italic;
}
.ace-gradace .ace_markup.ace_href {
  color: #1fb2ff;
  font-style: italic;
}
.ace-gradace .ace_invalid {
  color: #ffffff;
  background-color: #ff2e4d;
  font-style: italic;
}
.ace-gradace .ace_invalid.ace_deprecated {
  color: #ffffff;
  background-color: #7a3dff;
  font-style: italic;
}

/* ---------- Diffs, errors, widgets ---------- */
.ace-gradace .ace_gutter-cell.ace_error {
  background-color: rgba(255, 46, 77, 0.15);
}
.ace-gradace .ace_gutter-cell.ace_warning {
  background-color: rgba(255, 200, 87, 0.15);
}
.ace-gradace .ace_gutter-cell.ace_info {
  background-color: rgba(31, 178, 255, 0.15);
}
.ace-gradace .ace_marker-layer .ace_error-line {
  background: rgba(255, 46, 77, 0.10);
}
.ace-gradace .ace_tooltip {
  background: #0c0c10;
  color: #d4d7de;
  border: 1px solid #2a2d38;
}
.ace-gradace .ace_placeholder {
  font-style: italic;
  color: #5d6378;
  opacity: 0.7;
}
.ace-gradace .ace_line .ace_comment.ace_todo,
.ace-gradace .ace_comment.ace_doc.ace_todo {
  color: #ffc857;
  font-style: italic;
  font-weight: bold;
}
`
    };

    const LOG_PREFIX = '[codehs-ace]';
    const log = (...args) => console.log(LOG_PREFIX, ...args);
    const warn = (...args) => console.warn(LOG_PREFIX, ...args);
    const error = (...args) => console.error(LOG_PREFIX, ...args);

    log('Script loaded. URL:', location.href);

    // use unsafewindow
    const pageWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
    log('unsafeWindow available:', typeof unsafeWindow !== 'undefined');

    function waitForAce(callback, timeout = 15000) {
        log('Waiting for window.ace...');
        const start = Date.now();
        const interval = setInterval(() => {
            if (pageWindow.ace && pageWindow.ace.edit) {
                clearInterval(interval);
                log('Ace found after', Date.now() - start, 'ms');
                callback(pageWindow.ace);
            } else if (Date.now() - start > timeout) {
                clearInterval(interval);
                warn('Ace not found within', timeout, 'ms. pageWindow.ace =', pageWindow.ace);
                warn('You may be using Ace editor? Settings > Editor to change, or use CodeHS GradMonaco');
            }
        }, 200);
    }
    function ensureLanguageTools(ace) {
        const get = () => {
            try { return ace.require('ace/ext/language_tools'); } catch (e) { return null; }
        };

        return new Promise((resolve, reject) => {
            const existing = get();
            if (existing && existing.addCompleter) return resolve(existing);

            const ver = ace.version ? '@' + ace.version : '';
            const url = `https://cdn.jsdelivr.net/npm/ace-builds${ver}/src-min-noconflict/ext-language_tools.js`;
            log('language_tools missing. ace.version =', ace.version, '- fetching', url);

            GM_xmlhttpRequest({
                method: 'GET',
                url,
                onload(res) {
                    if (res.status < 200 || res.status >= 300) {
                        return reject(new Error('language_tools fetch failed: ' + res.status));
                    }
                    try {
                        GM_addElement('script', { textContent: res.responseText });
                    } catch (e) {
                        warn('GM_addElement failed, trying eval:', e.message);
                        try { pageWindow.eval(res.responseText); } catch (e2) { return reject(e2); }
                    }
                    const lt = get();
                    if (lt && lt.addCompleter) {
                        log('language_tools loaded.');
                        resolve(lt);
                    } else {
                        reject(new Error('language_tools injected but module still unavailable'));
                    }
                },
                onerror: () => reject(new Error('language_tools GM_xmlhttpRequest error')),
            });
        });
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
                            resolve(parsed);
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error(`${label} fetch failed with status ${response.status}`));
                    }
                },
                onerror: function (err) {
                    reject(new Error(`${label} GM_xmlhttpRequest error`));
                },
                ontimeout: function () {
                    reject(new Error(`${label} fetch timed out`));
                },
            });
        });
    }
    function getImportInsertion(session, fqcn) {
            const lines = session.getDocument().getAllLines();
            const importLine = `import ${fqcn};`;
            if (lines.some(l => l.trim() === importLine)) return null;

            let insertRow = 0;
            for (let i = 0; i < lines.length; i++) {
                const t = lines[i].trim();
                if (t.startsWith('package ') || t.startsWith('import ')) insertRow = i + 1;
            }
            return { row: insertRow, text: importLine + '\n' };
        }

        function registerImportCompleter(langTools, importMap) {
            const classNames = Object.keys(importMap);

            const completer = {
                id: 'gradace-imports',
                identifierRegexps: [/[a-zA-Z_0-9$]/],
                getCompletions(editor, session, pos, prefix, callback) {
                    if (!prefix) return callback(null, []);
                    const p = prefix.toLowerCase();
                    const matches = [];
                    for (const name of classNames) {
                        if (name.toLowerCase().startsWith(p)) {
                            matches.push({
                                caption: name,
                                value: name,
                                meta: importMap[name],
                                score: 1000,
                                completer: {
                                    insertMatch(editor, data) {
                                        // remove the typed prefix, then insert the class name
                                        const cur = editor.getCursorPosition();
                                        const range = {
                                            start: { row: cur.row, column: cur.column - prefix.length },
                                            end: cur
                                        };
                                        editor.session.remove(range);
                                        editor.insert(data.value);

                                        // add the import above if needed
                                        const fqcn = importMap[data.value];
                                        if (!fqcn || fqcn.includes('no import needed')) return;
                                        const ins = getImportInsertion(editor.session, fqcn);
                                        if (ins) editor.session.insert({ row: ins.row, column: 0 }, ins.text);
                                    }
                                }
                            });
                            if (matches.length >= 100) break;
                        }
                    }
                    callback(null, matches);
                }
            };

            langTools.addCompleter(completer);
            log('Import completer registered with', classNames.length, 'classes.');
            return true;
        }

    waitForAce((globalAce) => {
        log("ace detected!");
        const modulePath = `ace/theme/gradace`;
        globalAce.define(modulePath, ["require", "exports", "module", "ace/lib/dom"], function(require, exports, module) {
            exports.isDark = true;
            exports.cssClass = `ace-gradace`;
            exports.cssText = themes.onedark;
        });

        const themed = new WeakSet();
        function setupEditor(editor) {
            if (themed.has(editor)) return;
            themed.add(editor);
            editor.setTheme('ace/theme/gradace');
            editor.setOptions({
                enableBasicAutocompletion: true,
                enableLiveAutocompletion: true,
            });
            log('Editor set up:', editor);
        }

        function scanEditors() {
            document.querySelectorAll('.ace_editor').forEach(el => {
                if (el.env && el.env.editor) setupEditor(el.env.editor);
            });
        }

        Promise.all([
            ensureLanguageTools(globalAce),
            gmFetchJson(
                'https://raw.githubusercontent.com/GavinGoGaming/Devmarklet/refs/heads/main/codehs-monaco-plus/java-imports-full.json',
                'import map'
            ),
        ])
        .then(([langTools, map]) => {
            registerImportCompleter(langTools, map);
            scanEditors();
            setInterval(scanEditors, 1000);
        })
            .catch(err => warn('Autocomplete setup failed:', err.message));
    });
})();
