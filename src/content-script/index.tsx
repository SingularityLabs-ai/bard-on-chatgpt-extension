import { render } from 'preact'
import '../base.css'
import { getUserConfig, Theme } from '../config'
import { detectSystemColorScheme } from '../utils'
import ChatGPTContainer from './ChatGPTContainer'
import Global from './Global'
import { config, SearchEngine } from './search-engine-configs'
import './styles.scss'
import { getPossibleElementByQuerySelector } from './utils'

const siteRegex = new RegExp(Object.keys(config).join('|'))
let siteName
try {
  siteName = location.hostname.match(siteRegex)![0]
} catch (error) {
  siteName = location.pathname.match(siteRegex)![0]
}
const siteConfig = config[siteName]

let container = document.createElement('div')

function waitForElm(selector) {
  return new Promise((resolve) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }

    const observer = new MutationObserver((mutations) => {
      if (document.querySelector(selector)) {
        observer.disconnect()
        resolve(document.querySelector(selector))
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

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
  waitForElm(siteConfig.sidebarContainerQuery).then((siderbarContainer) => {
    siderbarContainer.append(container)
  })

  // // console.log('siderbarContainer', siderbarContainer)
  // if (siderbarContainer) {
  //   siderbarContainer.append(container)
  // } else {
  //   container.classList.add('sidebar-free')
  //   const appendContainer = getPossibleElementByQuerySelector(siteConfig.appendContainerQuery)
  //   // console.log('appendContainer', appendContainer)
  //   if (appendContainer) {
  //     appendContainer.appendChild(container)
  //   }
  // }

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

let last_query_time = 1
async function render_already_mounted(
  question: string,
  promptSource: string,
  siteConfig: SearchEngine,
) {
  console.log('props at index(render_already_mounted):', question, promptSource)
  container = document.createElement('div')
  const allps = document.querySelectorAll('.chat-gpt-container') //#gpt-answer")
  allps[allps.length - 1].appendChild(container)

  // const nav_buts = document.querySelectorAll('nav button')
  // const ids = nav_buts[nav_buts.length - 1].textContent.split(',')
  // console.log('ids from html', ids);
  const contextIds = Global.contextIds //[ids[0], ids[1], ids[2]]
  const requestParams = {}
  requestParams.atValue = Global.atValue //ids[3]
  requestParams.blValue = Global.blValue //ids[4]
  console.log('contextIds', contextIds)
  console.log('requestParams', requestParams)
  last_query_time = Date.now()

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
}

const getSiblings = (elm, withTextNodes) => {
  if (!elm || !elm.parentNode) return
  const siblings = [...elm.parentNode[withTextNodes ? 'childNodes' : 'children']],
    idx = siblings.indexOf(elm)
  siblings.before = siblings.slice(0, idx)
  siblings.after = siblings.slice(idx + 1)
  return siblings
}

window.onload = function () {
  console.log('Page load completed')
  const textarea = document.getElementById('prompt-textarea')
  const text_entered_button = getSiblings(textarea).after[0]
  if (text_entered_button.tagName == 'BUTTON') {
    text_entered_button.addEventListener('click', (event) => {
      console.log('Pressed: ' + text_entered_button.tagName)
      console.log('Now button press to enter(keydown) conversion step', event)
      textarea.dispatchEvent(
        new KeyboardEvent('keydown', {
          bubbles: true,
          cancelable: true,
          isTrusted: true,
          key: 'Enter',
          code: 'Enter',
          location: 0,
          ctrlKey: false,
        }),
      )
      return false
    })
  }

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

window.setInterval(function () {
  console.log(
    'times=',
    Date.now(),
    last_query_time,
    Date.now() - last_query_time < 19000,
    Global.done,
  )
  if (Date.now() - last_query_time < 19000 && Global.done == true) {
    const gpt_container = document.querySelector('div.chat-gpt-container')
    gpt_container.scroll({ top: gpt_container.scrollHeight, behavior: 'smooth' })
    Global.done = false
  }
}, 5000)
