import {Code} from "./Code";
import {TransportConstructor} from "./transports/Transport";
import {MethodDefinition} from "./service";
import {Metadata} from "./metadata";
import {client} from "./client";
import {ProtobufMessage} from "./message";

export type Request = {
  close: () => void
}

export type RpcOptions<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> = {
  host: string,
  request: TRequest,
  metadata?: Metadata.ConstructorArg,
  onHeaders?: (headers: Metadata) => void,
  onMessage?: (res: TResponse) => void,
  onEnd: (code: Code, message: string, trailers: Metadata) => void,
  transport?: TransportConstructor,
  debug?: boolean,
}


export function invoke<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage, M extends MethodDefinition<TRequest, TResponse>>(methodDescriptor: M, props: RpcOptions<TRequest, TResponse>): Request {
  if (methodDescriptor.requestStream) {
    throw new Error(".invoke cannot be used with client-streaming methods. Use .client instead.");
  }

  // client can throw an error if the transport factory returns an error (e.g. no valid transport)
  const clientImpl = client(methodDescriptor, {
    host: props.host,
    transport: props.transport,
    debug: props.debug,
  });

  if (props.onHeaders) {
    clientImpl.onHeaders(props.onHeaders);
  }
  if (props.onMessage) {
    clientImpl.onMessage(props.onMessage);
  }
  if (props.onEnd) {
    clientImpl.onEnd(props.onEnd);
  }

  clientImpl.start(props.metadata);
  clientImpl.send(props.request);

  return {
    close: () => {
      clientImpl.close();
    }
  };
}
