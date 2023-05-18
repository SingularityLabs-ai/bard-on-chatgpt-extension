export interface SearchEngine {
  inputQuery: string[]
  bodyQuery: string[]
  sidebarContainerQuery: string[]
  appendContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  openai: {
    inputQuery: ['form #prompt-textarea'],
    bodyQuery: ['form #prompt-textarea'],
    sidebarContainerQuery: ['#__next > div:n-thchild(1) > div:n-thchild(2)'],
    appendContainerQuery: ['#res'],
  },
}
