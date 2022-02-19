
// Why is this not standard?
// Work around for .filter(x => x !== null) type safety
// https://github.com/microsoft/TypeScript/issues/16069#issuecomment-369374214
export function isNotNullOrUndefined<T extends Object>(input: null | undefined | T): input is T {
    return input != null;
}
