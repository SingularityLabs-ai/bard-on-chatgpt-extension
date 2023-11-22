export interface SearchEngine {
  // inputQuery: string[]
  // bodyQuery: string[]
  sidebarContainerQuery: string[]
  // appendContainerQuery: string[]
  watchRouteChange?: (callback: () => void) => void
}

export const config: Record<string, SearchEngine> = {
  openai: {
    // inputQuery: ['form #prompt-textarea'],
    // bodyQuery: ['form #prompt-textarea'],
    sidebarContainerQuery: 'div.overflow-hidden.w-full.h-full.relative.flex', //div[class="scrollbar-trigger"]'],//div:nth-child(1) > div:nth-child(2)'],//'nav'],//'form > div > div:nth-child(1) > div > button'],//'#__next > div:n-thchild(1) > div:n-thchild(2)'],
    // sidebarContainerQuery: "#__next > div.relative.z-0.flex.h-full.w-full.overflow-hidden > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main > div.flex.h-full.flex-col > div.flex-1.overflow-hidden",
    // appendContainerQuery: ['#gpt-answer'], // ['div > div > div > main > div > div > div > div > div.w-full.h-32.md'],
  },
}
