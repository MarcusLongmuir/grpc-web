import { BookQuery, Book } from "../_proto/examplecom/library/library_pb";

export class LibraryService {
  static serviceName: string = "examplecom.library.LibraryService";
}
export namespace LibraryService {
  export class GetBook {
    static methodName = "GetBook";
    static service = LibraryService;
    static requestStream: false;
    static responseStream: false;
    static requestType = BookQuery;
    static responseType = Book;
  }
  export class ListBooks {
    static methodName = "ListBooks";
    static service = LibraryService;
    static requestStream: false;
    static responseStream: true;
    static requestType = BookQuery;
    static responseType = Book;
  }
}
