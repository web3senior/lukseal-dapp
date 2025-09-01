'use client'

import { useState, useEffect, useId, useRef } from 'react'
import Link from 'next/link'
import moment from 'moment'
import Image from 'next/image'
import { initContract, getEmoji, getReactionCounter } from '@/util/communication'
import { toast } from 'react-hot-toast'
import Sparkles from '@/components/Sparkles'
import LastGift from '@/components/LastGift'
import Web3 from 'web3'
import ABI from '@/abi/LukSeals.json'
import ABILSP7 from '@/abi/lsp7.json'
import logoLukso from './../public/logo/lukso.svg'
import fishIcon from './../public/fish-icon.svg'
import defaultSeal from './../public/default-seal.png'
import { useUpProvider } from '@/contexts/UpProvider'
import styles from './Page.module.scss'

export default function Page() {
  const auth = useUpProvider()
  const { contract: contractReadOnly } = initContract()

  const web3 = new Web3(auth.provider)
  const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
  const contractFish = new web3.eth.Contract(ABILSP7, process.env.NEXT_PUBLIC_CONTRACT_FISH)
  const _ = web3.utils

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
      <div className={`${styles.grid} d-f-c gap-050`}>
        <img alt={`fish icon`} src={fishIcon.src} />
        <div className="d-flex align-items-center gap-025">
          <b>$VFISH</b>
          <svg width="6" height="11" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3.85576 6.19377C4.22883 5.80649 4.22883 5.19351 3.85576 4.80623L1.03731 1.88045C0.796111 1.63006 0.79611 1.23375 1.03731 0.983359C1.29161 0.719379 1.71427 0.719379 1.96857 0.983359L5.65119 4.80623C6.02427 5.19351 6.02426 5.80649 5.65119 6.19377L1.96857 10.0166C1.71427 10.2806 1.29161 10.2806 1.03731 10.0166C0.79611 9.76625 0.79611 9.36994 1.03731 9.11955L3.85576 6.19377Z"
              fill="black"
            />
          </svg>
        </div>
      </div>

      {auth.walletConnected && <Seals />}
    </div>
  )
}

