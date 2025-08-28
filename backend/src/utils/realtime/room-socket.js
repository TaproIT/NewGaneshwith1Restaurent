
export const setupRoomSocket = (io) => {
    // In-memory map to track temporary locks
    const tempLocks = new Map(); // roomId => socketId

    io.on("connection", (socket) => {
        console.log("User (Room Booking) connected:", socket.id);

        // Lock a room (someone selected a room)
        socket.on("lockRoom", (roomId) => {
            // If already locked by someone else, ignore
            if (tempLocks.has(roomId)) return;

            // Lock the room in memory
            tempLocks.set(roomId, socket.id);

            // Notify everyone else
            socket.broadcast.emit("roomLocked", roomId);
        });

        // Unlock a room (someone deselected a room)
        socket.on("unlockRoom", (roomId) => {
            if (tempLocks.get(roomId) !== socket.id) return;

            tempLocks.delete(roomId);
            socket.broadcast.emit("roomUnlocked", roomId);
        });

        // Auto-unlock rooms if user disconnects
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);

            for (const [roomId, lockerSocketId] of tempLocks.entries()) {
                if (lockerSocketId === socket.id) {
                    tempLocks.delete(roomId);
                    socket.broadcast.emit("roomUnlocked", roomId);
                }
            }
        });
    });
};

// import Room from "../models/Room.js";
//
// export const setupRoomSocket = (io) => {
//     io.on("connection", (socket) => {
//         console.log("User (Room Booking) connected:", socket.id);
//
//         // Lock a room (someone selected a room)
//         socket.on("lockRoom", async (roomId) => {
//             try {
//                 const room = await Room.findById(roomId);
//                 if (!room || room.isBooked) return; // Already booked
//
//                 room.isBooked = true;
//                 await room.save();
//
//                 // Broadcast to everyone else
//                 socket.broadcast.emit("roomLocked", roomId);
//             } catch (err) {
//                 console.error(err);
//             }
//         });
//
//         // Unlock a room (someone deselected a room)
//         socket.on("unlockRoom", async (roomId) => {
//             try {
//                 const room = await Room.findById(roomId);
//                 if (!room || !room.isBooked) return;
//
//                 room.isBooked = false;
//                 await room.save();
//
//                 socket.broadcast.emit("roomUnlocked", roomId);
//             } catch (err) {
//                 console.error(err);
//             }
//         });
//
//         socket.on("disconnect", () => {
//             console.log("User disconnected:", socket.id);
//         });
//     });
// };