# REyaml-Core
![GitHub package.json version](https://img.shields.io/github/package-json/v/cedricpoon/reyaml-core)
![David](https://img.shields.io/david/cedricpoon/reyaml-core)
![Snyk Vulnerabilities for GitHub Repo](https://img.shields.io/snyk/vulnerabilities/github/cedricpoon/reyaml-core)

Core & CLI in REyaml for **YAML** to **D3 Hierarchy** transformation, **YAML** textual processing, **JSON Object** [`Promise.js`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) alike traversal with modification, and more.

>Inspired by and proudly using [**js-yaml**](https://github.com/nodeca/js-yaml).

```js
new Ryaml('foo: bar').toRjson().toD3()
```

## Philosophy
Two major Classes are exported for instantiation in this module, namely `Ryaml` and `Rjson`.

`Ryaml` is an **immutable** Object which wraps a **YAML** string as source reference.

`Rjson` is an **immutable** Object which wraps a **JSON** object as source reference.

The underlying source JSON object or YAML string will be transformed according to its member methods by the given behaviours. Transformational member methods are designed as **functional procedures** and will instantiate new immutable Object on every call.

In order to serve the aim of converting YAML to D3 hierarchy, `Ryaml` provides `.toRjson([profile = 'default'])` for bridging YAML and JSON Object powered by [js-yaml](https://github.com/nodeca/js-yaml), while `Rjson` provides `.toD3([profile = 'default'])` for ultimately mutating to legit D3 Hierarchical JSON Object.

## Built Environment
1. Node.js >= v12.x.x
2. npm >= 6.x.x

## Installation
### Node.js
```sh
npm install reyaml-core
```
#### Usage
```js
const { Ryaml, Rjson } = require('reyaml-core');
// or
import { Ryaml, Rjson } from 'reyaml-core';
```
### CLI Standalone Executable
```sh
npm install -g reyaml-core
```
#### Usage
```sh
usage: rc [-h] [-v] [-Y YAML] [-J JSON] [ACTION] ...

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -Y YAML, --yaml YAML  Source YAML as utf-8 file.
  -J JSON, --json JSON  Source JSON as utf-8 file.

Commands:
  [ACTION]              List of available Actions.
    insert              Insert YAML insertee under each key in Source.
    transform-d3        Transform Source into D3 Hierarchical JSON.
    transform-js        Transform Source into JSON using "js-yaml" module.
    count-key           Count number of keys in Source.
    mark-line           Mark lineNo in Source using markerMap in "config.js".
    count-junk-line     Count number of junk line in source YAML before 
                        lineNo.
    truncate            Truncate vertically by level and horizontally by size 
                        in YAML pivoted on lineNo.
    patch-yaml          Patch source YAML with the given patcher.
```
### Bundled Library for Browsers
```html
<script src="reyaml-core.js"></script>
```
> [**jsDelivr**](https://www.jsdelivr.com/) is suggested as CDN for this bundle.
#### Usage
```html
<!-- js-yaml is required as library dependency -->
<script src="https://cdn.jsdelivr.net/gh/nodeca/js-yaml/dist/js-yaml.min.js"></script>

<!-- jsDelivr CDN link to reyaml-core -->
<script src="https://cdn.jsdelivr.net/gh/cedricpoon/reyaml-core/dist/reyaml-core.min.js"></script>

<script type="text/javascript">
  document.write(JSON.stringify(
    new rc.Ryaml('foo: bar').toRjson().toD3()
  ));
</script>
```

## Testing
```sh
npm run test
```
### In REPL
```sh
# Linux/MacOS
npm run debug
# Windows
npm run debug-windows
```

## API
All the user-facing Classes and methods are commented with in-code **JSDoc**. Please refer to [GitHub Wiki page](https://github.com/cedricpoon/reyaml-core/wiki) of REyaml-Core for further documentations.

## License
[MIT](./LICENSE).
