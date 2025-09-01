'use client'

import Link from 'next/link'
import Image from 'next/image'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useFormStatus } from 'react-dom'
import ABI from '@/abi/LukSeals.json'
import ABILSP7 from '@/abi/lsp7.json'
import LukSealsRarity from '@/public/lukseals-collection/LuksealsTraits3.json'
import Web3 from 'web3'
import { initContract, getEmoji, getReaction } from '@/util/communication'
import moment from 'moment-timezone'
import { useUpProvider } from '@/contexts/UpProvider'
import { PinataSDK } from 'pinata'
import styles from './page.module.scss'

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_API_KEY,
  pinataGateway: 'https://gateway.pinata.cloud/ipfs/',
})

const GATEWAY = `https://ipfs.io/ipfs/`
const CID = `bafybeihqjtxnlkqwykthnj7idx6ytivmyttjcm4ckuljlkkauh6nm3lzve`
const BASE_URL = `./lukseals-collection/level1/` //`http://localhost/luxgenerator/src/assets/pepito-pfp/` //`${GATEWAY}${CID}/` // Or //`${GATEWAY}${CID}/` //
const BASE_URL_VIP = `./lukseals-collection/vip/` //`http://localhost/luxgenerator/src/assets/pepito-pfp/` //`${GATEWAY}${CID}/` // Or //`${GATEWAY}${CID}/` //

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState()
  const [maxSupply, setMaxSupply] = useState()
  const [supplyCap, setSupplyCap] = useState()
  const [tokenIdCounter, setTokenIdCounter] = useState()
  const [PPT, setPPT] = useState()
  const [version, setVersion] = useState()
  const [activePhase, setActivePhase] = useState()
  const [phases, setPhases] = useState()
  const [FISH, setFISH] = useState()
  const [MEMBER_CARD, setMEMBER_CARD] = useState()
  const [RICH, setRICH] = useState()
  const [FISHCAN, setFISHCAN] = useState()
  const [ARATTALABS, setARATTALABS] = useState()
  const [LUKSEALS, setLUKSEALS] = useState()
  const [MADSKI, setMADSKI] = useState()
  const [DACHRIZ, setDACHRIZ] = useState()
  const [ARFI, setARFI] = useState()
  const [FOLLOWING, setFOLLOWING] = useState()
  const [levelPrice, setLevelPrice] = useState()
  const [LYXBalance, setLYXBalance] = useState()
  const [fishBalance, setFishBalance] = useState()
  const [selectedPhase, setSelectedPhase] = useState()
  const [walletBalance, setWalletBalance] = useState(0)
  const [walletFishBalance, setWalletFishBalance] = useState(0)
  const [LYX, setLYX] = useState(0)
  const [level, setlevel] = useState()
  const auth = useUpProvider()
  const { readOnlyContract } = initContract()

  const web3 = new Web3(auth.provider)
  const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
  const contractFish = new web3.eth.Contract(ABILSP7, process.env.NEXT_PUBLIC_CONTRACT_FISH)
  const _ = web3.utils

  // VIP config
  const [randomType, setRandomType] = useState('') // Common or Vip
  const [mintedVIP, setMintedVIP] = useState([]) //will store in contract: Array()

  const SVG = useRef()

  // Traits ref
  const backgroundGroupRef = useRef()
  const bodycolorGroupRef = useRef()
  const expressionGroupRef = useRef()
  const bodyGroupRef = useRef()
  const headGroupRef = useRef()
  const extraGroupRef = useRef()

  //VIP
  const vipRef = useRef()

  const weightedRandom = (items) => {
    console.log(items)
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0)
    const randomNum = Math.random() * totalWeight

    let weightSum = 0
    for (const item of items) {
      weightSum += item.weight
      if (randomNum <= weightSum) {
        console.log(item.name)
        return item.name
      }
    }
  }

  const generate = async (trait, arg) => {
    const svgns = 'http://www.w3.org/2000/svg'
    const gRef = document.createElementNS(svgns, 'g')

    // check activePhase, if it's phase 1 & 2, let's handle rareBackground
    console.log(`%c ${trait}`, 'font-size:28px;color:gold')
    if (trait === 'background' && (activePhase === 1 || activePhase === 2)) {
      trait = 'rareBackground'
    }

    // Clear the board
    // SVG.current.innerHTML = ''
    const Metadata = LukSealsRarity
    let randomTrait = weightedRandom(Metadata[`${trait}`])

    console.log('============================', randomTrait)
    // Detect body and prevent loading head on body for lukseal collection
    if (trait === 'head') {
      console.log('■■■■■■■■■■■■■■■■■■', arg)
      const filterBody = ['Dino', 'DinoGreen', 'DinoOrange', 'Inuit']
      const foundHead = filterBody.find((item) => arg === item)
      console.log('============================', foundHead || `notFound`)
      if (foundHead !== undefined) randomTrait = 'None'
    }
    console.log(`${BASE_URL}${trait}/${randomTrait}.png`)

    let response = await fetch(`${BASE_URL}${trait}/${randomTrait}.png`, { mode: 'no-cors' })
    let blob = await response.blob()
    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result

      const image = document.createElementNS(svgns, 'image')
      image.setAttribute('href', base64data)
      image.setAttribute('width', 400)
      image.setAttribute('height', 400)
      image.setAttribute('x', 0)
      image.setAttribute('y', 0)
      // image.setAttribute('trait', randomTrait)
      // image.setAttribute('id', `image${trait}`)
      // image.addEventListener('load', () => console.log(`${trait} has been loaded`))

      // Add to the group
      switch (trait) {
        case `background`:
        case 'rareBackground':
          gRef.appendChild(image)
          // backgroundGroupRef.current.innerHTML = ''
          // backgroundGroupRef.current.appendChild(image)
          break
        case `bodycolor`:
          gRef.appendChild(image)
          // bodycolorGroupRef.current.innerHTML = ''
          // bodycolorGroupRef.current.appendChild(image)
          break
        case `expression`:
          gRef.appendChild(image)
          // expressionGroupRef.current.innerHTML = ''
          // expressionGroupRef.current.appendChild(image)
          break
        case `body`:
          gRef.appendChild(image)
          // bodyGroupRef.current.innerHTML = ''
          // bodyGroupRef.current.appendChild(image)
          break
        case `head`:
          gRef.appendChild(image)
          // headGroupRef.current.innerHTML = ''
          // headGroupRef.current.appendChild(image)
          break
        case `extra`:
          gRef.appendChild(image)
          // extraGroupRef.current.innerHTML = ''
          // extraGroupRef.current.appendChild(image)
          break
        default:
          break
      }
    }

    await sleep(1000)
    return [randomTrait, gRef]
  }
  const generateVIP = async (character, level = 1) => {
    const svgns = 'http://www.w3.org/2000/svg'

    await fetch(`${BASE_URL_VIP}${character}/${level}.png`)
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader()
        reader.readAsDataURL(blob)
        reader.onloadend = () => {
          const base64data = reader.result
          const image = document.createElementNS(svgns, 'image')
          image.setAttribute('href', base64data)
          image.setAttribute('width', 400)
          image.setAttribute('height', 400)
          image.setAttribute('x', 0)
          image.setAttribute('y', 0)
          image.setAttribute('trait', character)
          image.setAttribute('id', `image${character}`)
          image.addEventListener('load', () => console.log(`${character} has been loaded`))

          vipRef.current.innerHTML = ''
          vipRef.current.appendChild(image)
        }
      })

    return character
  }
  const upload = async (htmlStr) => {
    console.log(pinata)
    // const htmlStr = document.querySelector(`.${styles['board']} svg`).outerHTML
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    try {
      const t = toast.loading(`Uploading`)
      const file = new File([blob], 'LukSeals.svg', { type: blob.type })
      const upload = await pinata.upload.file(file)
      // console.log(upload)
      toast.dismiss(t)
      console.log()
      return [upload.IpfsHash, url]
    } catch (error) {
      console.log(error)
    }
  }

  const uploadJSON = async (jsonData) => {
    try {
      const t = toast.loading(`Uploading`)
      const upload = await pinata.upload.json(jsonData)
      console.log(upload)
      toast.dismiss(t)
      console.log()
      return upload.IpfsHash
    } catch (error) {
      console.log(error)
    }
  }

  const rAsset = async (url) => {
    const assetBuffer = await fetch(`${url}`, { mode: 'no-cors' }).then(async (response) => {
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    })

    return assetBuffer
  }

  const fetchData = async (dataURL) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
      mode: 'no-cors' 
    }
    const response = await fetch(`${dataURL}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const metadataVerifiableURL = async (json, CID) => {
   
      const verfiableUriIdentifier = '0x0000'
      const verificationMethod = web3.utils.keccak256('keccak256(utf8)').substr(0, 10)
      const verificationData = web3.utils.keccak256(JSON.stringify(json)) // json or res
      //console.log(verificationData)
      //return
      const verificationDataLength = web3.utils.padLeft(web3.utils.numberToHex(verificationData.substring(2).length / 2), 4)
      const url = web3.utils.utf8ToHex(`ipfs://${CID}`)
      const VerfiableURI = verfiableUriIdentifier + verificationMethod.substring(2) + verificationDataLength.substring(2) + verificationData.substring(2) + url.substring(2)
      console.log(`VerfiableURI => `, VerfiableURI)
      return VerfiableURI

  }

    const approve = async (e) => {

    const t = (e.target.innerText = `Waiting...`)

    return contractFish.methods
      .authorizeOperator(process.env.NEXT_PUBLIC_CONTRACT, web3.utils.toWei(100000,`ether`), '0x')
      .send({
        from: auth.accounts[0],
        value: 0,
      })
  .then((res) => {
          console.log(res)
        e.target.innerText = `Approve`
        toast.dismiss(t)
        // Fetch tokens
      })

    }

  const mint = async (e) => {
    e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
    const createToast = toast.loading(`Just a moment`)

    const randomType = weightedRandom([
      { name: 'Common', weight: 200 },
      { name: 'VIP', weight: 1 },
    ])

    let background, bodycolor, expression, body, head, extra

    // Set the random type, Common or VIP
    setRandomType(randomType)

    switch (randomType) {
      case `VIP`:
        // choose a random character among 6 nfts
        const randomCharacter = weightedRandom([
          { name: 'batman', weight: 100 },
          { name: 'fire', weight: 100 },
          { name: 'shrek', weight: 100 },
          { name: 'sky', weight: 100 },
          { name: 'spiderman', weight: 100 },
          { name: 'wild', weight: 100 },
        ])
        generateVIP(randomCharacter, 1) // character & level: start 1

        // Add it to the artboard
        document.querySelector(`#result`).innerHTML = `VIP: ${randomCharacter}`

        break
      case `Common`:
        background = await generate(`background`, '')
        bodycolor = await generate(`bodycolor`, '')
        expression = await generate(`expression`, '')
        body = await generate(`body`, '')
        head = await generate(`head`, body[0]) // The 2nd arg sends body to check the condition, if body === x then y
        extra = await generate(`extra`, '')

        // Add it to the artboard
        // document.querySelector(`#result`).innerHTML = `Background: ${background}  | bodycolor: ${bodycolor} |  expression: ${expression}  | body: ${body}  | head: ${head}  | extra: ${extra}`
        break
      default:
        break
    }

    console.log(background, bodycolor, expression, body, head, extra)

    // Create the SVG
    const svgns = 'http://www.w3.org/2000/svg'

    let svg = document.createElementNS(svgns, 'svg')
    svg.setAttribute('viewbox', '0 0 400 400')
    svg.setAttribute('xmlns', svgns)
    svg.setAttribute('width', '400px')
    svg.setAttribute('height', '400px')

    svg.appendChild(background[1])
    svg.appendChild(bodycolor[1])
    svg.appendChild(expression[1])
    svg.appendChild(body[1])
    svg.appendChild(head[1])
    svg.appendChild(extra[1])

    // show in front-end
    // document.body.appendChild(svg)

    let attributes = []
    if (background[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Background', value: background[0].toUpperCase() })
    if (bodycolor[0].toUpperCase() !== `NONE`) attributes.push({ key: 'BodyColor', value: bodycolor[0].toUpperCase() })
    if (expression[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Expression', value: expression[0].toUpperCase() })
    if (body[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Body', value: body[0].toUpperCase() })
    if (head[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Head', value: head[0].toUpperCase() })
    if (extra[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Extra', value: extra[0].toUpperCase() })
    attributes.push({ key: 'Level', value: `0` })

    // console.log(svg.outerHTML)

    const uploadResult = await upload(svg.outerHTML)
    // console.log(`uploadResult => `, uploadResult)
    const verifiableUrl = await rAsset(uploadResult[1]) //uploadResult[1]

    toast.dismiss(createToast)
    const t = toast.loading(`Waiting for transaction's confirmation`)

    const metadata = {
      LSP4Metadata: {
        name: 'LukSeals',
        description: `A heartwarming, hand-drawn collectible experience on LUKSO. A collection to grow, collect, and play with.`,
        links: [
          { title: 'Mint', url: 'https://lukseals.club' },
          { title: '𝕏', url: 'https://x.com/LukSeals' },
        ],
        attributes: attributes,
        icon: [
          {
            width: 512,
            height: 512,
            url: 'ipfs://bafkreifji25o3zylrjn7u6zu6lq3vvdpjh7hitq3z32rdetbpjbc3wozsy',
            verification: {
              method: 'keccak256(bytes)',
              data: '0xc1a86d826180228955efcb8f588da2d4f1b677eeabbd4ce21e12ef34e33d4a1b',
            },
          },
        ],
        backgroundImage: [],
        assets: [],
        images: [
          [
            {
              width: 1000,
              height: 1000,
              url: `ipfs://${uploadResult[0]}`,
              verification: {
                method: 'keccak256(bytes)',
                data: _.keccak256(verifiableUrl),
              },
            },
          ],
        ],
      },
    }

    const uploadMetadataResult = await uploadJSON(metadata)
    console.log(uploadMetadataResult)
    const metadataVerified = await metadataVerifiableURL(metadata, uploadMetadataResult)
    console.log(`metadataVerified => `, metadataVerified)

    const activePhase = await contract.methods.activePhase().call()

    try {
      contract.methods
        .mintWithMetadata(activePhase, metadataVerified)
        .send({
          from: auth.accounts[0],
          //value: freeMintCount > 0 ? 0 : mintPrice,
        })
        .then((res) => {
          console.log(res)

          toast.success(`Done`)
          toast.dismiss(t)
          e.target.disabled = false

          // getTotalSupply().then((res) => {
          //   console.log(res)
          //   setTotalSupply(_.toNumber(res))
          // })

          // getMaxSupply().then((res) => {
          //   console.log(res)
          //   setMaxSupply(_.toNumber(res))
          // })
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

  // -----------------GET-----------------
  const getWalletBalance = async (wallet) => {
    const balance = await web3.eth.getBalance(wallet)
    return parseFloat(web3.utils.fromWei(balance, `ether`)).toFixed(2)
  }

  const getWalletFishBalance = async (wallet) => {
    const balance = await contractFish.methods.balanceOf(wallet).call()
    return parseFloat(web3.utils.fromWei(balance, `ether`)).toFixed(2)
  }

  const getLSP7Price = async (token) => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }

    const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/lukso/tokens/${token}`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const getLYXPrice = async () => {
    let requestOptions = {
      method: 'GET',
      redirect: 'follow',
    }

    const response = await fetch(`https://api.diadata.org/v1/assetQuotation/Lukso/0x0000000000000000000000000000000000000000`, requestOptions)
    if (!response.ok) throw new Response('Failed to get data', { status: 500 })
    return response.json()
  }

  const getLevel = async (e, tokenId) => {
    const levelData = await contract.methods.level(tokenId).call()
    console.log(levelData)
    setlevel(levelData)
  }

  const getIsInitialized = async () => await contract.methods.initialized().call()
  const getWhitelist = async (addr) => await contract.methods.getWhitelist(addr).call()
  const getMaxSupply = async () => await contract.methods.MAX_SUPPLY().call()
  const getSupplyCap = async () => await contract.methods.PHASE_ONE_TWO_SUPPLY_CAP().call()
  const getTokenIdCounter = async () => await contract.methods.tokenIdCounter().call()
  const getPPT = async () => await contract.methods.PPT().call()
  const getVersion = async () => await contract.methods.VERSION().call()

  const getActivePhase = async () => {
    const result = await contract.methods.activePhase().call()
    switch (result) {
      case web3.utils.keccak256('phase1'):
        return 'phase1'
      case web3.utils.keccak256('phase2'):
        return 'phase2'
      case web3.utils.keccak256('phase3'):
        return 'phase3'
      case web3.utils.keccak256('phase4'):
        return 'phase4'

      default:
        return 'Wrong Phase'
        break
    }
  }

  const getLevelPrice = async () => {
    const _ = web3.utils

    const lvl1 = _.toNumber(await contract.methods.levelPrice(1).call())
    const lvl2 = _.toNumber(await contract.methods.levelPrice(2).call())
    const lvl3 = _.toNumber(await contract.methods.levelPrice(3).call())
    const lvl4 = _.toNumber(await contract.methods.levelPrice(4).call())
    const lvl5 = _.toNumber(await contract.methods.levelPrice(5).call())
    const lvl6 = _.toNumber(await contract.methods.levelPrice(6).call())
    const lvl7 = _.toNumber(await contract.methods.levelPrice(7).call())
    const lvl8 = _.toNumber(await contract.methods.levelPrice(8).call())
    const lvl9 = _.toNumber(await contract.methods.levelPrice(9).call())
    const lvl10 = _.toNumber(await contract.methods.levelPrice(10).call())

    return [lvl1, lvl2, lvl3, lvl4, lvl5, lvl6, lvl7, lvl8, lvl9, lvl10]
  }

  const getPhase = async () => {
    const _ = web3.utils

    const ph1 = await contract.methods.phases(_.keccak256('phase1')).call()
    const ph2 = await contract.methods.phases(_.keccak256('phase2')).call()
    const ph3 = await contract.methods.phases(_.keccak256('phase3')).call()
    const ph4 = await contract.methods.phases(_.keccak256('phase4')).call()

    return [ph1, ph2, ph3, ph4]
  }

  const getFISH = async () => await contract.methods.FISH().call()
  const getMEMBER_CARD = async () => await contract.methods.MEMBER_CARD().call()
  const getRICH = async () => await contract.methods.RICH().call()
  const getFISHCAN = async () => await contract.methods.FISHCAN().call()
  const getARATTALABS = async () => await contract.methods.ARATTALABS().call()
  const getLUKSEALS = async () => await contract.methods.LUKSEALS().call()
  const getMADSKI = async () => await contract.methods.MADSKI().call()
  const getDACHRIZ = async () => await contract.methods.DACHRIZ().call()
  const getARFI = async () => await contract.methods.ARFI().call()
  const getFOLLOWING = async () => await contract.methods.FOLLOWING().call()
  const getFishBalance = async () => await contractFish.methods.balanceOf(process.env.NEXT_PUBLIC_CONTRACT).call()
  const getLYXBalance = async () => await web3.eth.getBalance(process.env.NEXT_PUBLIC_CONTRACT)

  useEffect(() => {
    getLYXPrice().then((res) => {
      console.log(parseFloat(res.Price))
      setLYX(parseFloat(res.Price))
    })

    getFishBalance().then((res) => {
      console.log(res)
      setFishBalance(web3.utils.fromWei(res, `ether`))
    })

    getLYXBalance().then((res) => {
      console.log(res)
      const balance = web3.utils.fromWei(res, `ether`)
      setLYXBalance(balance)
    })

    getMaxSupply().then((res) => {
      console.log(res)
      setMaxSupply(res)
    })

    getSupplyCap().then((res) => {
      console.log(res)
      setSupplyCap(res)
    })

    getTokenIdCounter().then((res) => {
      console.log(res)
      setTokenIdCounter(res)
    })

    getPPT().then((res) => {
      console.log(res)
      setPPT(res)
    })

    getVersion().then((res) => {
      console.log(res)
      setVersion(res)
    })

    getIsInitialized().then(setIsInitialized)
    getActivePhase().then(setActivePhase)
    getFISH().then(setFISH)
    getMEMBER_CARD().then(setMEMBER_CARD)
    getRICH().then(setRICH)
    getFISHCAN().then(setFISHCAN)
    getARATTALABS().then(setARATTALABS)
    getLUKSEALS().then(setLUKSEALS)
    getMADSKI().then(setMADSKI)
    getDACHRIZ().then(setDACHRIZ)
    getARFI().then(setARFI)
    getFOLLOWING().then(setFOLLOWING)

    getLevelPrice().then((res) => {
      console.log(res)
      setLevelPrice(res)
    })

    getPhase().then((res) => {
      console.log(res)
      setPhases(res)
    })
  }, [])
  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`xlarge`}>
        <button className="btn mt-10 mb-20 w-100" onClick={(e) => mint(e)}>
          Mint (in mint I will send the level0 metadata always) the real metadata will send on levelup and down
        </button>

                <button className="btn mt-10 mb-20 w-100" onClick={(e) => approve(e)}>
          Approve
        </button>

        {auth.walletConnected && (
          <>
            <p className={`d-flex align-items-center gap-025`}>
              <b>Wallet balance:</b>
              <WalletBalance />
              <small>LYX</small>
            </p>
            <p className={`d-flex align-items-center gap-025`}>
              <b>Wallet Fish balance:</b>
              <WalletFishBalance />
              <small>FISH</small>
            </p>
          </>
        )}

        <div className={`d-flex align-items-center gap-025`}>
          <b>Max Supply:</b>
          <small>{maxSupply && new Intl.NumberFormat().format(maxSupply)}</small>
        </div>

        <div className={`d-flex align-items-center gap-025`}>
          <b>Active Phase:</b>
          <small className="badge badge-dark">{(activePhase && activePhase !== `0x0000000000000000000000000000000000000000000000000000000000000000` && activePhase) || `-`}</small>
        </div>

        <ul>
          {phases &&
            phases.map((item, i) => (
              <li key={i} className={`d-flex flex-column`}>
                <h3 className="mt-20 " style={{ color: `var(--color-primary)` }}>
                  phase {i + 1}
                </h3>
                <div className={`border border--danger`} style={{ padding: `.5rem`, background: `${activePhase === `phase${i + 1}` && 'var(--color-primary)'}`, color: `${activePhase === `phase${i + 1}` && 'var(--white)'}` }}>
                  <p>
                    Background: <b>{item.background}</b>
                  </p>
                  <p title="Max Mint Per Wallet">
                    Max mint per wallet: <b>{web3.utils.toNumber(item.maxMintPerWallet)} seals</b>
                  </p>
                  <p>
                    Price:
                    <b className="ml-10 badge badge-dark">
                      {new Intl.NumberFormat().format(web3.utils.fromWei(web3.utils.toNumber(item.price), `ether`))}
                      {item.tokenAddress == `0x0000000000000000000000000000000000000000` ? ` LYX` : ` FISH`}
                    </b>
                  </p>
                  <p title={item.tokenAddress}>Token Address</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  )
}

const WalletBalance = () => {
  const [balance, setBalance] = useState()
  const auth = useUpProvider()
  const web3 = new Web3(auth.provider)
  const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
  const contractFish = new web3.eth.Contract(ABILSP7, process.env.NEXT_PUBLIC_CONTRACT_FISH)
  const _ = web3.utils

  const getWalletBalance = async (wallet) => {
    const balance = await web3.eth.getBalance(wallet)
    return parseFloat(web3.utils.fromWei(balance, `ether`)).toFixed(2)
  }

  useEffect(() => {
    getWalletBalance(auth.accounts[0]).then((result) => {
      setBalance(result)
    })
  }, [])

  if (!balance) return <>0</>
  return <b>{new Intl.NumberFormat().format(balance)}</b>
}

const WalletFishBalance = () => {
  const [balance, setBalance] = useState()
  const auth = useUpProvider()
  const web3 = new Web3(auth.provider)
  const contract = new web3.eth.Contract(ABI, process.env.NEXT_PUBLIC_CONTRACT)
  const contractFish = new web3.eth.Contract(ABILSP7, process.env.NEXT_PUBLIC_CONTRACT_FISH)
  const _ = web3.utils

  const getWalletFishBalance = async (wallet) => {
    const balance = await contractFish.methods.balanceOf(wallet).call()
    return parseFloat(web3.utils.fromWei(balance, `ether`)).toFixed(2)
  }

  useEffect(() => {
    getWalletFishBalance(auth.accounts[0]).then((result) => {
      setBalance(result)
    })
  }, [])

  if (!balance) return <>0</>
  return <b>{new Intl.NumberFormat().format(balance)}</b>
}
