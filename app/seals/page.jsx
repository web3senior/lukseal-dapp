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
import { useUpProvider } from '@/contexts/UpProvider'
import styles from './page.module.scss'

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

  return <div className={`${styles.page} ms-motion-slideDownIn`}>{auth.walletConnected && <Seals />}</div>
}

const Seals = () => {
  const [token, setToken] = useState([])
  const [tokenDetail, setTokenDetail] = useState()
  const [activeToken, setActiveToken] = useState(0) ///TODO: later I will retrieve this from the local storage
  const [lastTap, setLastTap] = useState(0)
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
      <div className={`grid grid--fill grid--gap-1 `} style={{ '--data-width': `200px` }}>
        {!tokenDetail &&
          token &&
          token.length > 0 &&
          token.map((item, i) => (
            <div key={i} className="d-flex flex-wrap align-items-center justify-content-center gap-1 mt-40">
              <div className={`${styles.token} d-f-c flex-column ms-depth-16`} onClick={() => setTokenDetail(item.tokenId)}>
                <ul className={`${styles.tokenId}`}>
                  <li>ID: #{web3.utils.toNumber(item.tokenId)}</li>
                  <li>VFISH: {web3.utils.toNumber(item.levelData.xp)}</li>
                  <li>LVL: {web3.utils.toNumber(item.levelData.level)}</li>
                </ul>
                <img className={`${styles.seal}`} crossOrigin={`anonymous`} src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${item.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />
                <div className={`${styles.token__body} w-100`}></div>
              </div>
            </div>
          ))}
      </div>
      {tokenDetail &&
        token &&
        token.length > 0 &&
        token
          .filter((filterItem) => filterItem.tokenId === tokenDetail)
          .map((item, i) => (
            <div key={i} className={`${styles.tokenDetail} ms-depth-16 d-f-c flex-column`}>
              <button className={`${styles.close}`} onClick={() => setTokenDetail(null)}>
                Back
              </button>
              <h2>Seal #{web3.utils.toNumber(item.tokenId)}</h2>
              <img className={`${styles.pfp}`} crossOrigin={`anonymous`} src={`${process.env.NEXT_PUBLIC_IPFS_GATEWAY}${item.LSP4Metadata.images[0][0].url.replace('ipfs://', '').replace('://', '')}`} />

              <ul className={`w-100 ${styles.traits}`}>
                <li>ID: #{web3.utils.toNumber(item.tokenId)}</li>
                <li>VFISH: {web3.utils.toNumber(item.levelData.xp)}</li>
                {/* <li>LVL: {web3.utils.toNumber(item.levelData.level)}</li> */}
                <li>Last Tap: {lastTap > 0 ? moment.unix(lastTap).fromNow() : `Never`}</li>
                {item.LSP4Metadata.attributes &&
                  item.LSP4Metadata.attributes.length > 0 &&
                  item.LSP4Metadata.attributes.map((attr, idx) => (
                    <li key={idx}>
                      {attr.key}: <b>{attr.value}</b>
                    </li>
                  ))}
                <li>Rarity: -%</li>
              </ul>

              <div className="d-flex flex-wrap align-items-center justify-content-centerS mt-20">
                <button className={`btn ms-button ms-button--primary`} onClick={() => tapIt(item.tokenId)}>
                  Tap it!
                </button>
                <button className={`btn ms-button ms-button--primary`} onClick={() => tapIt(item.tokenId)}>
                  Level Up
                </button>
                <button className={`btn ms-button ms-button--primary`} onClick={() => tapIt(item.tokenId)}>
                  Level Down!
                </button>
              </div>
            </div>
          ))}
    </>
  )
}
