import {Metadata} from "../metadata";
import fetchRequest from "./fetch";
import xhrRequest from "./xhr";
import mozXhrRequest from "./mozXhr";
import httpNodeRequest from "./nodeHttp";
import {MethodDefinition} from "../service";
import {ProtobufMessage} from "../message";

declare const Response: any;
declare const Headers: any;

export interface Transport {
  sendMessage(msgBytes: ArrayBufferView): void
  cancel(): void
  start(metadata: Metadata): void
}

export interface TransportConstructor {
  (options: TransportOptions): Transport;
}

export type TransportOptions = {
  debug: boolean,
  url: string,
  onHeaders: (headers: Metadata, status: number) => void,
  onChunk: (chunkBytes: Uint8Array, flush?: boolean) => void,
  onEnd: (err?: Error) => void,
}

let xhr: XMLHttpRequest;
function getXHR () {
  if (xhr !== undefined) return xhr;

  if (XMLHttpRequest) {
    xhr = new XMLHttpRequest();
    try {
      xhr.open("GET", "https://localhost")
    } catch (e) {}
  }
  return xhr
}

function xhrSupportsResponseType(type: string) {
  const xhr = getXHR();
  if (!xhr) {
    return false;
  }
  try {
    (xhr as any).responseType = type;
    return xhr.responseType === type;
  } catch (e) {}
  return false
}

export interface TransportFactory {
  (m: MethodDefinition<ProtobufMessage, ProtobufMessage>): TransportConstructor | Error;
}

let selectedTransport: TransportConstructor;
export function DefaultTransportFactory(methodDescriptor: MethodDefinition<ProtobufMessage, ProtobufMessage>): TransportConstructor | Error {
  // The transports provided by DefaultTransportFactory do not support client-streaming
  if (methodDescriptor.requestStream) {
    return new Error("No transport available for client-streaming (requestStream) method");
  }

  if (!selectedTransport) {
    selectedTransport = detectTransport();
  }

  return selectedTransport;
}

function detectTransport(): TransportConstructor {
  if (typeof Response !== "undefined" && Response.prototype.hasOwnProperty("body") && typeof Headers === "function") {
    return fetchRequest;
  }

  if (typeof XMLHttpRequest !== "undefined") {
    if (xhrSupportsResponseType("moz-chunked-arraybuffer")) {
      return mozXhrRequest;
    }

    if (XMLHttpRequest.prototype.hasOwnProperty("overrideMimeType")) {
      return xhrRequest;
    }
  }

  if (typeof module !== "undefined" && module.exports) {
    return httpNodeRequest;
  }

  throw new Error("No suitable transport found for gRPC-Web");
}
