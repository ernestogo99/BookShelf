import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';

type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: unknown;
};

type UseAsyncResult<T> = AsyncState<T> & {
  reload: () => void;
  setData: (updater: (prev: T | null) => T | null) => void;
};

/**
 * Executa `fn` quando `deps` mudam, expondo data/loading/error + reload.
 * Ignora respostas obsoletas (guarda de corrida — importante na busca).
 */
export function useAsync<T>(fn: () => Promise<T>, deps: DependencyList): UseAsyncResult<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const callId = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoFn = useCallback(fn, deps);

  const run = useCallback(() => {
    const id = ++callId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    memoFn()
      .then((data) => {
        if (id === callId.current) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (id === callId.current) setState((s) => ({ data: s.data, loading: false, error }));
      });
  }, [memoFn]);

  useEffect(() => {
    run();
  }, [run]);

  const setData = useCallback((updater: (prev: T | null) => T | null) => {
    setState((s) => ({ ...s, data: updater(s.data) }));
  }, []);

  return { ...state, reload: run, setData };
}
