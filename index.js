'use strict'

const defaults = require('lodash.defaults')
const request  = require('request')

module.exports = class StatszeeDataCollector {
  constructor(options) {
    this.points  = []
    this.timeout = null
    this.options = defaults(options, {
      baseUrl: '',
      key: null,
      writeConcern: 'none',
      interval: 5000,
      timeout: 5000,
      retry: 15000,
      splicePart: 250,
      backPressureQuota: 1000,
      defaultPrecision: '1h',
      start: true,
      canSend: true,
      token: ''
    })

    if (!this.options.key) throw new Error('Statszee require a key')
    if (!this.options.baseUrl) throw new Error('Statszee require a baseUrl')

    if (this.options.start) this.rischedule()

    this.request = request.defaults({
      pool: {
        maxSockets: 10
      },
      baseUrl: this.options.baseUrl,
      method: 'POST',
      timeout: this.options.timeout,
      headers: {
        'Content-Type': 'text/plain',
        'X-Stats-Server-Key': this.options.key,
        'Authorization': 'JWT ' + this.options.token
      }
    })

    const me = this
    process.on('exit', () => {
      me.stop()
      me.options.canSend = false
      me.sendPoints(true)
    })
  }

  start(interval) {
    const self = this

    interval = interval || self.options.interval
    if (isNaN(interval)) throw new Error('interval must be numeric')

    if (self.options.canSend) {
      self.stop()
      self.timeout = setTimeout(function() {
        self.sendPoints()
      }, interval)
      return true
    }
    else {
      return false
    }
  }

  stop() {
    const self = this
    clearTimeout(self.timeout)
  }

  rischedule(interval) {
    const self = this
    self.start((self.hasBackPressure()) ? 0 : interval)
  }

    /**
     * addPoint
     * Add a point to your Statszee instance
     * @param namespace Metric namespace,used for grouping events with same scope
     * @param value (default:1) A numeric value of the event,
     * @param precision Data precision, if not provided the library default precision
     * @param timestamp (default now()) Timestamp
     */
  addPoint(namespace, value, precision, timestamp) {
    const self = this

    if (!namespace) throw new Error('namespace is required')
    value = value || 1
    if (isNaN(value)) throw new Error('only numeric value accepted')
    precision = precision || self.options.defaultPrecision
    timestamp = timestamp || Math.floor(new Date() / 1000)    //TODO: Open a discussion about sending time in ms

    if (Array.isArray(precision)) {
      precision.forEach(singleTimeUnit => {
        self.points.push(self.toLinePoint(namespace, value, timestamp, singleTimeUnit))
      })
    }
    else {
      self.points.push(self.toLinePoint(namespace, value, timestamp, precision))
    }
  }

  sendPoints(allPoints) {
    const self         = this
    let pointsFragment = null

    if (allPoints) {
      pointsFragment = self.points
    }
    else {
      pointsFragment = self.splicePoints()
    }

    if (pointsFragment.length > 0) {
      self.createConnection(pointsFragment.join('\n'))
                .then(() => {
                    /**
                     * Back Pression handling
                     * If there's a lot of points into the pointsQueue skip interval and just send until there's less than backPressure quota
                     // TODO: Improve points saturation handling (not quite sure about this)
                     */
                  self.rischedule()
                  return null
                })
                .catch((error) => {
                  if (self.options.writeConcern == 'retry') {
                    self.points = self.points.concat(pointsFragment)
                  }
                  self.rischedule(self.options.retry)
                })
    }
    else {
      self.rischedule()
    }
  }

  createConnection(data) {
    const self = this
    return new Promise((fullfill, reject) => {
      self.request.post('/api/write', {
        body: data
      })
                .on('response', (response) => {
                  fullfill(response)
                })
                .on('error', (error) => {
                  reject(error)
                })
    })
  }

  splicePoints() {
    const self = this
    return self.points.splice(0, self.options.splicePart)
  }

  hasBackPressure() {
    const self = this
    return (self.points.length >= self.options.backPressureQuota)
  }

  toLinePoint(name, value, timestamp, precision) {
    return `${name} ${value} ${timestamp}|${precision}`
  }
}
