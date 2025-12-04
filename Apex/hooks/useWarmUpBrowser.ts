import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

/**
 * Hook para aquecer o navegador antes de iniciar o fluxo OAuth
 * Isso melhora a performance e reduz o tempo de carregamento
 */
export function useWarmUpBrowser() {
  useEffect(() => {
    // Aquecer o navegador em background
    void WebBrowser.warmUpAsync();
    
    // Limpar quando o componente desmontar
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
}

