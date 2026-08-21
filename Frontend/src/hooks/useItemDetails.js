import { useEffect, useRef, useState } from 'react';
import { getItemByIdApi } from '@/api/items.api';

/**
 * Fetches item details for a list of ids and returns a map { [id]: item }.
 * Each id is requested at most once per mount cycle; failures are not retried.
 */
export default function useItemDetails(ids = []) {
  const [itemsById, setItemsById] = useState({});
  const requested = useRef(new Set());

  const cleanIds = [...new Set(ids.filter(Boolean))];
  const key = cleanIds.sort((a, b) => a - b).join(',');

  useEffect(() => {
    cleanIds.forEach((id) => {
      if (requested.current.has(id)) return;
      requested.current.add(id);
      getItemByIdApi(id)
        .then((res) => {
          setItemsById((prev) => ({ ...prev, [id]: res.data }));
        })
        .catch(() => {
          // leave out of the map; card falls back to placeholder
        });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return itemsById;
}
