import { useCallback } from 'react';

const useTextTransform = () => {
    const uC = useCallback((str: string): string => {
        return str.toUpperCase();
    }, []);

    const lC = useCallback((str: string): string => {
        return str.toLowerCase();
    }, []);

    const c = useCallback((str: string): string => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }, []);

    const cF = useCallback((str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }, []);

    return {
        uC,
        lC,
        c,
        cF,
    };
};

export default useTextTransform;