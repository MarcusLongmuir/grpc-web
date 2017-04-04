// Polyfills
if (typeof Uint8Array === "undefined") {
  (window as any).Uint8Array = require("typedarray").Uint8Array;
}
if (typeof ArrayBuffer === "undefined") {
  (window as any).ArrayBuffer = require("typedarray").ArrayBuffer;
}
if (typeof DataView === "undefined") {
  (window as any).DataView = require("typedarray").DataView;
}

import {
  grpc,
  BrowserHeaders,
} from "../../../ts/src/index";
import {
  Empty,
} from "google-protobuf/google/protobuf/empty_pb";
import {
  PingRequest,
  PingResponse,
} from "../_proto/improbable/grpcweb/test/test_pb";
import {
  TestService,
  FailService,
} from "./services";
import {assert} from "chai";

const DEBUG = false;

function testWithLocalPort(port: number) {
  it("should make a unary request", (done) => {
    let didGetOnHeaders = false;
    let didGetOnMessage = false;

    const ping = new PingRequest();
    ping.setValue("hello world");

    grpc.invoke(TestService.Ping, {
      debug: DEBUG,
      request: ping,
      host: `https://localhost:${port}`,
      onHeaders: function(headers: BrowserHeaders) {
        didGetOnHeaders = true;
        assert.deepEqual(headers.get("HeaderTestKey1"), ["Value1"]);
        assert.deepEqual(headers.get("HeaderTestKey2"), ["Value2"]);
      },
      onMessage: function(message: PingResponse) {
        didGetOnMessage = true;
        assert.ok(message instanceof PingResponse);
        assert.deepEqual(message.getValue(), "hello world");
        assert.deepEqual(message.getCounter(), 252);
      },
      onComplete: function(code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
        assert.strictEqual(code, grpc.Code.OK, "expected OK (0)");
        assert.strictEqual(msg, undefined, "expected no message");
        assert.deepEqual(trailers.get("TrailerTestKey1"), ["Value1"]);
        assert.deepEqual(trailers.get("TrailerTestKey2"), ["Value2"]);
        assert.ok(didGetOnHeaders);
        assert.ok(didGetOnMessage);
        done();
      }
    });
  });

  it("should handle a streaming response of multiple messages", (done) => {
    let didGetOnHeaders = false;
    let onMessageId = 0;

    const ping = new PingRequest();
    ping.setValue("hello world");
    ping.setResponseCount(3000);

    grpc.invoke(TestService.PingList, {
      debug: DEBUG,
      request: ping,
      host: `https://localhost:${port}`,
      onHeaders: function(headers: BrowserHeaders) {
        didGetOnHeaders = true;
        assert.deepEqual(headers.get("HeaderTestKey1"), ["Value1"]);
        assert.deepEqual(headers.get("HeaderTestKey2"), ["Value2"]);
      },
      onMessage: function(message: PingResponse) {
        assert.ok(message instanceof PingResponse);
        assert.strictEqual(message.getCounter(), onMessageId++);
      },
      onComplete: function(code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
        assert.strictEqual(code, grpc.Code.OK, "expected OK (0)");
        assert.strictEqual(msg, undefined, "expected no message");
        assert.deepEqual(trailers.get("TrailerTestKey1"), ["Value1"]);
        assert.deepEqual(trailers.get("TrailerTestKey2"), ["Value2"]);
        assert.ok(didGetOnHeaders);
        assert.strictEqual(onMessageId, 3000);
        done();
      }
    });
  });

  it("should handle a streaming response of no messages", (done) => {
    let didGetOnHeaders = false;
    let onMessageId = 0;

    const ping = new PingRequest();
    ping.setValue("hello world");
    ping.setResponseCount(0);

    grpc.invoke(TestService.PingList, {
      debug: DEBUG,
      request: ping,
      host: `https://localhost:${port}`,
      onHeaders: function(headers: BrowserHeaders) {
        didGetOnHeaders = true;
        assert.deepEqual(headers.get("HeaderTestKey1"), ["Value1"]);
        assert.deepEqual(headers.get("HeaderTestKey2"), ["Value2"]);
      },
      onMessage: function(message: PingResponse) {
        assert.ok(message instanceof PingResponse);
        assert.strictEqual(message.getCounter(), onMessageId++);
      },
      onComplete: function(code: grpc.Code, msg: string | undefined, trailers: BrowserHeaders) {
        assert.strictEqual(code, grpc.Code.OK, "expected OK (0)");
        assert.strictEqual(msg, undefined, "expected no message");
        assert.deepEqual(trailers.get("TrailerTestKey1"), ["Value1"]);
        assert.deepEqual(trailers.get("TrailerTestKey2"), ["Value2"]);
        assert.ok(didGetOnHeaders);
        assert.strictEqual(onMessageId, 0);
        done();
      }
    });
  });

  it("should report status code for error with headers + trailers", (done) => {
    let didGetOnHeaders = false;
    let didGetOnMessage = false;

    const ping = new PingRequest();
    ping.setFailureType(PingRequest.FailureType.CODE);
    ping.setErrorCodeReturned(12);

    grpc.invoke(TestService.PingError, {
      debug: DEBUG,
      request: ping,
      host: `https://localhost:${port}`,
      onHeaders: function(headers: BrowserHeaders) {
        didGetOnHeaders = true;
      },
      onMessage: function(message: Empty) {
        didGetOnMessage = true;
        assert.ok(message instanceof Empty);
      },
      onComplete: function(code: grpc.Code, msg: string, trailers: BrowserHeaders) {
        assert.deepEqual(trailers.get("grpc-status"), ["12"]);
        assert.deepEqual(trailers.get("grpc-message"), ["Intentionally returning error for PingError"]);
        assert.strictEqual(code, grpc.Code.Unimplemented);
        assert.strictEqual(msg, "Intentionally returning error for PingError");
        assert.ok(didGetOnHeaders);
        assert.ok(!didGetOnMessage);
        done();
      }
    });
  });

  it("should report failure for a CORS failure", (done) => {
    let didGetOnHeaders = false;
    let didGetOnMessage = false;

    const ping = new PingRequest();

    grpc.invoke(FailService.NonExistant, { // The test server hasn't registered this service, so it should fail CORS
      debug: DEBUG,
      request: ping,
      host: `https://localhost:${port}`,
      onHeaders: function(headers: BrowserHeaders) {
        didGetOnHeaders = true;
      },
      onMessage: function(message: Empty) {
        didGetOnMessage = true;
        assert.ok(message instanceof Empty);
      },
      onComplete: function(code: grpc.Code, msg: string, trailers: BrowserHeaders) {
        // Some browsers return empty Headers for failed requests
        if (didGetOnHeaders) {
          assert.strictEqual(msg, "Response closed without grpc-status (Headers only)");
        } else {
          assert.strictEqual(msg, "Response closed without grpc-status (No headers)");
        }
        assert.strictEqual(code, grpc.Code.Internal);
        assert.ok(!didGetOnMessage);
        done();
      }
    });
  });

  it("should report failure for a dropped response after headers", (done) => {
    let didGetOnHeaders = false;
    let didGetOnMessage = false;

    const ping = new PingRequest();
    ping.setFailureType(PingRequest.FailureType.DROP);

    grpc.invoke(TestService.PingError, {
      debug: DEBUG,
      request: ping,
      host: `https://localhost:${port}`,
      onHeaders: function (headers: BrowserHeaders) {
        didGetOnHeaders = true;
        assert.deepEqual(headers.get("grpc-status"), []);
        assert.deepEqual(headers.get("grpc-message"), []);
      },
      onMessage: function (message: Empty) {
        didGetOnMessage = true;
        assert.ok(message instanceof Empty);
      },
      onComplete: function (code: grpc.Code, msg: string, trailers: BrowserHeaders) {
        // Some browsers return empty Headers for failed requests
        if (didGetOnHeaders) {
          assert.strictEqual(msg, "Response closed without grpc-status (Headers only)");
        } else {
          assert.strictEqual(msg, "Response closed without grpc-status (No headers)");
        }
        assert.strictEqual(code, grpc.Code.Internal);
        assert.ok(!didGetOnMessage);
        done();
      }
    });
  });
}

