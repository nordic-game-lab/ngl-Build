# Nordic Game Lab Build System

![Build status](https://code.internal.aball.dev/aball-dev/ngl-Build/badges/workflows/publish.yml/badge.svg)

## Installation

add this line to your ```.npmrc``` file
```
@aball:registry=https://code.internal.aball.dev/api/packages/aball-dev/npm/
```

Then run
```sh
npm install -g @aball/ngl-build
```

## Usage

* First generate a config file with
```sh
ngl-build init
```

* Then edit your config file

* and finaly build you code with
```sh
ngl-build build [target]
```
The posible targets are ```web```, ```server```, or ```all```