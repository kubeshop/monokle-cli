let origin: string | undefined = undefined;

export function setOrigin(originFlag?: string) {
  if (originFlag) {
    origin = originFlag;
  }
}

export function getOrigin() {
  return origin || process.env.MONOKLE_ORIGIN;
}
