import { GearIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'preact/hooks'
import { memo, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import Browser from 'webextension-polyfill'
import { captureEvent } from '../analytics'
import { Answer } from '../messaging'
import ChatGPTFeedback from './ChatGPTFeedback'
import Global from './Global'
import SingularityLabsSocial from './SingularityLabsSocial'
import { isBraveBrowser, shouldShowRatingTip } from './utils.js'

export type QueryStatus = 'success' | 'error' | undefined

import { TriggerMode } from '../config'
interface Props {
  question: string
  contextIds: string[]
  requestParams: any
  promptSource: string
  triggerMode: TriggerMode
  onStatusChange?: (status: QueryStatus) => void
}

interface Requestion {
  requestion: string
  index: number
  answer: Answer | null
}

interface ReQuestionAnswerProps {
  latestAnswerText: string | undefined
}

function ChatGPTQuery(props: Props) {
  // const inputRef = useRef<HTMLInputElement>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)
  const [done, setDone] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [status, setStatus] = useState<QueryStatus>()
  const [reError, setReError] = useState('')
  const [reQuestionDone, setReQuestionDone] = useState(false)
  const [requestionList, setRequestionList] = useState<Requestion[]>([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reQuestionLatestAnswerText, setReQuestionLatestAnswerText] = useState<string | undefined>()

  useEffect(() => {
    props.onStatusChange?.(status)
  }, [props, status])

  useEffect(() => {
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      if (msg.text) {
        setAnswer(msg)
        setStatus('success')
      } else if (msg.error) {
        setError(msg.error)
        setStatus('error')
      } else if (msg.event === 'DONE') {
        setDone(true)
        setReQuestionDone(true)
      }
    }
    port.onMessage.addListener(listener)
    Global.done = false
    if (
      (props.contextIds && props.contextIds.length > 0) ||
      (props.requestParams &&
        (props.requestParams.atValue != '0' || props.requestParams.blValue != '0'))
    ) {
      port.postMessage({
        question: props.question,
        contextIds: props.contextIds,
        requestParams: props.requestParams,
      })
    } else {
      port.postMessage({ question: props.question })
    }
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [props.question, props.contextIds, props.requestParams, retry])
  console.log('answer2:', answer)
  console.log('answer2?.conversationContext:', answer?.conversationContext)

  // const nav_buts = document.querySelectorAll('nav button')
  // nav_buts[nav_buts.length - 1].innerHTML =
  //   answer?.conversationContext?.contextIds +
  //   ',' +
  //   answer?.conversationContext?.requestParams.atValue +
  //   ',' +
  //   answer?.conversationContext?.requestParams.blValue

  if (answer?.conversationContext) {
    console.log('answer=', answer)
    Global.contextIds = answer.conversationContext.contextIds
    Global.atValue = answer.conversationContext.requestParams.atValue
    Global.blValue = answer.conversationContext.requestParams.blValue
    console.log('DONE')
    Global.done = true
  }

  // retry error on focus
  useEffect(() => {
    const onFocus = () => {
      if (error && (error == 'UNAUTHORIZED' || error === 'CLOUDFLARE')) {
        setError('')
        setRetry((r) => r + 1)
      }
    }
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
    }
  }, [error])

  useEffect(() => {
    shouldShowRatingTip().then((show) => setShowTip(show))
  }, [])

  useEffect(() => {
    if (status === 'success') {
      captureEvent('show_answer', { host: location.host, language: navigator.language })
    }
  }, [props.question, status])

  const openOptionsPage = useCallback(() => {
    Browser.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' })
  }, [])

  // requestion
  useEffect(() => {
    if (!requestionList[questionIndex]) return
    const port = Browser.runtime.connect()
    const listener = (msg: any) => {
      try {
        if (msg.text) {
          const requestionListValue = requestionList
          requestionListValue[questionIndex].answer = msg
          setRequestionList(requestionListValue)
          const latestAnswerText = requestionList[questionIndex]?.answer?.text
          setReQuestionLatestAnswerText(latestAnswerText)
          console.log('answer3:', answer)
        } else if (msg.event === 'DONE') {
          setReQuestionDone(true)
          setQuestionIndex(questionIndex + 1)
        }
      } catch {
        setReError(msg.error)
      }
    }
    port.onMessage.addListener(listener)
    console.log('answer4:', answer)

    port.postMessage({
      question: requestionList[questionIndex].requestion,
      conversationId: answer?.conversationId,
      parentMessageId:
        questionIndex == 0
          ? answer?.messageId
          : requestionList[questionIndex - 1].answer?.messageId,
      conversationContext:
        questionIndex == 0
          ? answer?.conversationContext
          : requestionList[questionIndex - 1].answer?.conversationContext,
    })
    return () => {
      port.onMessage.removeListener(listener)
      port.disconnect()
    }
  }, [
    requestionList,
    questionIndex,
    answer?.conversationId,
    answer?.messageId,
    answer?.conversationContext,
  ])

  // * Requery Handler Function
  // const requeryHandler = useCallback(() => {
  //   if (inputRef.current) {
  //     setReQuestionDone(false)
  //     const requestion = inputRef.current.value
  //     setRequestionList([...requestionList, { requestion, index: questionIndex, answer: null }])
  //     inputRef.current.value = ''
  //   }
  // }, [requestionList, questionIndex])

  // const ReQuestionAnswerFixed = ({ text }: { text: string | undefined }) => {
  //   if (!text) return <p className="text-[#b6b8ba] animate-pulse">Answering...</p>
  //   return (
  //     <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>{text}</ReactMarkdown>
  //   )
  // }

  // const ReQuestionAnswer = ({ latestAnswerText }: ReQuestionAnswerProps) => {
  //   if (!latestAnswerText || requestionList[requestionList.length - 1]?.answer?.text == undefined) {
  //     return <p className="text-[#b6b8ba] animate-pulse">Answering...</p>
  //   }
  //   return (
  //     <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
  //       {latestAnswerText}
  //     </ReactMarkdown>
  //   )
  // }

  if (answer) {
    return (
      <div className="markdown-body gpt-markdown" id="gpt-answer" dir="auto">
        <div className="gpt-header">
          <span className="font-bold">Me</span>
          <SingularityLabsSocial />
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {props.question}
        </ReactMarkdown>

        <div className="gpt-header">
          <span className="font-bold">Gemini</span>
          <span className="cursor-pointer leading-[0]" onClick={openOptionsPage}>
            <GearIcon size={14} />
          </span>
          <ChatGPTFeedback
            messageId={answer.messageId}
            conversationId={answer.conversationId}
            latestAnswerText={answer.text}
          />
        </div>
        <ReactMarkdown rehypePlugins={[[rehypeHighlight, { detect: true }]]}>
          {answer.text}
        </ReactMarkdown>
      </div>
    )
  }

  if (error === 'UNAUTHORIZED' || error === 'CLOUDFLARE') {
    return (
      <p>
        Please login and pass Cloudflare check at{' '}
        <a href="https://gemini.google.com" target="_blank" rel="noreferrer">
          gemini.google.com
        </a>
        {retry > 0 &&
          (() => {
            if (isBraveBrowser()) {
              return (
                <span className="block mt-2">
                  Still not working? Follow{' '}
                  <a href="https://github.com/SingularityLabs-ai/bard-on-chatgpt-extension#troubleshooting">
                    Brave Troubleshooting
                  </a>
                </span>
              )
            } else {
              return (
                <span className="italic block mt-2 text-xs">
                  Google Gemini requires passing a security check every once in a while.
                </span>
              )
            }
          })()}
      </p>
    )
  }
  if (error) {
    return (
      <p>
        Failed to load response from Gemini:
        <span className="break-all block">{error}</span>
      </p>
    )
  }

  return <p className="text-[#b6b8ba] animate-pulse">Waiting for Gemini...</p>
}

export default memo(ChatGPTQuery)
