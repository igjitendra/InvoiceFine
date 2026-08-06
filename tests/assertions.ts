export function assert(
  condition: unknown,
  message = "Assertion failed",
): asserts condition {
  if (!condition) throw new Error(message);
}

export function equal(actual: unknown, expected: unknown): void {
  if (!Object.is(actual, expected)) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
}

export function deepEqual(actual: unknown, expected: unknown): void {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`Expected ${expectedJson}, received ${actualJson}`);
  }
}

export function match(value: string, pattern: RegExp): void {
  if (!pattern.test(value))
    throw new Error(`Expected value to match ${pattern}`);
}

export function doesNotMatch(value: string, pattern: RegExp): void {
  if (pattern.test(value))
    throw new Error(`Expected value not to match ${pattern}`);
}
