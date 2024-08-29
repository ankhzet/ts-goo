import { useCallback, useRef } from 'react';

export function useLastCallback<F extends (...args: any[]) => any>(fn: F): (...args: Parameters<F>) => ReturnType<F> {
    const ref = useRef(fn);

    ref.current = fn;

    return useCallback((...args) => ref.current(...args), []);
}
