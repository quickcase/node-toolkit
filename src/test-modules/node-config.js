// A stub for https://github.com/lorenwest/node-config
export const stubConfig = (config) => {
  const getImpl = (object) => (property) => {
    if(property === null || property === undefined){
      throw new Error("Calling config.get with null or undefined argument");
    }
    
    const elems = Array.isArray(property) ? property : property.split('.'),
          name = elems[0],
          value = object[name];
    if (elems.length <= 1) {
      return value;
    }
    // Note that typeof null === 'object'
    if (value === null || typeof value !== 'object') {
      return undefined;
    }
    return getImpl(value)(elems.slice(1));
  };

  const get = getImpl(config);

  const has = (property) => {
    if(property === null || property === undefined){
      return false;
    }
    return (getImpl(config)(property) !== undefined);
  };

  return {...config, get, has};
};
