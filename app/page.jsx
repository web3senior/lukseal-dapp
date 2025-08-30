'use client'

import { useState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { initContract, getEmoji, getReactionCounter } from '@/util/communication'
import { toast } from 'react-hot-toast'
import Sparkles from '@/components/Sparkles'
import LastGift from '@/components/LastGift'
import Web3 from 'web3'
import ABI from '@/abi/LukSeals.json'
import logoLukso from './../public/logo/lukso.svg'
import fishIcon from './../public/fish-icon.svg'
import defaultSeal from './../public/default-seal.png'
import { useUpProvider } from '@/contexts/UpProvider'
import styles from './Page.module.scss'

export default function Page() {
  const [emoji, setEmoji] = useState([])
  const [reactionCounter, setReactionCounter] = useState(0)
  const [selectedEmoji, setSelectedEmoji] = useState()
  const { web3, contract } = initContract()
  const giftModal = useRef()
  const giftModalSendButton = useRef()
  const giftModalCancelButton = useRef()
  const giftModalMessage = useRef()
  const auth = useUpProvider()

  /**
   * Close the gift modal
   */
  const giftModalClose = (action) => {
    // Check if user canceled gifting
    if (action === 'cancel') {
      giftModal.current.close()
      selectedEmoji.e.innerText = `Gift`
      return
    }

    const t = toast.loading(`Waiting for transaction's confirmation`)
    console.log(giftModalMessage.current.value)
    const message = giftModalMessage.current.value

    try {
      // window.lukso.request({ method: 'eth_requestAccounts' }).then((accounts) => {})
      const web3 = new Web3(auth.provider)

      // Create a Contract instance
      const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
      contract.methods
        .react(auth.contextAccounts[0], selectedEmoji.item.emojiId, web3.utils.toHex(message))
        .send({
          from: auth.accounts[0],
          value: selectedEmoji.item.price,
        })
        .then((res) => {
          console.log(res)

          toast.success(`Done`)
          toast.dismiss(t)

          party.confetti(document.body, {
            count: party.variation.range(20, 40),
          })
        })
        .catch((error) => {
          toast.dismiss(t)
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  const openModal = (e, item) => {
    e.target.innerText = `Sending...`
    setSelectedEmoji({ e: e.target, item: item, message: null })
    giftModal.current.showModal()
  }

  useEffect(() => {
    // getEmoji().then(res => {
    //   if (Array.isArray(res)) {
    //     res.push({
    //       emojiId: `0x0`,
    //       name: `Your brand here`,
    //       emoji: `📣`,
    //       price: web3.utils.toWei(100, `ether`),
    //       ad: true
    //     })
    //     setEmoji(res)
    //   }
    // })
    //getReactionCounter().then(counter => setReactionCounter(counter))
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn d-f-c flex-column`}>
      <div className={`${styles.grid} d-f-c`}>
        <img alt={`fish icon`} src={fishIcon.src} />
        <b>$VFISH</b>
        <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M3.85576 6.19377C4.22883 5.80649 4.22883 5.19351 3.85576 4.80623L1.03731 1.88045C0.796111 1.63006 0.79611 1.23375 1.03731 0.983359C1.29161 0.719379 1.71427 0.719379 1.96857 0.983359L5.65119 4.80623C6.02427 5.19351 6.02426 5.80649 5.65119 6.19377L1.96857 10.0166C1.71427 10.2806 1.29161 10.2806 1.03731 10.0166C0.79611 9.76625 0.79611 9.36994 1.03731 9.11955L3.85576 6.19377Z"
            fill="black"
          />
        </svg>
      </div>

      <h1>1,500</h1>
      <span className={`${styles.lvl} d-f-c`}>LVL 0</span>

      <img src={defaultSeal.src} />

      {emoji &&
        emoji.length > 0 &&
        emoji.map((item, i) => {
          return (
            <div key={i} data-name={item.name} className={`${styles.emoji} d-flex flex-column align-items-center justify-content-between`}>
              <figure className={`${styles.emoji__icon}`}>
                <Image className={`animate__animated animate__heartBeat`} src={`/emoji/${item.emoji}.svg`} alt={`${process.env.NEXT_PUBLIC_NAME}`} width={64} height={64} title={item.name} />
              </figure>
              <div className={`w-100 d-flex flex-column grid--gap-050`}>
                <div className={`d-flex flex-row align-items-center justify-content-center grid--gap-025`}>
                  <span className={`${styles.price} rounded`}>{web3.utils.fromWei(item.price, `ether`)}</span>

                  <div className={`${styles.priceIcon} d-flex align-items-center rounded`}>
                    <img alt={`L`} src={logoLukso.src} />
                    <code>LYX</code>
                  </div>
                </div>
                {!item?.ad && (
                  <button className={`rounded`} onClick={(e) => openModal(e, item)}>
                    Gift
                  </button>
                )}
                {item?.ad && (
                  <Link className={`rounded text-center`} href={`https://forms.gle/7CUviC2x4bXm5evG8`} target={`_blank`}>
                    Apply Now
                  </Link>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
