// source: https://gist.github.com/danielres/3c714d6388c5642d39c9725d0b8dd581#file-array-ts
export function onlyUnique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index
}
