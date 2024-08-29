export const jsonClone = <Type>(o: Type): typeof o => (o == null ? o : JSON.parse(JSON.stringify(o)))
