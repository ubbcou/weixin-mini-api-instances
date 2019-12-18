// 获取类型
// type list: 'Number', 'String', 'Boolean', 'Null', 'Undefined', 'Symbol', 'Array', 'Object', 'Function
export function getType(obj) {
  return Object.prototype.toString.call(obj).match(/\[object ([a-zA-Z]*)\]/)[1];
}

export const types = {
  Undefined: 'Undefined',
  Null: 'Null',
  Number: 'Number',
  String: 'String',
  Boolean: 'Boolean',
  Symbol: 'Symbol',
  Array: 'Array',
  Object: 'Object',
  Function: 'Function'
}
