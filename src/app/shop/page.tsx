import { Suspense } from 'react'
import ShopContent from './ShopContent'
import SpinningLoader from '../Components/SpinningLoader'

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <SpinningLoader size="large" text="Loading shop..." />
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}