/**
 * scrape-java-imports.js
 *
 * Builds a full class-name -> package import map for Java 8 by parsing
 * Oracle's javadoc "all classes" index pages. Covers BOTH:
 *   - Java SE 8 core API   (java.*, javax.*, org.omg.*, org.w3c.dom.*, etc.)
 *   - JavaFX 8             (javafx.*) — lives on a separate page, not
 *                            included in the core SE8 index at all.
 *
 * Usage:
 *   node scrape-java-imports.js
 *
 * Output:
 *   java-imports-full.json  — { "ClassName": "fully.qualified.package" }
 *
 * Notes:
 *   - Oracle's javadoc anchor hrefs are of the form:
 *       <a href="java/util/ArrayList.html" title="class in java.util">ArrayList</a>
 *     We pull the class name from the link text and the package from the
 *     href path (dropping the trailing ClassName.html segment). This is
 *     more reliable than parsing the "title" attribute since inner/nested
 *     classes (Foo.Bar) show up as separate entries with their own hrefs.
 *   - When the same simple class name exists in multiple packages
 *     (e.g. "List" in java.util and java.awt.List, or "Attribute" in
 *     half a dozen packages), the LAST one wins by default here, EXCEPT
 *     the scraper tags the JDK's `java.lang`/`java.util`/`java.io` variants
 *     as duplicates when possible — see COMMON_PACKAGE_PRIORITY.
 *     Review the resulting JSON's "duplicates.json" output and
 *     hand-correct package choice for anything mismatched for your use case.
 *   - No dependencies beyond Node's built-in fetch (Node 18+) and fs.
 */

const fs = require('fs');
const path = require('path');

const SOURCES = [
  {
    name: 'Java SE 8 core',
    url: 'https://docs.oracle.com/javase/8/docs/api/allclasses-noframe.html',
  },
  {
    name: 'JavaFX 8',
    url: 'https://docs.oracle.com/javase/8/javafx/api/allclasses-noframe.html',
  },
];

// When a simple class name collides across packages, prefer whichever
// of these appears first (most common/likely to be what a student means).
const COMMON_PACKAGE_PRIORITY = [
  'java.lang',
  'java.util',
  'java.util.function',
  'java.util.stream',
  'java.io',
  'java.nio.file',
  'java.time',
  'java.math',
  'java.text',
  'java.net',
  'java.awt',
  'java.awt.event',
  'javax.swing',
  'javafx.scene.control',
  'javafx.scene.layout',
  'javafx.scene',
  'javafx.application',
  'javafx.stage',
];

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (import-map-scraper)' },
  });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.text();
}

/**
 * Parses an "allclasses-noframe.html" page.
 * Matches anchors like:
 *   <a href="java/util/ArrayList.html" title="class in java.util">ArrayList</a>
 *   <a href="java/util/Map.Entry.html" title="interface in java.util">Map.Entry</a>
 * Returns array of { className, pkg, fqcn }
 */
function parseAllClassesHtml(html) {
  const results = [];
  // Matches href="<path ending in .html>" ... >LinkText</a>
  const anchorRegex = /<a\s+href="([^"]+\.html)"[^>]*>([^<]+)<\/a>/g;
  let match;
  while ((match = anchorRegex.exec(html)) !== null) {
    const href = match[1];
    const linkText = match[2].trim();

    // href like "java/util/ArrayList.html" or "javax/swing/AbstractAction.html"
    // or with nested class "java/util/AbstractMap.SimpleEntry.html"
    const withoutExt = href.replace(/\.html$/, '');
    const segments = withoutExt.split('/');
    const lastSegment = segments[segments.length - 1]; // e.g. "AbstractMap.SimpleEntry"
    const pkgSegments = segments.slice(0, -1); // package path segments
    const pkg = pkgSegments.join('.');

    // Use the outermost class name (before any nested-class dot) as the
    // importable class name — you import the outer class, not Foo.Bar directly.
    const outerClassName = lastSegment.split('.')[0];

    if (!pkg || !outerClassName) continue;

    results.push({
      className: outerClassName,
      pkg,
      fqcn: `${pkg}.${outerClassName}`,
    });
  }
  return results;
}

function buildImportMap(allEntries) {
  const byClassName = new Map(); // className -> array of { pkg, fqcn }

  for (const entry of allEntries) {
    if (!byClassName.has(entry.className)) {
      byClassName.set(entry.className, []);
    }
    const arr = byClassName.get(entry.className);
    if (!arr.some((e) => e.pkg === entry.pkg)) {
      arr.push(entry);
    }
  }

  const importMap = {};
  const duplicates = {};

  for (const [className, entries] of byClassName.entries()) {
    if (entries.length === 1) {
      importMap[className] = entries[0].fqcn;
      continue;
    }

    // Multiple packages define a class with this name — pick by priority list.
    duplicates[className] = entries.map((e) => e.fqcn);

    let chosen = null;
    for (const preferredPkg of COMMON_PACKAGE_PRIORITY) {
      const found = entries.find((e) => e.pkg === preferredPkg);
      if (found) {
        chosen = found;
        break;
      }
    }
    // Fall back to shortest package path (usually the most "core" one)
    if (!chosen) {
      chosen = entries.reduce((a, b) =>
        a.pkg.split('.').length <= b.pkg.split('.').length ? a : b
      );
    }
    importMap[className] = chosen.fqcn;
  }

  return { importMap, duplicates };
}

async function main() {
  let allEntries = [];

  for (const source of SOURCES) {
    console.log(`Fetching ${source.name}: ${source.url}`);
    const html = await fetchHtml(source.url);
    const entries = parseAllClassesHtml(html);
    console.log(`  -> parsed ${entries.length} entries`);
    allEntries = allEntries.concat(entries);
  }

  const { importMap, duplicates } = buildImportMap(allEntries);

  const outDir = __dirname;
  const mapPath = path.join(outDir, 'java-imports-full.json');
  const dupPath = path.join(outDir, 'java-imports-duplicates.json');

  fs.writeFileSync(mapPath, JSON.stringify(importMap, null, 2));
  fs.writeFileSync(dupPath, JSON.stringify(duplicates, null, 2));

  console.log(`\nWrote ${Object.keys(importMap).length} classes to ${mapPath}`);
  console.log(
    `Wrote ${Object.keys(duplicates).length} ambiguous class names (multi-package) to ${dupPath}`
  );
  console.log('Review java-imports-duplicates.json for anything the priority list guessed wrong.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
