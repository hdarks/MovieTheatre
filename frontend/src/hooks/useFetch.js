import { useEffect, useState } from "react"

export const useFetch = (apiFn, params = null, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        if (!apiFn) return;
        setLoading(true);

        apiFn(params)
            .then((res) => {
                if (isMounted) setData(res.data);
            })
            .catch((err) => {
                if (isMounted) setError(err);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; }
    }, deps);

    return { data, loading, error };
};