const Seals = () => {
  const [token, setToken] = useState([])

  const [activeToken, setActiveToken] = useState(0) ///TODO: later I will retrieve this from the local storage
  const [lastTap, setLastTap] = useState(0)

  const [tooltip, setTooltip] = useState([
    'A little bit of me is now yours.',
    "I've been minted just for you.",
    'Feeling unique, might get collected later.',
    "They say I'm one-of-a-kind.",
    'My digital soul is yours.',
    'The chain says I belong to you.',
    "I'm a seal of approval, literally.",
    "Look at me, I'm a rare one!",
    "I'm not just a pretty face, you know.",
    'The blockchain is my home.',
    'Wanna see my proof of work?',
    "I'm a non-fungible friend.",
    'You own me, how cool is that?',
    'My code is my story.',
    "I'm more than just pixels.",
    "I'm feeling very authentic today.",
    "I'm a digital original, no copies.",
    "You're my keeper now.",
    'My existence is verified.',
    "I'm the real deal, on-chain.",
    "Let's go make some history.",
    "I'm happy to be your asset.",
    "I'm a work of art and tech.",
    "I'm a token of my word.",
    'My rarity is my charm.',
    "I'm sealed with a digital kiss.",
    'Just me and the blockchain.',
    "I'm a collectible soul.",
    'My value is in my uniqueness.',
    "I'm the key to my own art.",
    'The seal of ownership is here.',
    "I'm a token of my love for you.",
    "I'm a digital whisper.",
    "I'm the only one like me.",
    "I'm a verifiable friend.",
    "I'm not for sharing, just for owning.",
    "I'm a rare find.",
    'Let me tell you my story.',
    "I'm the original.",
    'My purpose is to be unique.',
    "I'm a seal of authenticity.",
    "I'm a digital treasure.",
    "I'm yours and only yours.",
    'My code is my personality.',
    "I'm a testament to uniqueness.",
    'The blockchain made me this way.',
    'My home is your wallet.',
    "I'm a digital native.",
    "I'm a token of your trust.",
    "I'm a unique piece of me.",
    'My existence is permanent.',
    "I'm a seal of ownership.",
    "I'm not going anywhere.",
    "I'm a unique little guy.",
    "I'm here to stay.",
    "I'm a piece of the future.",
    "I'm a digital promise.",
    "I'm a collectible icon.",
    "I'm a token of rarity.",
    'My value is in being me.',
    "I'm a digital friend.",
    'My rarity is my charm.',
    "I'm a piece of the digital world.",
    "I'm a unique companion.",
    "I'm a seal of approval.",
    "I'm a digital whisper.",
    'My story is on the chain.',
    "I'm a piece of art.",
    "I'm a unique gem.",
    "I'm a digital heirloom.",
    'My existence is verified.',
    "I'm a verifiable asset.",
    "I'm a token of your choice.",
    "I'm a unique soul.",
    "I'm a digital collectible.",
    "I'm a seal of friendship.",
    'My home is the blockchain.',
    "I'm a token of your love.",
    "I'm a digital memory.",
    "I'm a unique creation.",
    "I'm a seal of trust.",
    'My value is in my being.',
    "I'm a digital companion.",
    "I'm a unique treasure.",
    "I'm a token of authenticity.",
    'My story is in my code.',
    "I'm a digital signature.",
    "I'm a seal of uniqueness.",
    "I'm a digital promise.",
    'My rarity is my essence.',
    "I'm a token of ownership.",
    "I'm a digital asset.",
    'My existence is unique.',
    "I'm a seal of rarity.",
    "I'm a digital heirloom.",
    'My value is in my history.',
    "I'm a token of your journey.",
    "I'm a digital friend.",
    'My story is mine alone.',
    "I'm a unique piece of art.",
  ])
  const auth = useUpProvider()
  const { contract: contractReadOnly } = initContract()

  const web3 = new Web3(auth.provider)
  const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
  const contractFish = new web3.eth.Contract(ABILSP7, process.env.NEXT_PUBLIC_CONTRACT_FISH)
  const _ = web3.utils

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }
  const getLevel = async (tokenId) => {
    const levelData = await contractReadOnly.methods.level(tokenId).call()
    console.log(levelData)
    return levelData
  }

  const getDataForTokenId = async (tokenId) => await contractReadOnly.methods.getDataForTokenId(`${tokenId}`, '0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e').call()

  const tapIt = async (tokenId) => {
    const t = toast.loading(`Waiting for transaction's confirmation`)

    try {
      contract.methods
        .tapIt(tokenId)
        .send({
          from: auth.accounts[0],
        })
        .then((res) => {
          console.log(res)
          toast.success(`Done`)
          toast.dismiss(t)
        })
        .catch((error) => {
          console.log(error)
          toast.dismiss(t)
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  const getTokenList = async (e) => {
    console.log(auth.accounts[0])
    try {
      const tokenIds = await contractReadOnly.methods.tokenIdsOf(auth.accounts[0]).call()

      /*tokenIds.map((item) => {

        getDataForTokenId(item).then((data) => {
          data = web3.utils.hexToUtf8(data)
          //  console.log(data)
          data = data.search(`data:application/json;`) > -1 ? data.slice(data.search(`data:application/json;`), data.length) : `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}` + data.slice(data.search(`ipfs://`), data.length).replace(`ipfs://`, '')
          console.log(data)
          fetchData(data).then((dataContent) => {
            // console.log(dataContent)
            dataContent.tokenId = item
            //setToken((oldValue) => oldValue.concat(dataContent))
          })
        })
      })*/

      let seals = []
      await Promise.all(
        tokenIds.map(async (item, i) => {
          let levelData = await getLevel(item)
          let data = await getDataForTokenId(item)
          data = web3.utils.hexToUtf8(data)
          data = data.search(`data:application/json;`) > -1 ? data.slice(data.search(`data:application/json;`), data.length) : `${process.env.NEXT_PUBLIC_IPFS_GATEWAY}` + data.slice(data.search(`ipfs://`), data.length).replace(`ipfs://`, '')
          console.log(data)
          return fetchData(data).then((dataContent) => {
            console.log(dataContent.LSP4Metadata)
            console.log(item)
            dataContent.tokenId = item
            dataContent.levelData = levelData
            seals.push(dataContent)
          })
        })
      )
      seals = seals.sort((a, b) => web3.utils.toNumber(a.tokenId) - web3.utils.toNumber(b.tokenId))
      console.log(seals)
      setToken(seals)
    } catch (error) {
      console.error('Error fetching contract data with Web3.js:', error)
      return { error }
    }
  }

  const getLastTap = async (addr) => await contract.methods.lastTap(addr).call()

  useEffect(() => {
    getTokenList()

    getLastTap(auth.accounts[0]).then((res) => {
      console.log(res)
      setLastTap(web3.utils.toNumber(res))
    })
  }, [])
  return (
    <>
      <div className={`d-f-c`}>
        {token && token.length > 0 && (
          <div className={`d-flex flex-column align-items-center`}>
            <h1>{web3.utils.toNumber(token[activeToken].levelData.xp)}</h1>
            <small className={`${styles.lvl} d-f-c`}>LVL {web3.utils.toNumber(token[activeToken].levelData.level)}</small>

            <div className="d-flex flex-wrap align-items-center justify-content-center gap-1 mt-40">
              <span
                className={`${styles.btnArrow}`}
                onClick={() => {
                  if (activeToken > 0) setActiveToken(activeToken - 1)
                }}
              >
                <svg width="13" height="20" viewBox="0 0 13 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.6723 20L12.4473 18.225L4.22227 10L12.4473 1.775L10.6723 0L0.672265 10L10.6723 20Z" fill="#1F1F1F" />
                </svg>
              </span>

              <div className={`${styles.token} d-f-c flex-column ms-depth-16`} onClick={() => tapIt(token[activeToken].tokenId)}>
                <span className={`${styles.tokenId}`}>#{web3.utils.toNumber(token[activeToken].tokenId)}</span>
                <div className={`${styles.bub}`}>
                  <div className={`${styles.tail}`}></div>
                  <div className="text--gray"> {tooltip[(Math.random() * tooltip.length) | 0]}</div>
                </div>

                <img className={`${styles.pfp}`} crossOrigin={`anonymous`} src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${token[activeToken].LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                <div className={`${styles.token__body} w-100`}></div>
              </div>

              <span
                className={`${styles.btnArrow}`}
                onClick={() => {
                  if (activeToken < token.length - 1) setActiveToken(activeToken + 1)
                }}
              >
                <svg width="13" height="20" viewBox="0 0 13 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.72227 20L0.947266 18.225L9.17227 10L0.947266 1.775L2.72227 0L12.7223 10L2.72227 20Z" fill="#1F1F1F" />
                </svg>
              </span>
            </div>

            <small className={`mt-20`}>Next tap: {lastTap === 0 ? `Now` : moment.unix(lastTap).add(24, 'hours').utc().fromNow()}</small>
          </div>
        )}
      </div>
    </>
  )
}
