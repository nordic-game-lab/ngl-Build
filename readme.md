# Nordic Game Lab Build System


[![Build status](https://github.com/nordic-game-lab/ngl-build/workflows/Deploy%20code/badge.svg)](https://github.com/nordic-game-lab/ngl-build/actions/workflows/publish.yaml)  [![Test status](https://github.com/nordic-game-lab/ngl-build/workflows/test%20code/badge.svg)](https://github.com/nordic-game-lab/ngl-build/actions/workflows/test.yaml) [![Version](https://img.shields.io/github/v/release/nordic-game-lab/ngl-build?logo=GitHub)](https://github.com/nordic-game-lab/ngl-build/releases)

## Installation

```sh
npm install -g ngl-build
```

## Usage

* First generate a config file with
```sh
ngl-build init
```

* Then edit your config file

* and finally build your code with
```sh
ngl-build build [target]
```
The possible targets are ```web```, ```server```, or ```all```