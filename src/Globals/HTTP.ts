import { Global } from './Base';
import {
  BinaryReadHandle,
  isBinaryHandle,
  RawBinaryReadHandle,
  RawReadHandle,
  ReadHandle,
} from './FS';

interface ResponseHandle {
  getResponseCode(): Promise<number>;
  getResponseHeaders(): Promise<Record<string, string>>;
}

interface RawResponseHandle {
  getResponseCode(): Promise<[number]>;
  getResponseHeaders(): Promise<[Record<string, string>]>;
}

export interface Response extends ReadHandle, ResponseHandle {}
export interface BinaryResponse extends BinaryReadHandle, ResponseHandle {}
export interface RawResponse extends RawReadHandle, RawResponseHandle {}
export interface RawBinaryResponse
  extends RawBinaryReadHandle,
    RawResponseHandle {}

type AnyResponse = Response | BinaryResponse | RawResponse | RawBinaryResponse;
type AnyBinaryResponse = BinaryResponse | RawBinaryResponse;
export function isBinaryResponse(
  response: AnyResponse
): response is AnyBinaryResponse {
  return isBinaryHandle(response);
}

export type HTTPNetworkedType = RawResponse | RawBinaryResponse;

type BaseRequest = {
  url: string;
  headers?: Record<string, string>;
  binary?: boolean;
  method?: string;
  redirect?: boolean;
};

type Request = BaseRequest & {
  body?: string;
};

export class HTTP extends Global {
  readonly id = 'http';

  async request(
    request: string | Request,
    body?: string,
    headers?: Record<string, string>,
    binary?: boolean
  ): Promise<void> {
    await this.computer.run(`http.get`, request, body, headers, binary);
    return;
  }

  get(request: string, headers?: Record<string, string>): Promise<Response>;
  get(
    request: string,
    headers: Record<string, string>,
    binary: true
  ): Promise<BinaryResponse>;
  get(request: BaseRequest): Promise<Response>;
  get(
    request: BaseRequest & {
      binary: true;
    }
  ): Promise<BinaryResponse>;

  async get(
    request: string | BaseRequest,
    headers?: Record<string, string>,
    binary?: boolean
  ): Promise<Response | BinaryResponse> {
    return this.computer
      .run(`http.get`, request, headers, binary)
      .then((out: [RawResponse | RawBinaryResponse]) => {
        const rawResponse = out[0];
        if (!isBinaryResponse(rawResponse)) {
          const response: Response = {
            readLine: async (withTrailing?) =>
              (await rawResponse.readLine(withTrailing))[0],
            readAll: async () => (await rawResponse.readAll())[0],
            read: async (count) => (await rawResponse.read(count))[0],
            close: async () => (await rawResponse.close())[0],
            getResponseCode: async () =>
              (await rawResponse.getResponseCode())[0],
            getResponseHeaders: async () =>
              (await rawResponse.getResponseHeaders())[0],
          };

          return response;
        } else {
          const response: BinaryResponse = {
            read: async (count?) => (await rawResponse.read(count))[0],
            readAll: async () => (await rawResponse.readAll())[0],
            readLine: async (withTrailing?) =>
              (await rawResponse.readLine(withTrailing))[0],
            close: async () => (await rawResponse.close())[0],
            seek: async (whence, offset) =>
              (await rawResponse.seek(whence, offset))[0],
            getResponseCode: async () =>
              (await rawResponse.getResponseCode())[0],
            getResponseHeaders: async () =>
              (await rawResponse.getResponseHeaders())[0],
          };

          return response;
        }
      });
  }

  post(
    request: string,
    body: string,
    headers?: Record<string, string>,
    binary?: false | null
  ): Promise<Response>;
  post(
    request: string,
    body: string,
    headers?: Record<string, string>,
    binary?: true
  ): Promise<BinaryResponse>;
  post(
    request: Request & {
      binary?: false | null;
    }
  ): Promise<Response>;
  post(
    request: Request & {
      binary?: true;
    }
  ): Promise<BinaryResponse>;

  async post(
    request: string | Request,
    body?: string,
    headers?: Record<string, string>,
    binary?: boolean
  ): Promise<Response | BinaryResponse> {
    return this.computer
      .run(`http.post`, request, body, headers, binary)
      .then((out: [RawResponse | RawBinaryResponse]) => {
        const rawResponse = out[0];
        if (!isBinaryResponse(rawResponse)) {
          const response: Response = {
            readLine: async (withTrailing?) =>
              (await rawResponse.readLine(withTrailing))[0],
            readAll: async () => (await rawResponse.readAll())[0],
            read: async (count) => (await rawResponse.read(count))[0],
            close: async () => (await rawResponse.close())[0],
            getResponseCode: async () =>
              (await rawResponse.getResponseCode())[0],
            getResponseHeaders: async () =>
              (await rawResponse.getResponseHeaders())[0],
          };

          return response;
        } else {
          const response: BinaryResponse = {
            read: async (count?) => (await rawResponse.read(count))[0],
            readAll: async () => (await rawResponse.readAll())[0],
            readLine: async (withTrailing?) =>
              (await rawResponse.readLine(withTrailing))[0],
            close: async () => (await rawResponse.close())[0],
            seek: async (whence, offset) =>
              (await rawResponse.seek(whence, offset))[0],
            getResponseCode: async () =>
              (await rawResponse.getResponseCode())[0],
            getResponseHeaders: async () =>
              (await rawResponse.getResponseHeaders())[0],
          };

          return response;
        }
      });
  }

  async checkURLAsync(url: string): Promise<{
    success: boolean;
    reason?: string;
  }> {
    return this.computer
      .run(`http.checkURL`, url)
      .then((out: [true] | [false, string]) => ({
        success: out[0],
        reason: out[1],
      }));
  }

  async checkURL(url: string): Promise<{
    success: boolean;
    reason?: string;
  }> {
    return this.computer
      .run(`http.checkURL`, url)
      .then((out: [true] | [false, string]) => ({
        success: out[0],
        reason: out[1],
      }));
  }

  //   TODO: Implement allowance for multiple websocket connections
  //   async websocket(
  //     url: string,
  //     headers?: Record<string, string>
  //   ): Promise<Websocket> {
  //     return this.computer
  //       .run(`http.websocket`, url, headers)
  //       .then();
  //   }
  //
  //   async websocketAsync(
  //     url: string,
  //     headers?: Record<string, string>
  //   ): Promise<Websocket> {
  //     return this.computer
  //       .run(`http.websocket`, url, headers)
  //       .then();
  //   }
}
