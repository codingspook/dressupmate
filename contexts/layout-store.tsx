import { createContext, useContext, useState } from "react";

interface LayoutStore {
    activeId: string | null;
    setActiveId: (id: string | null) => void;
}

const LayoutContext = createContext<LayoutStore>({
    activeId: null,
    setActiveId: () => {},
});

export const LayoutStoreProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeId, setActiveId] = useState<string | null>(null);

    return (
        <LayoutContext.Provider value={{ activeId, setActiveId }}>
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayoutStore = () => useContext(LayoutContext);
