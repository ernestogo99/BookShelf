import { useCallback, useState } from 'react';

import type { ToastType } from '@/components';

type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

/** Estado controlado para o componente <Toast />. */
export function useToast() {
  const [state, setState] = useState<ToastState>({ visible: false, message: '', type: 'info' });

  const show = useCallback((message: string, type: ToastType = 'info') => {
    setState({ visible: true, message, type });
  }, []);

  const hide = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
  }, []);

  return { ...state, show, hide };
}
