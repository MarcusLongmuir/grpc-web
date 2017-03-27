// package: examplecom.library
// file: examplecom/library/library.proto

import * as jspb from "google-protobuf";

export class Book extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  getContents(): string;
  setContents(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Book.AsObject;
  static toObject(includeInstance: boolean, msg: Book): Book.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Book, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Book;
  static deserializeBinaryFromReader(message: Book, reader: jspb.BinaryReader): Book;
}

export namespace Book {
  export type AsObject = {
    title: string,
    contents: string,
  }
}

export class BookQuery extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BookQuery.AsObject;
  static toObject(includeInstance: boolean, msg: BookQuery): BookQuery.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: BookQuery, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BookQuery;
  static deserializeBinaryFromReader(message: BookQuery, reader: jspb.BinaryReader): BookQuery;
}

export namespace BookQuery {
  export type AsObject = {
    title: string,
  }
}

