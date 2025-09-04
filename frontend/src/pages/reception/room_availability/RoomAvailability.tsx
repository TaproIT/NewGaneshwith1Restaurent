// import RoomDetails from "@/component/room/RoomDetails";
// import RoomGrid from "@/component/room/RoomGrid";
// import { useEffect, useState } from "react";
// import type { Room } from "@/types/roomTypes";
// import { useSelector } from "react-redux";
// import type { RootState } from "@/app/store";
// import { api } from "@/api/axios";
// import { useLocation } from "react-router-dom";

// // --- Skeleton for RoomGrid ---
// const RoomGridSkeleton = () => (
//   <div className="grid grid-cols-4 gap-5">
//     {Array.from({ length: 8 }).map((_, i) => (
//       <div
//         key={i}
//         className="h-32 bg-gray-200 rounded-lg animate-pulse"
//       />
//     ))}
//   </div>
// );

// const RoomAvailability = () => {
//   const [rooms, setRooms] = useState<Room[]>([]);
//   const [loadingRooms, setLoadingRooms] = useState(true);
//   const [viewedRoom, setViewedRoom] = useState<Room | null>(null);

//   const location = useLocation(); // detect route change

//   useEffect(() => {
//     setViewedRoom(null); // reset whenever route changes
//   }, [location.pathname]);

//   const handleRoomClick = (room: Room) => {
//     setViewedRoom(room); // only set viewed room, no selection or booking
//   };

//   const guestDetails = useSelector(
//     (state: RootState) => state.onboarding.step01Data
//   );

//   useEffect(() => {
//     const fetchRooms = async () => {
//       try {
//         const res = await api.get("/room");
//         setRooms(res.data);
//       } catch (err) {
//         console.error("Failed to fetch rooms:", err);
//       } finally {
//         setLoadingRooms(false);
//       }
//     };

//     fetchRooms();
//   }, []);

//   return (
//     <div className="grid grid-cols-4 gap-5">
//       {/* Left side: room grid */}
//       <div className="col-span-3 h-screen overflow-x-auto">
//         {loadingRooms ? (
//           <RoomGridSkeleton />
//         ) : (
//           <RoomGrid
//             rooms={rooms}
//             selectedRooms={[]} // no selected rooms needed
//             onRoomClick={handleRoomClick} // only for viewing
//             readOnly={true}
//           />
//         )}
//       </div>

//       {/* Right side: room details */}
//       <div className="col-span-1 overflow-hidden">
//         <RoomDetails
//           viewedRoom={viewedRoom}
//           selectedRooms={[]} // empty, no booking
//           guestDetails={guestDetails} // just a dummy or optional
//           grandTotal={0} // not used
//           isModalOpen={false} // no modal
//           onRemoveRoom={() => {}} // do nothing
//           onBookRoom={() => {}} // do nothing
//           onCloseModal={() => {}} // do nothing
//           readOnly={true}
//           checkout={false}
//           invoice={false}
//           switchRoom={false}
// <<<<<<< HEAD
// =======
//           totalDays={0}
//           whatsAppId=""
// >>>>>>> 914f283793a5f27f4772c339f84dc9ca5436d69e
//         />
//       </div>
//     </div>
//   );
// };

// export default RoomAvailability;




import RoomDetails from "@/component/room/RoomDetails";
import RoomGrid from "@/component/room/RoomGrid";
import { useEffect, useState } from "react";
import type { Room } from "@/types/roomTypes";
import { useSelector } from "react-redux";
import type { RootState } from "@/app/store";
import { api } from "@/api/axios";
import { useLocation } from "react-router-dom";

// --- Skeleton for RoomGrid ---
const RoomGridSkeleton = () => (
  <div className="grid grid-cols-4 gap-5">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-32 bg-gray-200 rounded-lg animate-pulse"
      />
    ))}
  </div>
);

const RoomAvailability = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [viewedRoom, setViewedRoom] = useState<Room | null>(null);

  const location = useLocation(); // detect route change

  useEffect(() => {
    setViewedRoom(null); // reset whenever route changes
  }, [location.pathname]);

  const handleRoomClick = (room: Room) => {
    setViewedRoom(room); // only set viewed room, no selection or booking
  };

  const guestDetails = useSelector(
    (state: RootState) => state.onboarding.step01Data
  );

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await api.get("/room");
        setRooms(res.data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-5">
      {/* Left side: room grid */}
      <div className="col-span-3 h-screen overflow-x-auto">
        {loadingRooms ? (
          <RoomGridSkeleton />
        ) : (
          <RoomGrid
            rooms={rooms}
            selectedRooms={[]} // no selected rooms needed
            onRoomClick={handleRoomClick} // only for viewing
            readOnly={true}
          />
        )}
      </div>

      {/* Right side: room details */}
      <div className="col-span-1 overflow-hidden">
        <RoomDetails
          viewedRoom={viewedRoom}
          selectedRooms={[]} // empty, no booking
          guestDetails={guestDetails} // just a dummy or optional
          grandTotal={0} // not used
          isModalOpen={false} // no modal
          onRemoveRoom={() => {}} // do nothing
          onBookRoom={() => {}} // do nothing
          onCloseModal={() => {}} // do nothing
          readOnly={true}
          checkout={false}
          invoice={false}
          switchRoom={false}
          totalDays={0}
          whatsAppId=""
        />
      </div>
    </div>
  );
};

export default RoomAvailability;
