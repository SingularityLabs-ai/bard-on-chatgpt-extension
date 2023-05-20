import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

let container = document.createElement('div')

// function scrollToDiv() {
//   // this.scrollIntoView();
//   // this.scroll({ top: this.scrollHeight, behavior: 'smooth' })
// };

async function mount(question: string, promptSource: string, siteConfig: SearchEngine) {
  container.className = 'chat-gpt-container'
  // container.setAttribute("onchange", "scrollToDiv()");

  const userConfig = await getUserConfig()
  let theme: Theme
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container.classList.add('gpt-dark')
  } else {
    container.classList.add('gpt-light')
  }

  const siderbarContainer = getPossibleElementByQuerySelector(siteConfig.sidebarContainerQuery)
  // console.log('siderbarContainer', siderbarContainer)
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    // console.log('appendContainer', appendContainer)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }

  console.log('props at index(mount):', question, promptSource, userConfig.triggerMode)

  render(
    <ChatGPTContainer
      question={question}
      promptSource={promptSource}
      triggerMode={userConfig.triggerMode || 'always'}
    />,
    container,
  )
}

async function render_already_mounted(
  question: string,
  promptSource: string,
  siteConfig: SearchEngine,
) {
  console.log('props at index(render_already_mounted):', question, promptSource)
  container = document.createElement('div')
  const allps = document.querySelectorAll('.chat-gpt-container') //#gpt-answer")
  allps[allps.length - 1].appendChild(container)

  const nav_buts = document.querySelectorAll('nav button')
  const ids = nav_buts[nav_buts.length - 1].textContent.split(',')
  const contextIds = [ids[0], ids[1], ids[2]]
  const requestParams = {}
  requestParams.atValue = ids[3]
  requestParams.blValue = ids[4]
  console.log('contextIds', contextIds)
  console.log('requestParams', requestParams)

  render(
    <ChatGPTContainer
      question={question}
      contextIds={contextIds}
      requestParams={requestParams}
      promptSource={promptSource}
      triggerMode={'always'}
    />,
    container,
  )
  // scrollToBottom(container);
}

/**
 * mount html elements when requestions triggered
 * @param question question string
 * @param index question index
 */
export async function requeryMount(question: string, index: number) {
  container = document.querySelector<HTMLDivElement>('.question-container')
  let theme: Theme
  const questionItem = document.createElement('div')
  questionItem.className = `question-${index}`

  const userConfig = await getUserConfig()
  if (userConfig.theme === Theme.Auto) {
    theme = detectSystemColorScheme()
  } else {
    theme = userConfig.theme
  }
  if (theme === Theme.Dark) {
    container?.classList.add('gpt-dark')
    questionItem.classList.add('gpt-dark')
  } else {
    container?.classList.add('gpt-light')
    questionItem.classList.add('gpt-light')
  }
  questionItem.innerText = `Q${index + 1} : ${question}`
  container?.appendChild(questionItem)
}

const siteRegex = new RegExp(Object.keys(config).join('|'))
let siteName
try {
  siteName = location.hostname.match(siteRegex)![0]
} catch (error) {
  siteName = location.pathname.match(siteRegex)![0]
}
const siteConfig = config[siteName]

window.onload = function () {
  console.log('Page load completed')
  const textarea = document.getElementById('prompt-textarea')

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault() // Prevent the default Enter key behavior (e.g., line break)
      const text = event.target.value
      console.log('Enter key pressed! Text: ' + text)
      const bodyInnerText = text.trim().replace(/\s+/g, ' ').substring(0, 1500)
      console.log('final prompt:', bodyInnerText)
      const gpt_container = document.querySelector('div.chat-gpt-container')
      if (!gpt_container) mount(bodyInnerText, 'default', siteConfig)
      else render_already_mounted(bodyInnerText, 'default', siteConfig)
      if (gpt_container) {
        gpt_container.scroll({ top: gpt_container.scrollHeight, behavior: 'smooth' })
      }
    }
  })
}
