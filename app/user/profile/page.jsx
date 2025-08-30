'use client'

import { useEffect, useState, Suspense, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Icon from '../../../helper/MaterialIcon'
import Nav from './../nav'
import DefaultPFP from '@/public/default-pfp.svg'
import { useUpProvider } from '@/contexts/UpProvider'
import { getProfile, updateProfile } from '../../../util/api'
import { initContract, getEmoji, getAllReacted } from '@/util/communication'  
import styles from './page.module.scss'
import { toast } from '@/components/Toaster'
// import { getCategory, getFood } from '../util/api'

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState()
  const auth = useUpProvider()
const { web3, contract } = initContract()
  const handleForm = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.target)
    const fullname = formData.get('fullname')
    const phone = formData.get('phone')
    const address = formData.get('address')
    const wallet = formData.get('wallet')
    const errors = {}

    const post = {
      fullname: fullname,
      phone: phone,
      address: address,
      wallet: wallet,
    }

    updateProfile(post).then((res) => {
      console.log(res)
      toast(`${res.message}`, 'success')
    })
  }

  useEffect(() => {
    console.log(auth)
   getAllReacted().then(res =>{
    console.log(res)
    setData(res)
   })
  }, [])

  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container w-100`} data-width={`medium`}>
        <Profile addr={auth.contextAccounts[0]} />
          <div className={`${styles.grid} grid grid--fit gap-1 w-100 mt-20`} style={{ '--data-width': `110px` }}>
          <div className={`card`}>
            <div className={`card__body d-flex justify-content-between`}>
              Emoji sent   
                   <small className={`text-primary`}>
                    {data && data.filter(item => item.returnValues.from.toLowerCase() === auth.contextAccounts[0].toLowerCase()).length}
                   </small>
            </div>

          </div>

          <div className={`card`}>
            <div className={`card__body d-flex justify-content-between`}>
              Emoji received 

              <small className={`text-primary`}>
                {data && data.filter(item => item.returnValues.to.toLowerCase() === auth.contextAccounts[0].toLowerCase()).length}
              </small>
            </div>

          </div>
        </div>


      </div>
    </div>
  )
}
/**
 * Profile
 * @param {String} addr
 * @returns
 */
const Profile = ({ addr }) => {
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
    <div className='d-f-c  flex-column mt-10'>
      <figure className={`${styles.pfp} d-f-c flex-column grid--gap-050`}>
        <img
          alt={data.data.search_profiles[0].fullName}
          src={`${data.data.search_profiles[0].profileImages.length > 0 ? data.data.search_profiles[0].profileImages[0].src : 'https://ipfs.io/ipfs/bafkreiatl2iuudjiq354ic567bxd7jzhrixf5fh5e6x6uhdvl7xfrwxwzm'}`}
          className={`rounded`}
        />
        <figcaption>@{data.data.search_profiles[0].name}</figcaption>
      </figure>
      <p>@{data.data.search_profiles[0].description}</p>
    </div>
  )
}
