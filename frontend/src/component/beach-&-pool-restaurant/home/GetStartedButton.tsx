import type { RootState } from '@/app/store'
import { Button } from '@/components/ui/button'
import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const GetStartedButton: React.FC = () => {
  //const dispatch = useDispatch<AppDispatch>();

  const initialOrderDetails = useSelector(
    (state:RootState) => state.order
  );

  const navigate = useNavigate();

  const handleInitialOrderDetails = () => {
     if (initialOrderDetails.serviceType === "dine-in") {
        navigate("/beach-restaurant/tables");
        return;
     }
     navigate("/beach-restaurant/menu");
  }
  
  const disabled = initialOrderDetails.guestName === "" || initialOrderDetails.roomNumber === "";
  return (
    <div className="mt-5 flex items-center justify-end">
      <Button 
        onClick={handleInitialOrderDetails}
        className="px-20 py-6 text-[1rem] cursor-pointer"
        disabled={disabled}
      >
        Get Started
      </Button>
    </div>
  )
}

export default GetStartedButton
