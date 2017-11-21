import {BrowserHeaders} from "browser-headers";
import * as impTransport from "./transports/Transport";
import * as impCode from "./Code";
import * as impInvoke from "./invoke";
import * as impUnary from "./unary";
import * as impClient from "./client";
import * as impService from "./service";
import {ProtobufMessage} from "./message";

export namespace grpc {
  export interface Transport extends impTransport.Transport{}
  export type TransportOptions = impTransport.TransportOptions;
  export type TransportConstructor = impTransport.TransportConstructor;
  export const DefaultTransportFactory = impTransport.DefaultTransportFactory;
  export const WebsocketTransportFactory = impTransport.WebsocketTransportFactory;

  export type UnaryMethodDefinition<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> = impService.UnaryMethodDefinition<TRequest, TResponse>;
  export type MethodDefinition<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> = impService.MethodDefinition<TRequest, TResponse>;
  export type ServiceDefinition = impService.ServiceDefinition;

  export import Code = impCode.Code;
  export import Metadata = BrowserHeaders;

  export const invoke = impInvoke.invoke;
  export type Request = impInvoke.Request;

  export const unary = impUnary.unary;
  export type UnaryRpcOptions<M extends UnaryMethodDefinition<TRequest, TResponse>, TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> = impUnary.UnaryRpcOptions<M, TRequest, TResponse>;

  export type Client<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> = impClient.Client<TRequest, TResponse>;
  export function client<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage, M extends MethodDefinition<TRequest, TResponse>>(methodDescriptor: M, props: ClientRpcOptions<TRequest, TResponse>): Client<TRequest, TResponse> {
    return impClient.client(methodDescriptor, props);
  }
  export type ClientRpcOptions<TRequest extends ProtobufMessage, TResponse extends ProtobufMessage> = impClient.ClientRpcOptions<TRequest, TResponse>;
}
