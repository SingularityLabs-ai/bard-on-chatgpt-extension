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
    sidebarContainerQuery: ['div.overflow-hidden.w-full.h-full.relative.flex'], //div[class="scrollbar-trigger"]'],//div:nth-child(1) > div:nth-child(2)'],//'nav'],//'form > div > div:nth-child(1) > div > button'],//'#__next > div:n-thchild(1) > div:n-thchild(2)'],
    appendContainerQuery: ['#gpt-answer'], // ['div > div > div > main > div > div > div > div > div.w-full.h-32.md'],
  },
}
