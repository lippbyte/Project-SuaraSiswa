import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LayeredWaveTransition from '../components/LayeredWaveTransition';

const PageTransitionContext = createContext(null);

export function PageTransitionProvider({ children }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionRef = useRef(null);

    const transitionTo = useCallback((to) => {
        if (!to || isTransitioning) return;
        if (location.pathname === to) return;

        if (transitionRef.current && typeof transitionRef.current.trigger === 'function') {
            transitionRef.current.trigger(to);
        } else {
            navigate(to);
        }
    }, [navigate, location.pathname, isTransitioning]);

    return (
        <PageTransitionContext.Provider value={{ transitionTo, isTransitioning }}>
            {children}
            <LayeredWaveTransition ref={transitionRef} setIsTransitioning={setIsTransitioning} />
        </PageTransitionContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePageTransition() {
    const context = useContext(PageTransitionContext);
    if (!context) {
        throw new Error('usePageTransition must be used within a PageTransitionProvider');
    }
    return context;
}
