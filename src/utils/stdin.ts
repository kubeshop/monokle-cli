export function streamToPromise(stream: NodeJS.ReadStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    let chunks: Buffer[] = [];

    function onData(chunk: Buffer) {
      chunks.push(chunk);
    }

    function onEnd() {
      unbind();
      resolve(Buffer.concat(chunks));
    }

    function onError(error: Error) {
      unbind();
      reject(error);
    }

    function unbind() {
      stream.removeListener("data", onData);
      stream.removeListener("end", onEnd);
      stream.removeListener("error", onError);
    }

    stream.on("data", onData);
    stream.on("end", onEnd);
    stream.on("error", onError);
  });
}
