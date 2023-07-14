import Browser from 'webextension-polyfill'
import '../base.css'

const isChrome = /chrome/i.test(navigator.userAgent)

function App() {
  window.addEventListener('DOMContentLoaded', function () {
    console.log('btnOpenNewTab clicked')
    const link = document.getElementById('btnOpenNewTab')
    link.addEventListener('click', function () {
      const newURL = 'http://chat.openai.com/'
      Browser.tabs.create({ url: newURL })
    })
  })
  return <></>
}

export default App
