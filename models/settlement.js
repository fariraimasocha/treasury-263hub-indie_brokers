import mongoose from "mongoose";
import { refreshModel } from "@/utils/modelUtils";

const settlementSchema = new mongoose.Schema(
  {
    disbursementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disbursement",
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundRequest",
      required: true,
    },
    initialBudget: {
      type: Number,
      required: true,
    },
    amountUsed: {
      type: Number,
      required: true,
    },
    remainingBalance: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    attachments: [{
      type: String,
    }],
    settledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    settledAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "disputed"],
      default: "completed",
    },
  },
  {
    timestamps: true,
  }
);

const Settlement = refreshModel("Settlement", settlementSchema);
export default Settlement;