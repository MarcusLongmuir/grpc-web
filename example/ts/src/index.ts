import {grpc, BrowserHeaders} from "grpc-web-client";

import {
  LibraryService,
} from "./services";
import {BookQuery, Book} from "../_proto/examplecom/library/library_pb";

declare const USE_TLS: boolean;
const host = USE_TLS ? "https://localhost:9091" : "http://localhost:9090";

const bookQuery = new BookQuery();
bookQuery.setTitle("Two");

grpc.invoke(LibraryService.GetBook, {
  request: bookQuery,
  host: host,
  onHeaders: function(headers: BrowserHeaders) {
    console.log("onHeaders", headers);
  },
  onMessage: function(message: Book) {
    console.log("onMessage", message.toObject());
  },
  onError: function(err: Error) {
    console.error(err);
  },
  onComplete: function(code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
    console.log("onComplete", code, msg, trailers);

    const bookQuery = new BookQuery();
    bookQuery.setTitle("Two");
    grpc.invoke(LibraryService.ListBooks, {
      request: bookQuery,
      host: host,
      onHeaders: function(headers: BrowserHeaders) {
        console.log("onHeaders", headers);
      },
      onMessage: function(message: Book) {
        console.log("onMessage", message.toObject());
      },
      onError: function(err: Error) {
        console.error(err);
      },
      onComplete: function(code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
        console.log("onComplete", code, msg, trailers);
      }
    });
  }
});
