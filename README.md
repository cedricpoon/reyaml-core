# REyaml-Core
Core & CLI in REyaml for **YAML** to **D3 Hierarchy** transformation and more.

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
```
Usage: rc [-h|--help] [-v|--version] [[-f|--file file] action [..args]]

Positional arguments:
  file                      Source YAML file to be processed
  action                    Name of action to be performed
  args                      Action arguments depending on chosen action

Optional arguments:
  -h, --help                Show this user manual and exit
  -v, --version             Display version number and exit
  -f, --file                Source YAML as file

Actions:
  insert [..args]           Insert YAML [file] under each [key] in source YAML
  transform-d3              Transform source YAML into D3 Hierarchical JSON
  transform-js              Transform source YAML into JSON using 'js-yaml' module
  count-key                 Count number of keys in source YAML
  mark-line [..args]        Mark [lineNo] in source YAML using markerMap in 'config.js'
  count-junk-line [..args]  Count number of junk line in source YAML before [lineNo]
  truncate [..args]         Truncate vertically by [level] and horizontally by [size] in YAML pivoted on [lineNo]
  patch-yaml [..args]       Not yet implemented
```

```
Usage: rc insert [-h|--help] key insertee

Positional arguments:
  key                 Key in source YAML for inserting insertee YAML
  insertee            Insertee YAML file

Optional arguments:
  -h, --help          Show this user manual and exit
```

```
Usage: rc mark-line [-h|--help] lineNo

Positional arguments:
  lineNo              Line number for marking

Optional arguments:
  -h, --help          Show this user manual and exit
```

```
Usage: rc count-junk-line [-h|--help] lineNo

Positional arguments:
  lineNo              Line number for counting junk line before

Optional arguments:
  -h, --help          Show this user manual and exit
```

```
Usage: rc truncate [-h|--help] lineNo level siblingSize

Positional arguments:
  lineNo              Line number to pivot the truncation
  level               Truncate for N level upward-downwards
  siblingSize         Truncate for N siblings

Optional arguments:
  -h, --help          Show this user manual and exit
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

## Philosophy
Two major Classes are exported for instantiation in this module, namely `Ryaml` and `Rjson`.

`Ryaml` is an **immutable** Object which wraps a **YAML** string as source reference.

`Rjson` is an **immutable** Object which wraps a **JSON** object as source reference.

The underlying source JSON object or YAML string will be transformed according to its member methods by the given behaviours. Transformational member methods are designed as **functional procedures** and will instantiate new immutable Object on every call.

In order to serve the aim of converting YAML to D3 hierarchy, `Ryaml` provides `.toRjson([profile = 'default'])` for bridging YAML and JSON Object powered by [js-yaml](https://github.com/nodeca/js-yaml), while `Rjson` provides `.toD3([profile = 'default'])` for ultimately mutating to legit D3 Hierarchical JSON Object.

## API
All the user-facing Classes and methods are commented with in-code **JSDoc**. Please refer to [GitHub Wiki page]() of REyaml-Core for further documentations.

## License
[MIT](./LICENSE)
