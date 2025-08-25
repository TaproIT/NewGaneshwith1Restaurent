import type { AppDispatch, RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

const GetStartedButton: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const initialOrderDetails = useSelector(
    (state:RootState) => state.order
  );

  const handleInitialOrderDetails = () => {
    console.log(initialOrderDetails);
  }

  return (
    <div className="mt-5 flex items-center justify-end">
      <Button 
        onClick={handleInitialOrderDetails}
        className="px-20 py-6 text-[1rem]"
      >
        Get Started
      </Button>
    </div>
  )
}

export default GetStartedButton
