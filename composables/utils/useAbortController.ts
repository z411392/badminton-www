export const useAbortController = () => {
    const abortControllersMap = new Map<Symbol, AbortController>()
    let lastSymbol: Symbol | undefined = undefined
    const clear = () => {
        for (const symbol of abortControllersMap.keys()) {
            const abortController = abortControllersMap.get(symbol)!
            abortController.abort()
            abortControllersMap.delete(symbol)
        }
        lastSymbol = undefined
    }
    const cancel = () => {
        if (!lastSymbol) return
        const symbol = lastSymbol
        if (!abortControllersMap.has(symbol)) return
        const abortController = abortControllersMap.get(symbol)!
        abortController.abort()
        abortControllersMap.delete(symbol)
        lastSymbol = undefined
    }
    const signal = (request: any) => {
        const symbol = Symbol(JSON.stringify(request))
        if (abortControllersMap.has(symbol)) {
            const abortController = abortControllersMap.get(symbol)!
            abortController.abort()
            abortControllersMap.delete(symbol)
        }
        const abortController = new AbortController()
        abortControllersMap.set(symbol, abortController)
        lastSymbol = symbol
        return abortController.signal
    }
    return {
        clear,
        cancel,
        signal,
    }
}