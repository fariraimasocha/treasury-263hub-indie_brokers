import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const payoutschema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundRequest",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    payoutdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payoutdAt: {
      type: Date,
      default: Date.now,
    },
    transactionReference: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const payout = refreshModel("payout", payoutschema);
export default payout;