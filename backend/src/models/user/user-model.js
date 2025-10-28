import mongoose from "mongoose";
import { userRoles } from "../../utils/enums/user-role.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: [
        userRoles.SUPER_ADMIN.value,
        userRoles.ADMIN.value,
        userRoles.RECEPTION.value,
        userRoles.BEACH_RESTAURANT_STAFF.value,
        userRoles.POOL_RESTAURANT_STAFF.value,
      ],
    },
    refreshToken: {
      type: String,
    },
    tempPassword: {
      type: String
    },
    tempPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
    
export default User;