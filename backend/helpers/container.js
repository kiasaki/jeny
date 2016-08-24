const R = require('ramda');
const debug = require('debug')('jeny:container');

// Creates an instance of a class, passing args to the constructor
// ES6 constructors need the `new` keyword to be used, so, no .apply
// magic can be done here until WebReflection lands in Node.js stable.
function applyToConstructor(constructor, args) {
  return R.apply(R.construct(constructor), args);
}

var nextIdCounter = 1;
function nextId() {
  return nextIdCounter++;
}

class Container {
  constructor() {
    this.id = nextId();
    this.contents = {};
    this.get.bind(this);
    this.set.bind(this);
  }

  get(name) {
    if (!(name in this.contents)) {
      throw Error('Container #' + this.id + ' has nothing registered for key ' + name);
    }
    return this.contents[name];
  }

  set(name, instance) {
    debug('[container #' + this.id + '] set ' + name);
    this.contents[name] = instance;
  }

  create(klass) {
    if (!('length' in klass.dependencies)) {
      throw new Error('Invariant: container can\'t resolve a class without a dependencies');
    }

    var dependencies = [];
    R.forEach(function(dependencyName) {
      dependencies.push(this.get(dependencyName));
    }.bind(this), klass.dependencies);

    return applyToConstructor(klass, dependencies)
  }

  load(klass) {
    if (typeof klass.dependencyName !== 'string') {
      throw new Error('Invariant: container can\'t resolve a class without a name');
    }

    var instance = this.create(klass);
    this.set(klass.dependencyName, instance);
  }

  unset(name) {
    delete this.contents[name]
  }

  reset() {
    this.contents = {};
  }
}

module.exports = Container;
