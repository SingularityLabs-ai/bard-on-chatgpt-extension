import { useState } from 'react'
// import { useEffect, useState } from 'preact/hooks'
import useSWRImmutable from 'swr/immutable'
import { fetchPromotion } from '../api'
import { TriggerMode } from '../config'
import ChatGPTCard from './ChatGPTCard'
import { QueryStatus } from './ChatGPTQuery'

interface Props {
  question: string
  questionMeta: any
  promptSource: string
  triggerMode: TriggerMode
}

// const [gprops, setGprops] = useState<Props>()

function ChatGPTContainer(props: Props) {
  const [queryStatus, setQueryStatus] = useState<QueryStatus>()
  const query = useSWRImmutable(
    queryStatus === 'success' ? 'promotion' : undefined,
    fetchPromotion,
    { shouldRetryOnError: false },
  )

  // useEffect(() => {
  //   console.log("props changed from chile at ChatGPTContainer:", props);
  // }, [props])

  console.log('props at ChatGPTContainer:', props)
  return (
    <>
      <div className="chat-gpt-card">
        <ChatGPTCard
          question={props.question}
          questionMeta={props.questionMeta}
          promptSource={props.promptSource}
          triggerMode={props.triggerMode}
          onStatusChange={setQueryStatus}
        />
      </div>
    </>
  )
}

export default ChatGPTContainer
// export { setGprops };

// export { default ChatGPTContainer, setGprops };
