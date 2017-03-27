package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"google.golang.org/grpc"
	"google.golang.org/grpc/grpclog"
	"google.golang.org/grpc/metadata"

	libraryproto "../_proto/examplecom/library"
	"github.com/improbable-eng/grpc-web/go/grpcweb"
	"golang.org/x/net/context"
)

var (
	enableTls  = flag.Bool("enable_tls", false,  "Use TLS - required for HTTP2.")
	tlsCertFilePath = flag.String("tls_cert_file", "../misc/localhost.crt", "Path to the CRT/PEM file.")
	tlsKeyFilePath  = flag.String("tls_key_file", "../misc/localhost.key", "Path to the private key file.")
)

func main() {
	flag.Parse()

	port := 9090
	if *enableTls {
		port = 9091
	}

	grpcServer := grpc.NewServer()
	libraryproto.RegisterLibraryServiceServer(grpcServer, &libraryService{})
	grpclog.SetLogger(log.New(os.Stdout, "exampleserver: ", log.LstdFlags))

	wrappedServer := grpcweb.WrapServer(grpcServer)
	handler := func(resp http.ResponseWriter, req *http.Request) {
		wrappedServer.ServeHttp(resp, req)
	}

	httpServer := http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: http.HandlerFunc(handler),
	}

	grpclog.Printf("Starting server. http port: %d, with TLS: %v", port, *enableTls)

	if *enableTls {
		if err := httpServer.ListenAndServeTLS(*tlsCertFilePath, *tlsKeyFilePath); err != nil {
			grpclog.Fatalf("failed starting http2 server: %v", err)
		}
	} else {
		if err := httpServer.ListenAndServe(); err != nil {
			grpclog.Fatalf("failed starting http server: %v", err)
		}
	}
}

type libraryService struct {
}

var books = []*libraryproto.Book{
	&libraryproto.Book{
		Title: "One",
		Contents: "first",
	},
	&libraryproto.Book{
		Title: "Two",
		Contents: "second",
	},
	&libraryproto.Book{
		Title: "Three",
		Contents: "third",
	},
	&libraryproto.Book{
		Title: "Four",
		Contents: "fourth",
	},
}

func (s *libraryService) GetBook(ctx context.Context, bookQuery *libraryproto.BookQuery) (*libraryproto.Book, error) {
	grpc.SendHeader(ctx, metadata.Pairs("HeaderTestKey1", "Value1", "HeaderTestKey2", "Value2"))
	grpc.SetTrailer(ctx, metadata.Pairs("TrailerTestKey1", "Value1", "TrailerTestKey2", "Value2"))
	return &libraryproto.Book{Title: "Some Book Title", Contents: "Some Words"}, nil
}

func (s *libraryService) ListBooks(bookQuery *libraryproto.BookQuery, stream libraryproto.LibraryService_ListBooksServer) error {
	stream.SendHeader(metadata.Pairs("HeaderTestKey1", "Value1", "HeaderTestKey2", "Value2"))
	stream.SetTrailer(metadata.Pairs("TrailerTestKey1", "Value1", "TrailerTestKey2", "Value2"))
	for _, book := range books {
		stream.Send(book)
	}
	return nil
}
