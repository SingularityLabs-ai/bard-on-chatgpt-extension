import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

// const [gprops, setGprops] = useState<Gprops>()

let container = document.createElement('div')

async function mount(question: string, promptSource: string, siteConfig: SearchEngine) {
  container.className = 'chat-gpt-container'

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
  console.log('siderbarContainer', siderbarContainer)
  if (siderbarContainer) {
    siderbarContainer.prepend(container)
  } else {
    container.classList.add('sidebar-free')
    const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
    console.log('appendContainer', appendContainer)
    if (appendContainer) {
      appendContainer.appendChild(container)
    }
  }
  console.log()

  const questionMeta = {}
  console.log(
    'props at index(mount):',
    question,
    questionMeta,
    promptSource,
    userConfig.triggerMode,
  )
  render(
    <ChatGPTContainer
      question={question}
      questionMeta={questionMeta}
      promptSource={promptSource}
      triggerMode={userConfig.triggerMode || 'always'}
    />,
    container,
  )
}

async function render_already_mounted(
  question: string,
  questionMeta: any,
  promptSource: string,
  siteConfig: SearchEngine,
) {
  console.log('props at index(render_already_mounted):', question, questionMeta, promptSource)
  render(
    <ChatGPTContainer
      question={question}
      questionMeta={questionMeta}
      promptSource={promptSource}
      triggerMode={'always'}
    />,
    container,
  )
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

if (siteConfig.watchRouteChange) {
  // siteConfig.watchRouteChange(run)
}

window.onload = function () {
  console.log('Page load completed')
  const textarea = document.getElementById('prompt-textarea')

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault() // Prevent the default Enter key behavior (e.g., line break)
      const text = event.target.value
      console.log('Enter key pressed! Text: ' + text)
      const bodyInnerText = text.trim().replace(/\s+/g, ' ').substring(0, 1500)
      console.log('Body: ' + bodyInnerText)
      console.log('location.hostname', location.hostname)
      console.log('siteConfig', siteConfig)
      console.log('final prompt:', bodyInnerText)
      const gpt_container = document.querySelector('div.chat-gpt-container')
      if (!gpt_container) mount(bodyInnerText, 'default', siteConfig)
      else render_already_mounted(bodyInnerText, {}, 'default', siteConfig)
    }
  })
}