describe("grpc-web-client", () => {
  testWithLocalPort(9090); // HTTP1.1
  testWithLocalPort(9091); // HTTP2

  it("should report failure for a request to an invalid host", (done) => {
    let didGetOnHeaders = false;
    let didGetOnMessage = false;

    const ping = new PingRequest();
    ping.setFailureType(PingRequest.FailureType.DROP);

    grpc.invoke(TestService.Ping, {
      debug: DEBUG,
      request: ping,
      host: "https://localhost:9999", // Should not be available
      onHeaders: function (headers: BrowserHeaders) {
        didGetOnHeaders = true;
      },
      onMessage: function (message: Empty) {
        didGetOnMessage = true;
        assert.ok(message instanceof Empty);
      },
      onComplete: function (code: grpc.Code, msg: string, trailers: BrowserHeaders) {
        // Some browsers return empty Headers for failed requests
        if (didGetOnHeaders) {
          assert.strictEqual(msg, "Response closed without grpc-status (Headers only)");
        } else {
          assert.strictEqual(msg, "Response closed without grpc-status (No headers)");
        }
        assert.strictEqual(code, grpc.Code.Internal);
        assert.ok(!didGetOnMessage);
        done();
      }
    });
  });

  it("should report failure for a trailers-only response", (done) => {
    let didGetOnHeaders = false;
    let didGetOnMessage = false;

    const ping = new PingRequest();

    grpc.invoke(FailService.NonExistant, { // The test server hasn't registered this service, so it should return an error
      debug: DEBUG,
      request: ping,
      host: "https://localhost:9092", // This service accepts CORS requests for unregistered endpoints
      onHeaders: function(headers: BrowserHeaders) {
        didGetOnHeaders = true;
        assert.deepEqual(headers.get("grpc-status"), ["12"]);
        assert.deepEqual(headers.get("grpc-message"), ["unknown service improbable.grpcweb.test.FailService"]);
      },
      onMessage: function(message: Empty) {
        didGetOnMessage = true;
        assert.ok(message instanceof Empty);
      },
      onComplete: function(code: grpc.Code, msg: string, trailers: BrowserHeaders) {
        assert.deepEqual(trailers.get("grpc-status"), ["12"]);
        assert.deepEqual(trailers.get("grpc-message"), ["unknown service improbable.grpcweb.test.FailService"]);
        assert.strictEqual(code, 12);
        assert.strictEqual(msg, "unknown service improbable.grpcweb.test.FailService");
        assert.ok(didGetOnHeaders);
        assert.ok(!didGetOnMessage);
        done();
      }
    });
  });
});
