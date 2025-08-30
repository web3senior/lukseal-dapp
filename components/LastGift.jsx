'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Web3 from 'web3'
import Icon from '../helper/MaterialIcon'
import DefaultPFP from './../public/default-pfp.svg'
import Shimmer from '../helper/Shimmer'
import { useUpProvider } from '@/contexts/UpProvider'
import toast, { Toaster } from 'react-hot-toast'
import { initContract, getEmoji, getLastGift } from '@/util/communication'
import styles from './LastGift.module.scss'

export default function GiftButton({ emojiId }) {
  const { web3, contract } = initContract()
  const [emoji, setEmoji] = useState([])
  const [events, setEvents] = useState([])

  useEffect(() => {
    getEmoji().then((res) => {
      console.log(res)
      if (res.length < 1) return
      setEmoji(res)
    })

    getLastGift().then(res => {
      console.log(res)
      setEvents(res)
    })
  }, [])
  return (
    <>
      {events && events.length > 0 && <div className={`${styles.lastGift} mt-40`}>
        <h3>Last gift</h3>
        <div className={`card`}>
          <div className={`card__body`}>
            <div className={`d-flex flex-row align-items-center justify-content-between`}>
              <figure className={``}>
                Emoji:
                <img alt={`♥`} src={`./emoji/${emoji.filter(filterItem => filterItem.emojiId === events[events.length - 1].returnValues.emojiId)[0].emoji}.svg`} />
              </figure>
              <div>
                From:
                <Profile addr={events[events.length - 1].returnValues.from} />
              </div>
              <div>
                To:
                <Profile addr={events[events.length - 1].returnValues.to} />
              </div>
            </div>
          </div>
        </div>
      </div>}
    </>
  )
}

/**
 * Profile
 * @param {String} addr
 * @returns
 */
const Profile = ({ addr }) => {
  console.log(addr)
  const [data, setData] = useState()

  const getProfile = async (addr) => {
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', `application/json`)
    myHeaders.append('Accept', `application/json`)

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        query: `query MyQuery {
  search_profiles(
    args: {search: "${addr}"}
    limit: 1
  ) {
    fullName
    name
    description
    id
    profileImages {
      src
    }
  }
}`,
      }),
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}`, requestOptions)
    if (!response.ok) {
      throw new Response('Failed to ', { status: 500 })
    }
    const data = await response.json()
    setData(data)
    return data
  }

  useEffect(() => {
    getProfile(addr).then(console.log)
  }, [])

  if (!data)
    return (
      <figure className={`${styles.pfp} d-f-c flex-column grid--gap-050`}>
        <img alt={`Default PFP`} src={DefaultPFP.src} className={`rounded`} />
      </figure>
    )

  return (
    <figure className={`${styles.pfp} d-f-c flex-column grid--gap-050`}>
      <img
        alt={data.data.search_profiles[0].fullName}
        src={`${data.data.search_profiles[0].profileImages.length > 0 ? data.data.search_profiles[0].profileImages[0].src : 'https://ipfs.io/ipfs/bafkreiatl2iuudjiq354ic567bxd7jzhrixf5fh5e6x6uhdvl7xfrwxwzm'}`}
        className={`rounded`}
      />
      <figcaption>{data.data.search_profiles[0].name}</figcaption>
    </figure>
  )
}
