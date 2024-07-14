export function decode(data: Uint8Array) {
  const dict = new Uint8Array()
  let currChar = data[0]
  let oldPhrase = currChar
  const out = [currChar]
  let code = 256
  let phrase
  for (let i = 1; i < data.length; i++) {
    const currCode = data[i]
    if (currCode < 256) {
      phrase = data[i]
    } else {
      phrase = dict[currCode] ? dict[currCode] : oldPhrase + currChar
    }
    out.push(phrase)
    currChar = phrase
    dict[code] = oldPhrase + currChar
    code++
    oldPhrase = phrase
  }
  return new Uint8Array(out)
}
