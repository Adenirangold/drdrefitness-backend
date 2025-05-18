import { Server } from "socket.io";

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("Admin app connected to Socket.IO:", socket.id);

    // Handle custom events or authentication if needed
    socket.on("authenticate", (token) => {
      // Add token verification logic here if required
      console.log("Socket authenticated with token:", token);
    });

    socket.on("disconnect", () => {
      console.log("Admin app disconnected:", socket.id);
    });
  });

  // Export io for use in controllers (e.g., to emit events)
  return io;
};

// Function to emit check-in event (to be called from controllers)
export const emitCheckIn = (
  io: Server,
  userId: string,
  name: string,
  status: string,
  message: string,
  checkInTime: Date
) => {
  io.emit("checkin", {
    userId,
    name,
    status,
    message,
    checkInTime: checkInTime.toISOString(),
  });
};

// Function to emit check-out event
export const emitCheckOut = (
  io: Server,
  userId: string,
  name: string,
  status: string,
  message: string,
  checkOutTime: Date
) => {
  io.emit("checkout", {
    userId,
    name,
    status,
    message,
    checkOutTime: checkOutTime.toISOString(),
  });
};
