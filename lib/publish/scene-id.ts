// Short, URL-safe scene ids. Not cryptographically strong — collisions are
// unlikely at MVP volume and ids are unguessable enough for casual sharing.

export function newSceneId(): string {
  const rand = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
    : Math.random().toString(36).slice(2, 12);
  return rand;
}
