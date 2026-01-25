import { useEffect, useRef } from 'react';

/**
 * Hook to enforce and verify spellcheck is disabled.
 * Critical for assessment integrity compliance.
 * 
 * @param {Object} editor - TipTap editor instance
 * @returns {Object} Status object with verification results
 */
export function useSpellcheckDisable(editor) {
    const mutationObserverRef = useRef(null);
    const complianceLogRef = useRef([]);

    useEffect(() => {
        if (!editor || !editor.view.dom) return;

        const editorElement = editor.view.dom;

        // 1. Initial enforcement - set spellcheck="false" explicitly
        const enforceSpellcheckOff = () => {
            editorElement.setAttribute('spellcheck', 'false');

            // Additional attributes for broader browser support
            editorElement.setAttribute('autocorrect', 'off');
            editorElement.setAttribute('autocapitalize', 'off');
            editorElement.setAttribute('autocomplete', 'off');

            // Remove browser-added spellcheck dictionaries if any
            editorElement.removeAttribute('spell-check');
        };

        // 2. Monitor mutations - catch attempts to re-enable spellcheck
        const handleMutations = (mutations) => {
            let spellcheckReenabled = false;

            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'spellcheck') {
                    const target = mutation.target;
                    if (target.getAttribute('spellcheck') === 'true') {
                        complianceLogRef.current.push({
                            event: 'spellcheck_reenabled_attempt',
                            timestamp: new Date().toISOString(),
                            element: target.tagName,
                        });

                        // Immediately re-disable
                        target.setAttribute('spellcheck', 'false');
                        spellcheckReenabled = true;
                    }
                }
            }

            if (spellcheckReenabled) {
                console.warn('[Abigail Compliance] Spellcheck re-enable attempt detected and blocked');
            }
        };

        // Initial enforcement
        enforceSpellcheckOff();

        // Monitor for attribute changes (including spellcheck)
        mutationObserverRef.current = new MutationObserver(handleMutations);
        mutationObserverRef.current.observe(editorElement, {
            attributes: true,
            subtree: true,
            attributeFilter: ['spellcheck'],
            attributeOldValue: true,
        });

        // Periodic enforcement (extra paranoid mode)
        const enforcementInterval = setInterval(enforceSpellcheckOff, 5000); // Every 5s

        // Cleanup
        return () => {
            clearInterval(enforcementInterval);
            mutationObserverRef.current?.disconnect();
        };
    }, [editor]);

    // Provide compliance verification function
    return {
        getComplianceLog: () => complianceLogRef.current,
        clearComplianceLog: () => {
            complianceLogRef.current = [];
        },
    };
}
