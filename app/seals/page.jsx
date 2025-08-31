import { Suspense } from 'react'
import PageTitle from '../../components/PageTitle'
import Profiles from './_components/Profiles'
import styles from './page.module.scss'

export default async function Page({ params, searchParams }) {
  return (
    <div className={`${styles.page} ms-motion-slideDownIn`}>
      <div className={`__container`} data-width={`large`}>
        <PageTitle title={`Inbox`} path={`../`} />
        <Suspense fallback={<div>Loading...</div>}>
          <Profiles />
        </Suspense>
      </div>
    </div>
  )
}