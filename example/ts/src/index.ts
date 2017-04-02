import {grpc, BrowserHeaders} from "grpc-web-client";
import {QueryBooksRequest, Book, GetBookRequest} from "../_proto/examplecom/library/book_service_pb";
import {BookService} from "../_proto/examplecom/library/book_service_pb_service";

declare const USE_TLS: boolean;
const host = USE_TLS ? "https://localhost:9091" : "http://localhost:9090";

function getBook() {
  const getBookRequest = new GetBookRequest();
  getBookRequest.setIsbn(60929871);
  grpc.invoke(BookService.GetBook, {
    request: getBookRequest,
    host: host,
    onHeaders: function (headers: BrowserHeaders) {
      console.log("getBook.onHeaders", headers);
    },
    onMessage: function (message: Book) {
      console.log("getBook.onMessage", message.toObject());
    },
    onError: function (err: Error) {
      console.error("getBook.onError", err);
    },
    onComplete: function (code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
      console.log("getBook.onComplete", code, msg, trailers);

      queryBooks();
    }
  });
}

getBook();

function queryBooks() {
  const queryBooksRequest = new QueryBooksRequest();
  queryBooksRequest.setAuthorPrefix("Geor");
  grpc.invoke(BookService.QueryBooks, {
    request: queryBooksRequest,
    host: host,
    onHeaders: function(headers: BrowserHeaders) {
      console.log("queryBooks.onHeaders", headers);
    },
    onMessage: function(message: Book) {
      console.log("queryBooks.onMessage", message.toObject());
    },
    onError: function(err: Error) {
      console.error("queryBooks.onError", err);
    },
    onComplete: function(code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
      console.log("queryBooks.onComplete", code, msg, trailers);
    }
  });
}
