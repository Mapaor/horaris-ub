import { useEffect, useRef } from "react";

export function useSearchShortcut<T extends HTMLInputElement>() {
    const inputRef = useRef<T>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() !== "s" || event.altKey || event.ctrlKey || event.metaKey) return;

            const target = event.target;
            if (target instanceof HTMLElement && (
                target.isContentEditable ||
                target.closest("input, textarea, select, [contenteditable='true']")
            )) return;

            event.preventDefault();
            inputRef.current?.focus();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    return inputRef;
}
