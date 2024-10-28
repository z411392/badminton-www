export function useDebouncedRef<T>(value: T, delay: number = 200) {
    let timeout: NodeJS.Timeout | undefined
    return customRef<T>((track, trigger) => {
        return {
            get() {
                track()
                return value as T
            },
            set(newValue: T) {
                clearTimeout(timeout)
                timeout = setTimeout(() => {
                    value = newValue
                    trigger()
                }, delay)
            }
        }
    })
}