'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Footer.module.scss'

const pages = [
  {
    name: `Tap`,
    path: '',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M419-80q-28 0-52.5-12T325-126L107-403l19-20q20-21 48-25t52 11l74 45v-328q0-17 11.5-28.5T340-760q17 0 29 11.5t12 28.5v200h299q50 0 85 35t35 85v160q0 66-47 113T640-80H419ZM167-620q-13-22-20-47.5t-7-52.5q0-83 58.5-141.5T340-920q83 0 141.5 58.5T540-720q0 27-7 52.5T513-620l-69-40q8-14 12-28.5t4-31.5q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 17 4 31.5t12 28.5l-69 40Z"/></svg>`,
    disabled: false,
  },
  {
    name: `Seals`,
    path: 'seals',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-images-icon lucide-images"><path d="m22 11-1.296-1.296a2.4 2.4 0 0 0-3.408 0L11 16"/><path d="M4 8a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2"/><circle cx="13" cy="7" r="1" fill="currentColor"/><rect x="8" y="2" width="14" height="14" rx="2"/></svg>`,
    disabled: false,
  },
  {
    name: `Booster`,
    path: 'booster',
    icon: `<svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.88475 17.8408V6.84082H5.7115V17.8408H0.88475ZM7.4905 17.8408V0.84082H12.5095V17.8408H7.4905ZM14.2885 17.8408V8.84082H19.1152V17.8408H14.2885Z"/></svg>`,
    disabled: false,
  },
  {
    name: `Mint`,
    path: 'mint',
    icon: `<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5307 13.5C1.85186 13.5 1.32603 13.2602 0.953196 12.7807C0.580529 12.3012 0.439696 11.7359 0.530696 11.0848L1.59995 3.527C1.73061 2.64967 2.1187 1.92583 2.7642 1.3555C3.40986 0.785166 4.17178 0.5 5.04995 0.5H14.9499C15.8281 0.5 16.59 0.785166 17.2357 1.3555C17.8812 1.92583 18.2693 2.64967 18.3999 3.527L19.4692 11.0848C19.5602 11.7359 19.4194 12.3012 19.0467 12.7807C18.6739 13.2602 18.148 13.5 17.4692 13.5C17.1834 13.5 16.9209 13.4519 16.6817 13.3557C16.4425 13.2596 16.2204 13.1089 16.0154 12.9038L13.6114 10.5H6.38845L3.98445 12.9038C3.77945 13.1089 3.55736 13.2596 3.3182 13.3557C3.07903 13.4519 2.81653 13.5 2.5307 13.5ZM14.9999 7.90375C15.2513 7.90375 15.4648 7.816 15.6404 7.6405C15.8159 7.46483 15.9037 7.25133 15.9037 7C15.9037 6.74867 15.8159 6.53517 15.6404 6.3595C15.4648 6.184 15.2513 6.09625 14.9999 6.09625C14.7486 6.09625 14.5351 6.184 14.3594 6.3595C14.1839 6.53517 14.0962 6.74867 14.0962 7C14.0962 7.25133 14.1839 7.46483 14.3594 7.6405C14.5351 7.816 14.7486 7.90375 14.9999 7.90375ZM12.9999 4.90375C13.2513 4.90375 13.4648 4.816 13.6404 4.6405C13.8159 4.46483 13.9037 4.25133 13.9037 4C13.9037 3.74867 13.8159 3.53517 13.6404 3.3595C13.4648 3.184 13.2513 3.09625 12.9999 3.09625C12.7486 3.09625 12.5351 3.184 12.3594 3.3595C12.1839 3.53517 12.0962 3.74867 12.0962 4C12.0962 4.25133 12.1839 4.46483 12.3594 4.6405C12.5351 4.816 12.7486 4.90375 12.9999 4.90375ZM5.9037 7.84625H7.0962V6.09625H8.8462V4.90375H7.0962V3.15375H5.9037V4.90375H4.1537V6.09625H5.9037V7.84625Z" fill="#1F1F1F"/></svg>`,
    disabled: false,
  },
]

export default function Footer() {
  const pathname = usePathname()

  /**
   * Get the last visited page
   * @returns string
   */
  const getLastVisitedPage = async () => await JSON.parse(localStorage.getItem(`lastVisitedPage`))

  return (
    <footer className={`${styles.footer} `}>
      <ul className={`d-flex flex-row aling-items-center justify-content-between`}>
        {pages &&
          pages
            .filter((filterItem) => !filterItem.disabled)
            .map((link, i) => {
              return (
                <li key={i}>
                  <Link href={`/${link.path}`} data-active={pathname === `/${link.path}` ? true : false}>
                    {/* <div className={`d-f-c`} dangerouslySetInnerHTML={{ __html: link.icon }} /> */}
                    <span>{link.name}</span>
                  </Link>
                </li>
              )
            })}
      </ul>
    </footer>
  )
}
