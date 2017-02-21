'use strict'

const chai   = require('chai')
const should = chai.should()
const expect = chai.expect

const StatszeeNode = require('../.././')

describe('index.js', () => {
  const testedInstance = new StatszeeNode({key: 'abc', baseUrl: 'abc', start: false})

  after(() => {
    testedInstance.stop()
  })

  describe('class building', () => {
    it('should thrown error if no key provided', () => {
      expect(() => new StatszeeNode({})).to.throw('Statszee require a key')
    })
    it('should thrown error if no baseUrl provided', () => {
      expect(() => new StatszeeNode({key: 'abc'})).to.throw('Statszee require a baseUrl')
    })
    it('should not thrown error if both key and baseUrl provided', () => {
      expect(() => new StatszeeNode({key: 'abc', baseUrl: 'abc', start: false})).to.not.throw(Error)
    })
  })

  describe('class methods', () => {
    it('should respond to start()', () => {
      expect(testedInstance).to.respondsTo('start')
    })
    it('should respond to end()', () => {
      expect(testedInstance).to.respondsTo('stop')
    })
    it('should respond to addPoint()', () => {
      expect(testedInstance).to.respondsTo('addPoint')
    })
  })

  describe('start method', () => {
    it('should accept no parameters', () => {
      expect(testedInstance.start()).to.be.equal(true)
    })
    it('should throw is a NaN parameter is provided', () => {
      expect(() => testedInstance.start('now')).to.throw(Error)
    })
    it('should accept a numeric parameter', () => {
      expect(() => testedInstance.start(1000)).to.not.throw(Error)
    })
  })

  describe('addPoint method', () => {
    it('should throw error if no parameters provided', () => {
      expect(() => testedInstance.addPoint()).to.throw(Error)
    })
    it('should accept only namespace parameter', () => {
      testedInstance.addPoint('namespace')
      testedInstance.points.length.should.be.equal(1)
    })
    it('should accept namespace and value parameter', () => {
      testedInstance.addPoint('namespace', 1)
      testedInstance.points.length.should.be.equal(2)
    })
    it('should throw error if a NaN value is provided', () => {
      expect(() => testedInstance.addPoint('namespace', 'big')).to.throw(Error)
    })
    it('should accept namespace, value and precision parameters', () => {
      testedInstance.addPoint('namespace', 1, '1d')
      testedInstance.points.length.should.be.equal(3)
    })
    it('should accept namespace, value and precision array parameters', () => {
      testedInstance.addPoint('namespace', 1, ['1d', '1h'])
      testedInstance.points.length.should.be.equal(5)
    })
    it('should accept namespace, value, precision and timestamp parameters', () => {
      testedInstance.addPoint('namespace', 1, '1d', new Date().valueOf())
      testedInstance.points.length.should.be.equal(6)
    })
  })

})
