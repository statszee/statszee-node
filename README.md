# StatsZee Data Collector for Node
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![Build status][ci-image]][ci-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![Code Climate][codeclimate-image]][codeclimate-url]

## Data Collector for [statszee](https://github.com/LobeTia/statszee/), a self-hosted stats server based Node.JS and Sequelize made with [trails.js](http://trailjs.io) framework

## WARNING: Not suitable for production
### Work in progress, things are going to change

### Installation

Run inside a node project

    npm install --save statszee-node

Instance the tracker

    const statszeeCollector = require("statszee-node")
    const statszeeCollectorInstance = new statszeeCollector({
      key: ""     // your statszee server key
      baseUrl: "" // your statszee server basepath
    })

Track data in your code
  
    statszeeCollectorInstance.addPoint("event.name")                  // defaults value=1, precision=1h
    statszeeCollectorInstance.addPoint("event.name","7")              // defaults precision=1h
    statszeeCollectorInstance.addPoint("event.name","9","1d")         // no defaults
    statszeeCollectorInstance.addPoint("event.name","9",["1d","1h"])  // multiple precision  

## License
[MIT](https://github.com/lobetia/statszee/blob/master/LICENSE)

[snyk-image]: https://snyk.io/test/github/lobetia/statszee-node/badge.svg
[snyk-url]: https://snyk.io/test/github/lobetia/statszee-node/
[ci-image]: https://travis-ci.org/LobeTia/statszee-node.svg?branch=master
[ci-url]: https://travis-ci.org/LobeTia/statszee-node
[daviddm-image]: http://img.shields.io/david/lobetia/statszee-node.svg?style=flat-square
[daviddm-url]: https://david-dm.org/lobetia/statszee-node
[codeclimate-image]: https://img.shields.io/codeclimate/github/LobeTia/statszee-node.svg?style=flat-square
[codeclimate-url]: https://codeclimate.com/github/LobeTia/statszee-node
