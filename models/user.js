import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const User = refreshModel("User", userSchema);

export default User;
