
# Barnet

`Barnet` is a data store engine for web browser. It supports unlimited data store for string, object, and binary(blob) data regardless of the per-item size limit.

## Installation

```
~$ yarn add barnet
```
or
```
~$ npm install barnet
```

## Usage

```ts
const barnet = new Barnet({
  // data storage name
  name: 'samplestorage',

  // data storage type (optional, default=Memory)
  storage: BNStorageType.Memory,

  // encryption algorithm (optional, default is no encryption)
  encryptionPolicy: {
    encrypt: (data: object) => {
      // SHOULD RETURN ENCRYPTED STRING
    },
    decrypt: (encrypted: string) => {
      // SHOULD RETURN DECRYPTED OBJECT
    },
  }
})

// save data. data type could be string | object | blob
await barnet.save(key, data)

// load data.
const data = await barnet.load(key)

// remove data.
await barnet.remove(key)
```
## License

### GNU GENERAL PUBLIC LICENSE  
#### Version 3, 29 June 2007

Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/> Everyone is permitted to copy and distribute verbatim copies of this license document, but changing it is not allowed.