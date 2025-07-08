import { useEffect, useState } from 'react';

export function usePremiumFeatures() {
  const [features, setFeatures] = useState<Record<string, string | number | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeatures() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/premium-settings-public');
        if (res.ok) {
          const data = await res.json();
          setFeatures(data.features || {});
        } else {
          setError('Erro ao buscar configurações premium');
        }
      } catch (e) {
        setError('Erro ao buscar configurações premium');
      } finally {
        setLoading(false);
      }
    }
    fetchFeatures();
  }, []);

  return { features, loading, error };
} 