import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const requestSchema = new mongoose.Schema(
  {
    dept: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    quater: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

  },
  {
    timestamps: true,
  }
);
const Request = refreshModel("Request", requestSchema);
export default Request;