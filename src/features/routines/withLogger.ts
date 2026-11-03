export function withLogger<S, A extends { type: string }>(reducer: (state: S, action: A) => S) {
  return (state: S, action: A): S => {
    const next = reducer(state, action);
    if (import.meta.env.DEV) console.log(action.type, { prev: state, next });
    return next;
  };
}
