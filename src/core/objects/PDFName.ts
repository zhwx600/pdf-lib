import { CharCodes } from 'src/core/enums';
import { PrivateConstructorError } from 'src/core/errors';
import PDFObject from 'src/core/objects/PDFObject';
import { charFromHexCode, toCharCode, toHexString } from 'src/utils';

const decodeName = (name: string) =>
  name.replace(/#(\d{2})/g, (_, hex) => charFromHexCode(hex));

const isRegularChar = (charCode: number) =>
  charCode !== CharCodes.Hash &&
  charCode >= CharCodes.ExclamationPoint &&
  charCode <= CharCodes.Tilde;

const ENFORCER = {};
const pool = new Map<string, PDFName>();

class PDFName extends PDFObject {
  static of = (name: string): PDFName => {
    const decodedValue = decodeName(name);

    let instance = pool.get(decodedValue);
    if (!instance) {
      instance = new PDFName(ENFORCER, decodedValue);
      pool.set(decodedValue, instance);
    }

    return instance;
  };

  private readonly encodedName: string;

  private constructor(enforcer: any, name: string) {
    if (enforcer !== ENFORCER) throw new PrivateConstructorError('PDFName');
    super();

    let encodedName = '/';
    for (let idx = 0, len = name.length; idx < len; idx++) {
      const character = name[idx];
      const code = toCharCode(character);
      encodedName += isRegularChar(code) ? character : `#${toHexString(code)}`;
    }

    this.encodedName = encodedName;
  }

  clone(): PDFName {
    return this;
  }

  toString(): string {
    return this.encodedName;
  }

  sizeInBytes(): number {
    return this.encodedName.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): void {
    for (let idx = 0, len = this.encodedName.length; idx < len; idx++) {
      buffer[offset++] = toCharCode(this.encodedName[idx]);
    }
  }
}

export default PDFName;